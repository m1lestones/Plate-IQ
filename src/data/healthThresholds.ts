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
  source: string
  sourceUrl: string
}

export const THRESHOLDS: Record<HealthCondition, NutrientThreshold[]> = {
  hypertension: [
    {
      nutrient: 'sodium_mg', label: 'Sodium', cautionAbove: 400, avoidAbove: 600, unit: 'mg', direction: 'lower_is_better',
      source: 'AHA', sourceUrl: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sodium/how-much-sodium-should-i-eat-per-day'
    },
    {
      nutrient: 'potassium_mg', label: 'Potassium', cautionBelow: 300, unit: 'mg', direction: 'higher_is_better',
      source: 'AHA', sourceUrl: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/potassium'
    },
  ],
  high_cholesterol: [
    {
      nutrient: 'saturated_fat_g', label: 'Saturated Fat', cautionAbove: 4, avoidAbove: 7, unit: 'g', direction: 'lower_is_better',
      source: 'AHA', sourceUrl: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/saturated-fats'
    },
    {
      nutrient: 'cholesterol_mg', label: 'Cholesterol', cautionAbove: 80, avoidAbove: 150, unit: 'mg', direction: 'lower_is_better',
      source: 'AHA', sourceUrl: 'https://www.heart.org/en/health-topics/cholesterol/prevention-and-treatment-of-high-cholesterol-hyperlipidemia'
    },
    {
      nutrient: 'fiber_g', label: 'Fiber', cautionBelow: 3, unit: 'g', direction: 'higher_is_better',
      source: 'AHA', sourceUrl: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/whole-grains-refined-grains-and-dietary-fiber'
    },
  ],
  type2_diabetes: [
    {
      nutrient: 'carbs_g', label: 'Carbohydrates', cautionAbove: 50, avoidAbove: 75, unit: 'g', direction: 'lower_is_better',
      source: 'ADA', sourceUrl: 'https://diabetes.org/food-nutrition/understanding-carbs'
    },
    {
      nutrient: 'added_sugar_g', label: 'Added Sugar', cautionAbove: 8, avoidAbove: 15, unit: 'g', direction: 'lower_is_better',
      source: 'AHA', sourceUrl: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/added-sugars'
    },
    {
      nutrient: 'fiber_g', label: 'Fiber', cautionBelow: 4, unit: 'g', direction: 'higher_is_better',
      source: 'ADA', sourceUrl: 'https://diabetes.org/food-nutrition/eating-healthy/fiber'
    },
  ],
  stroke_risk: [
    {
      nutrient: 'sodium_mg', label: 'Sodium', cautionAbove: 400, avoidAbove: 600, unit: 'mg', direction: 'lower_is_better',
      source: 'NIH NHLBI', sourceUrl: 'https://www.nhlbi.nih.gov/health/heart-healthy-living/healthy-foods'
    },
    {
      nutrient: 'saturated_fat_g', label: 'Saturated Fat', cautionAbove: 4, avoidAbove: 7, unit: 'g', direction: 'lower_is_better',
      source: 'AHA', sourceUrl: 'https://www.heart.org/en/health-topics/stroke/life-after-stroke/stroke-rehabilitation/risk-factor-management-after-stroke'
    },
    {
      nutrient: 'potassium_mg', label: 'Potassium', cautionBelow: 300, unit: 'mg', direction: 'higher_is_better',
      source: 'WHO', sourceUrl: 'https://www.who.int/publications/i/item/9789241504829'
    },
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
