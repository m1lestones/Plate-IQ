import type { FoodItem, MealData } from '../types'

/**
 * Confidence Thresholding System
 * Based on NYU Tandon research: Filter low-confidence detections to reduce false positives
 */

// Confidence thresholds (based on NYU mAP@0.5 = 0.7941)
export const CONFIDENCE_THRESHOLDS = {
  MINIMUM: 0.50,      // Below this = filtered out
  LOW: 0.70,          // 0.50-0.70 = show warning
  MEDIUM: 0.85,       // 0.70-0.85 = acceptable
  HIGH: 0.95,         // 0.85+ = high confidence
} as const

export type ConfidenceLevel = 'filtered' | 'low' | 'medium' | 'high'

/**
 * Determine confidence level
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence < CONFIDENCE_THRESHOLDS.MINIMUM) return 'filtered'
  if (confidence < CONFIDENCE_THRESHOLDS.LOW) return 'low'
  if (confidence < CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium'
  return 'high'
}

/**
 * Get color coding for confidence level
 */
export function getConfidenceColor(level: ConfidenceLevel): {
  bg: string
  border: string
  text: string
  badge: string
} {
  const colors = {
    filtered: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badge: 'bg-red-500/20 text-red-300'
    },
    low: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-300'
    },
    medium: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-300'
    },
    high: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      badge: 'bg-green-500/20 text-green-300'
    }
  }
  return colors[level]
}

/**
 * Get human-readable confidence label
 */
export function getConfidenceLabel(level: ConfidenceLevel): string {
  const labels = {
    filtered: 'Very Low Confidence',
    low: 'Low Confidence',
    medium: 'Medium Confidence',
    high: 'High Confidence'
  }
  return labels[level]
}

/**
 * Get warning message for low confidence items
 */
export function getConfidenceWarning(food: FoodItem): string | null {
  const confidence = food.confidence ?? 0.85
  const level = getConfidenceLevel(confidence)

  if (level === 'filtered') {
    return `"${food.name}" has very low confidence (${Math.round(confidence * 100)}%). This item was likely misidentified.`
  }

  if (level === 'low') {
    return `"${food.name}" has low confidence (${Math.round(confidence * 100)}%). Please verify this is correct.`
  }

  return null
}

/**
 * Filter out low-confidence foods from meal
 * Returns filtered foods and removed foods separately
 */
export function filterLowConfidenceFoods(
  foods: FoodItem[],
  threshold: number = CONFIDENCE_THRESHOLDS.MINIMUM
): {
  kept: FoodItem[]
  filtered: FoodItem[]
  stats: {
    total: number
    kept: number
    filtered: number
    averageConfidence: number
  }
} {
  const kept: FoodItem[] = []
  const filtered: FoodItem[] = []

  foods.forEach(food => {
    const confidence = food.confidence ?? 0.85
    if (confidence >= threshold) {
      kept.push(food)
    } else {
      filtered.push(food)
      console.warn(`🚫 Filtered out low-confidence food: "${food.name}" (${Math.round(confidence * 100)}%)`)
    }
  })

  const averageConfidence = kept.length > 0
    ? kept.reduce((sum, f) => sum + (f.confidence ?? 0.85), 0) / kept.length
    : 0

  return {
    kept,
    filtered,
    stats: {
      total: foods.length,
      kept: kept.length,
      filtered: filtered.length,
      averageConfidence
    }
  }
}

/**
 * Apply confidence filtering to meal data
 */
export function applyConfidenceFiltering(
  mealData: MealData,
  threshold: number = CONFIDENCE_THRESHOLDS.MINIMUM
): MealData & {
  filtered_foods?: FoodItem[]
  confidence_stats?: {
    total: number
    kept: number
    filtered: number
    averageConfidence: number
  }
} {
  const { kept, filtered, stats } = filterLowConfidenceFoods(mealData.foods, threshold)

  // Log filtering results
  if (filtered.length > 0) {
    console.group('🔍 Confidence Filtering Results')
    console.log(`Total foods: ${stats.total}`)
    console.log(`Kept: ${stats.kept} (avg confidence: ${Math.round(stats.averageConfidence * 100)}%)`)
    console.log(`Filtered: ${stats.filtered}`)
    console.log('Filtered items:', filtered.map(f => `${f.name} (${Math.round((f.confidence ?? 0.85) * 100)}%)`))

    console.groupEnd()
  }

  // Recalculate calorie estimates
  const totalCalories = kept.reduce(
    (sum, food) => sum + (food.nutrients.calories * food.estimated_grams) / 100,
    0
  )

  return {
    ...mealData,
    foods: kept,
    filtered_foods: filtered,
    confidence_stats: stats,
    estimated_calories_low: Math.round(totalCalories * 0.9),
    estimated_calories_high: Math.round(totalCalories * 1.1)
  }
}

/**
 * Get confidence distribution for analytics
 */
export function getConfidenceDistribution(foods: FoodItem[]): {
  high: number
  medium: number
  low: number
  filtered: number
} {
  return foods.reduce((acc, food) => {
    const level = getConfidenceLevel(food.confidence ?? 0.85)
    acc[level]++
    return acc
  }, { high: 0, medium: 0, low: 0, filtered: 0 })
}

/**
 * Suggest foods for user review based on confidence
 */
export function getFoodsNeedingReview(foods: FoodItem[]): FoodItem[] {
  return foods.filter(food => {
    const level = getConfidenceLevel(food.confidence ?? 0.85)
    return level === 'low' || level === 'filtered'
  })
}
