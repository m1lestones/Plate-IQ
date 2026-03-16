import { THRESHOLDS } from '../data/healthThresholds'
import { NHANES_CONTEXT } from '../data/nhanesData'
import { getSwapSuggestion } from '../data/swapSuggestions'
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

function evaluateCondition(meal: MealData, condition: HealthCondition): ConditionVerdict {
  const thresholds = THRESHOLDS[condition]
  const flags: ConditionFlag[] = []
  let worst: VerdictLevel = 'safe'

  for (const t of thresholds) {
    const value = getTotalNutrient(meal, t.nutrient as keyof typeof meal.foods[0]['nutrients'])

    const nhanesRef = NHANES_CONTEXT[condition]?.[t.nutrient]
    const population = nhanesRef
      ? { stat: nhanesRef.stat, source: nhanesRef.source, url: nhanesRef.url, sampleSize: nhanesRef.sampleSize }
      : undefined

    if (t.direction === 'lower_is_better') {
      if (t.avoidAbove !== undefined && value > t.avoidAbove) {
        const topOffenders = getTopOffenders(meal, t.nutrient, t.unit)
        const swapSuggestion = getSwapSuggestion(t.nutrient, topOffenders[0]?.category ?? 'default')
        flags.push({ text: `${t.label}: ${Math.round(value)}${t.unit} (limit ${t.avoidAbove}${t.unit})`, source: t.source, url: t.sourceUrl, topOffenders, swapSuggestion, population })
        worst = 'avoid'
      } else if (t.cautionAbove !== undefined && value > t.cautionAbove) {
        const topOffenders = getTopOffenders(meal, t.nutrient, t.unit)
        const swapSuggestion = getSwapSuggestion(t.nutrient, topOffenders[0]?.category ?? 'default')
        flags.push({ text: `${t.label}: ${Math.round(value)}${t.unit} (limit ${t.cautionAbove}${t.unit})`, source: t.source, url: t.sourceUrl, topOffenders, swapSuggestion, population })
        if (worst !== 'avoid') worst = 'caution'
      }
    } else {
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
