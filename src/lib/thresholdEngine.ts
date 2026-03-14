import { THRESHOLDS } from '../data/healthThresholds'
import type { HealthCondition, MealData, ConditionVerdict, ConditionFlag, MealVerdict, VerdictLevel } from '../types'

function getTotalNutrient(meal: MealData, key: keyof typeof meal.foods[0]['nutrients']): number {
  return meal.foods.reduce((sum, food) => {
    const per100g = food.nutrients[key] as number
    return sum + (per100g * food.estimated_grams) / 100
  }, 0)
}

function evaluateCondition(meal: MealData, condition: HealthCondition): ConditionVerdict {
  const thresholds = THRESHOLDS[condition]
  const flags: ConditionFlag[] = []
  let worst: VerdictLevel = 'safe'

  for (const t of thresholds) {
    const value = getTotalNutrient(meal, t.nutrient as keyof typeof meal.foods[0]['nutrients'])

    if (t.direction === 'lower_is_better') {
      if (t.avoidAbove !== undefined && value > t.avoidAbove) {
        flags.push({ text: `${t.label}: ${Math.round(value)}${t.unit} (limit ${t.avoidAbove}${t.unit})`, source: t.source, url: t.sourceUrl })
        worst = 'avoid'
      } else if (t.cautionAbove !== undefined && value > t.cautionAbove) {
        flags.push({ text: `${t.label}: ${Math.round(value)}${t.unit} (limit ${t.cautionAbove}${t.unit})`, source: t.source, url: t.sourceUrl })
        if (worst !== 'avoid') worst = 'caution'
      }
    } else {
      if (t.cautionBelow !== undefined && value < t.cautionBelow) {
        flags.push({ text: `Low ${t.label}: ${Math.round(value)}${t.unit} (target ≥${t.cautionBelow}${t.unit})`, source: t.source, url: t.sourceUrl })
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
