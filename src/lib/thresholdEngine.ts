import { THRESHOLDS } from '../data/healthThresholds'
import { NHANES_CONTEXT } from '../data/nhanesData'
import { getSwapSuggestion } from '../data/swapSuggestions'
import { getFoodGILevel } from '../data/glycemicIndex'
import type { HealthCondition, MealData, ConditionVerdict, ConditionFlag, MealVerdict, VerdictLevel } from '../types'

function getTotalNutrient(meal: MealData, key: keyof typeof meal.foods[0]['nutrients']): number {
  return meal.foods.reduce((sum, food) => {
    const per100g = food.nutrients[key] as number
    return sum + (per100g * food.estimated_grams) / 100
  }, 0)
}

function getTopOffenders(meal: MealData, nutrientKey: string, unit: string) {
  return meal.foods
    .map(food => ({
      name: food.name,
      category: food.category,
      value: (food.nutrients[nutrientKey as keyof typeof food.nutrients] as number * food.estimated_grams) / 100,
    }))
    .filter(f => f.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(f => ({ name: f.name, category: f.category, amount: `${Math.round(f.value)}${unit}` }))
}

/**
 * Calculates the average NOVA level of the meal (1-4).
 * NOVA 1 = whole unprocessed, NOVA 4 = ultra-processed.
 */
function getAvgNova(meal: MealData): number {
  if (meal.foods.length === 0) return 1
  const total = meal.foods.reduce((sum, f) => sum + (f.nova_level ?? 1), 0)
  return total / meal.foods.length
}

/**
 * Returns a threshold multiplier based on NOVA level.
 * Whole foods get relaxed thresholds, processed foods get strict ones.
 *
 * NOVA 1-2 (whole/minimally processed): 1.6x relaxed
 * NOVA 2-3 (mixed):                     1.2x relaxed
 * NOVA 3-4 (processed/ultra-processed): 1.0x strict (default)
 */
function getNovaMultiplier(avgNova: number): number {
  if (avgNova <= 1.5) return 1.6   // Vegetables, fruits, whole grains — very relaxed
  if (avgNova <= 2.5) return 1.3   // Minimally processed — somewhat relaxed
  if (avgNova <= 3.5) return 1.0   // Processed — standard thresholds
  return 0.85                       // Ultra-processed (fast food) — even stricter
}

/**
 * Checks if a meal is primarily made of whole fruits/vegetables.
 * Used to skip "low potassium" warnings on clearly healthy meals.
 */
function isMostlyWholeFoodsOrVegetables(meal: MealData): boolean {
  const wholeCount = meal.foods.filter(f => (f.nova_level ?? 1) <= 2).length
  return wholeCount / meal.foods.length >= 0.7
}

/**
 * For diabetes: check if carbs come from high-GI fruits vs whole grains/vegetables.
 * High-GI fruits still get a gentle caution. Low/medium GI fruits are safe.
 */
function getDiabetesGIBreakdown(meal: MealData): { hasHighGI: boolean; hasMediumGI: boolean } {
  let hasHighGI = false
  let hasMediumGI = false

  for (const food of meal.foods) {
    const gi = getFoodGILevel(food.name)
    if (gi === 'high') hasHighGI = true
    if (gi === 'medium') hasMediumGI = true
  }

  return { hasHighGI, hasMediumGI }
}

function evaluateCondition(meal: MealData, condition: HealthCondition): ConditionVerdict {
  const thresholds = THRESHOLDS[condition]
  const flags: ConditionFlag[] = []
  let worst: VerdictLevel = 'safe'

  const avgNova = getAvgNova(meal)
  const novaMultiplier = getNovaMultiplier(avgNova)
  const isWholeFoodMeal = isMostlyWholeFoodsOrVegetables(meal)

  for (const t of thresholds) {
    const value = getTotalNutrient(meal, t.nutrient as keyof typeof meal.foods[0]['nutrients'])

    const nhanesRef = NHANES_CONTEXT[condition]?.[t.nutrient]
    const population = nhanesRef
      ? { stat: nhanesRef.stat, source: nhanesRef.source, url: nhanesRef.url, sampleSize: nhanesRef.sampleSize }
      : undefined

    if (t.direction === 'lower_is_better') {
      // Apply NOVA multiplier — whole food meals get relaxed limits
      const adjustedCaution = t.cautionAbove !== undefined ? t.cautionAbove * novaMultiplier : undefined
      const adjustedAvoid   = t.avoidAbove   !== undefined ? t.avoidAbove   * novaMultiplier : undefined

      // Special case: diabetes + carbs — check if source is high-GI fruit vs whole food
      if (condition === 'type2_diabetes' && t.nutrient === 'carbs_g' && isWholeFoodMeal) {
        const { hasHighGI, hasMediumGI } = getDiabetesGIBreakdown(meal)

        if (!hasHighGI && !hasMediumGI) {
          // All carbs from vegetables/whole grains/low-GI foods — skip carb flag entirely
          continue
        }
        if (hasMediumGI && !hasHighGI) {
          // Medium GI foods like oatmeal, pineapple, mango — only caution, never avoid
          if (adjustedCaution !== undefined && value > adjustedCaution) {
            const topOffenders = getTopOffenders(meal, t.nutrient, t.unit)
            flags.push({
              text: `${t.label}: ${Math.round(value)}${t.unit} — moderate GI foods present (limit ${Math.round(adjustedCaution)}${t.unit})`,
              source: t.source, url: t.sourceUrl, topOffenders, population
            })
            if (worst !== 'avoid') worst = 'caution'
          }
          continue
        }
        // High GI foods (white bread, instant rice, watermelon) — apply normal rules below
      }

      // Special case: diabetes + added_sugar — skip if meal is whole food (no added sugar)
      if (condition === 'type2_diabetes' && t.nutrient === 'added_sugar_g' && isWholeFoodMeal) {
        // Only flag if value is genuinely high even for whole foods
        const strictCaution = (t.cautionAbove ?? 0) * 2
        const strictAvoid   = (t.avoidAbove ?? 0) * 2
        if (value > strictAvoid) {
          const topOffenders = getTopOffenders(meal, t.nutrient, t.unit)
          const swapSuggestion = getSwapSuggestion(t.nutrient, topOffenders[0]?.category ?? 'default')
          flags.push({ text: `${t.label}: ${Math.round(value)}${t.unit} (limit ${Math.round(strictAvoid)}${t.unit})`, source: t.source, url: t.sourceUrl, topOffenders, swapSuggestion, population })
          worst = 'avoid'
        } else if (value > strictCaution) {
          const topOffenders = getTopOffenders(meal, t.nutrient, t.unit)
          const swapSuggestion = getSwapSuggestion(t.nutrient, topOffenders[0]?.category ?? 'default')
          flags.push({ text: `${t.label}: ${Math.round(value)}${t.unit} (limit ${Math.round(strictCaution)}${t.unit})`, source: t.source, url: t.sourceUrl, topOffenders, swapSuggestion, population })
          if (worst !== 'avoid') worst = 'caution'
        }
        continue
      }

      if (adjustedAvoid !== undefined && value > adjustedAvoid) {
        const topOffenders = getTopOffenders(meal, t.nutrient, t.unit)
        const swapSuggestion = getSwapSuggestion(t.nutrient, topOffenders[0]?.category ?? 'default')
        flags.push({ text: `${t.label}: ${Math.round(value)}${t.unit} (limit ${Math.round(adjustedAvoid)}${t.unit})`, source: t.source, url: t.sourceUrl, topOffenders, swapSuggestion, population })
        worst = 'avoid'
      } else if (adjustedCaution !== undefined && value > adjustedCaution) {
        const topOffenders = getTopOffenders(meal, t.nutrient, t.unit)
        const swapSuggestion = getSwapSuggestion(t.nutrient, topOffenders[0]?.category ?? 'default')
        flags.push({ text: `${t.label}: ${Math.round(value)}${t.unit} (limit ${Math.round(adjustedCaution)}${t.unit})`, source: t.source, url: t.sourceUrl, topOffenders, swapSuggestion, population })
        if (worst !== 'avoid') worst = 'caution'
      }

    } else {
      // higher_is_better (e.g. potassium, fiber)
      // Skip "low potassium/fiber" warnings on whole food meals — vegetables naturally vary
      if (isWholeFoodMeal) continue

      if (t.cautionBelow !== undefined && value < t.cautionBelow) {
        const swapSuggestion = getSwapSuggestion(t.nutrient, 'default')
        flags.push({ text: `Low ${t.label}: ${Math.round(value)}${t.unit} (target ≥${t.cautionBelow}${t.unit})`, source: t.source, url: t.sourceUrl, swapSuggestion, population })
        if (worst !== 'avoid') worst = 'caution'
      }
    }
  }

  return { condition, verdict: worst, flags }
}

export function evaluateMeal(meal: MealData, conditions: HealthCondition[]): Omit<MealVerdict, 'aiInsight'> {
  if (conditions.length === 0) {
    return { overall: 'safe', byCondition: [] }
  }

  const byCondition = conditions.map(c => evaluateCondition(meal, c))
  const overall: VerdictLevel =
    byCondition.some(c => c.verdict === 'avoid') ? 'avoid' :
    byCondition.some(c => c.verdict === 'caution') ? 'caution' : 'safe'

  return { overall, byCondition }
}
