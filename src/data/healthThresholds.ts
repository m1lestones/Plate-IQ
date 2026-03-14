/**
 * Condition-specific nutrient thresholds per meal (assuming ~3 meals/day)
 * Sources: AHA, ACC, ADA, NIH NHLBI, WHO dietary guidelines
 */

import type { TFunction } from 'i18next'
import type { HealthCondition, VerdictLevel } from '../types'

interface NutrientThreshold {
  nutrient: string
  label: string
  cautionAbove?: number  // warn if exceeds
  avoidAbove?: number    // flag avoid if exceeds
  cautionBelow?: number  // warn if under (beneficial nutrient)
  unit: string
  direction: 'lower_is_better' | 'higher_is_better'
}

export const THRESHOLDS: Record<HealthCondition, NutrientThreshold[]> = {
  hypertension: [
    // AHA: < 1,500mg sodium/day → ~500mg/meal
    { nutrient: 'sodium_mg', label: 'Sodium', cautionAbove: 400, avoidAbove: 600, unit: 'mg', direction: 'lower_is_better' },
    // Potassium is beneficial for hypertension (AHA: 3,500-5,000mg/day)
    { nutrient: 'potassium_mg', label: 'Potassium', cautionBelow: 300, unit: 'mg', direction: 'higher_is_better' },
  ],
  high_cholesterol: [
    // AHA: saturated fat < 6% of 2,000 cal = 13.3g/day → ~4.4g/meal
    { nutrient: 'saturated_fat_g', label: 'Saturated Fat', cautionAbove: 4, avoidAbove: 7, unit: 'g', direction: 'lower_is_better' },
    // AHA: dietary cholesterol < 300mg/day → ~100mg/meal
    { nutrient: 'cholesterol_mg', label: 'Cholesterol', cautionAbove: 80, avoidAbove: 150, unit: 'mg', direction: 'lower_is_better' },
    // Fiber is beneficial (AHA: 25-30g/day)
    { nutrient: 'fiber_g', label: 'Fiber', cautionBelow: 3, unit: 'g', direction: 'higher_is_better' },
  ],
  type2_diabetes: [
    // ADA: 45-60g carbs/meal
    { nutrient: 'carbs_g', label: 'Carbohydrates', cautionAbove: 50, avoidAbove: 75, unit: 'g', direction: 'lower_is_better' },
    // AHA: added sugar < 25g/day (women) / 36g (men) → ~8g/meal
    { nutrient: 'added_sugar_g', label: 'Added Sugar', cautionAbove: 8, avoidAbove: 15, unit: 'g', direction: 'lower_is_better' },
    // Fiber slows glucose absorption (ADA: 14g per 1,000 cal)
    { nutrient: 'fiber_g', label: 'Fiber', cautionBelow: 4, unit: 'g', direction: 'higher_is_better' },
  ],
  stroke_risk: [
    // NIH NHLBI / AHA stroke prevention: sodium < 1,500mg/day
    { nutrient: 'sodium_mg', label: 'Sodium', cautionAbove: 400, avoidAbove: 600, unit: 'mg', direction: 'lower_is_better' },
    // Saturated fat drives LDL → stroke risk
    { nutrient: 'saturated_fat_g', label: 'Saturated Fat', cautionAbove: 4, avoidAbove: 7, unit: 'g', direction: 'lower_is_better' },
    // Potassium protective (WHO: 3,510mg/day)
    { nutrient: 'potassium_mg', label: 'Potassium', cautionBelow: 300, unit: 'mg', direction: 'higher_is_better' },
  ],
}

// Helper function to get condition labels with i18n support
export const CONDITION_LABELS = (t: TFunction): Record<HealthCondition, string> => ({
  hypertension: t('healthConditions.hypertension'),
  high_cholesterol: t('healthConditions.high_cholesterol'),
  type2_diabetes: t('healthConditions.type2_diabetes'),
  stroke_risk: t('healthConditions.stroke_risk'),
})

export const CONDITION_COLORS: Record<VerdictLevel, string> = {
  safe: 'text-green-400',
  caution: 'text-yellow-400',
  avoid: 'text-red-400',
}

export const CONDITION_BG: Record<VerdictLevel, string> = {
  safe: 'bg-green-500/10 border-green-500/30',
  caution: 'bg-yellow-500/10 border-yellow-500/30',
  avoid: 'bg-red-500/10 border-red-500/30',
}
