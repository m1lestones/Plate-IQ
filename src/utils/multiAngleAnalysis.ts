import type { FoodItem, MealData } from '../types'

/**
 * Multi-Angle Capture & Analysis
 * Based on NYU research: Multiple angles improve detection accuracy by 10-15%
 */

export type CaptureAngle = 'top_down' | 'angle_45' | 'side_view'

export interface AngleCapture {
  angle: CaptureAngle
  imageData: string
  mealData?: MealData
}

export const ANGLE_INSTRUCTIONS: Record<CaptureAngle, string> = {
  top_down: 'Take a photo directly above your plate (bird\'s eye view)',
  angle_45: 'Take a photo at a 45° angle from the side',
  side_view: 'Optional: Take a side view to capture height/depth'
}

export const ANGLE_ICONS: Record<CaptureAngle, string> = {
  top_down: '⬇️',
  angle_45: '↘️',
  side_view: '➡️'
}

/**
 * Merge food items detected from multiple angles
 * Deduplicates and combines portion estimates
 */
export function mergeFoodsFromAngles(
  captures: AngleCapture[]
): {
  mergedFoods: FoodItem[]
  metadata: {
    totalAngles: number
    foodsPerAngle: Record<CaptureAngle, number>
    uniqueFoods: number
    duplicatesResolved: number
  }
} {
  // Collect all foods from all angles
  const allFoods: Array<{ food: FoodItem; angle: CaptureAngle }> = []

  captures.forEach(capture => {
    if (capture.mealData) {
      capture.mealData.foods.forEach(food => {
        allFoods.push({ food, angle: capture.angle })
      })
    }
  })

  // Group similar foods (same name or very similar)
  const foodGroups = new Map<string, Array<{ food: FoodItem; angle: CaptureAngle }>>()

  allFoods.forEach(({ food, angle }) => {
    const normalizedName = normalizeFoodName(food.name)

    if (!foodGroups.has(normalizedName)) {
      foodGroups.set(normalizedName, [])
    }

    foodGroups.get(normalizedName)!.push({ food, angle })
  })

  // Merge duplicates by averaging
  const mergedFoods: FoodItem[] = []
  let duplicatesResolved = 0

  foodGroups.forEach((group, normalizedName) => {
    if (group.length === 1) {
      // Unique food, only detected from one angle
      mergedFoods.push({
        ...group[0].food,
        metadata: {
          ...group[0].food.metadata,
          detected_from: [group[0].angle]
        }
      })
    } else {
      // Duplicate food detected from multiple angles
      duplicatesResolved++

      // Average the portions and confidence
      const avgGrams = Math.round(
        group.reduce((sum, { food }) => sum + food.estimated_grams, 0) / group.length
      )

      const avgConfidence =
        group.reduce((sum, { food }) => sum + food.confidence, 0) / group.length

      // Take the highest quality nutrients (from highest confidence detection)
      const bestDetection = group.reduce((best, current) =>
        current.food.confidence > best.food.confidence ? current : best
      )

      mergedFoods.push({
        ...bestDetection.food,
        estimated_grams: avgGrams,
        confidence: avgConfidence,
        metadata: {
          ...bestDetection.food.metadata,
          detected_from: group.map(g => g.angle),
          portion_range: {
            min: Math.min(...group.map(g => g.food.estimated_grams)),
            max: Math.max(...group.map(g => g.food.estimated_grams)),
            avg: avgGrams
          }
        }
      })

      console.log(`🔄 Merged "${normalizedName}" from ${group.length} angles:`, {
        angles: group.map(g => g.angle),
        portions: group.map(g => g.food.estimated_grams),
        averaged: avgGrams
      })
    }
  })

  // Calculate metadata
  const foodsPerAngle: Record<CaptureAngle, number> = {
    top_down: 0,
    angle_45: 0,
    side_view: 0
  }

  captures.forEach(capture => {
    if (capture.mealData) {
      foodsPerAngle[capture.angle] = capture.mealData.foods.length
    }
  })

  return {
    mergedFoods,
    metadata: {
      totalAngles: captures.length,
      foodsPerAngle,
      uniqueFoods: mergedFoods.length,
      duplicatesResolved
    }
  }
}

/**
 * Normalize food name for comparison
 * Handles minor variations in naming
 */
function normalizeFoodName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/grilled|baked|fried|steamed|roasted/g, '')
    .replace(/chicken breast/g, 'chicken')
    .replace(/brown rice|white rice|jasmine rice/g, 'rice')
    .trim()
}

/**
 * Identify foods only detected from certain angles
 * These are likely hidden or partially obscured
 */
export function identifyHiddenFoods(mergedFoods: FoodItem[]): {
  hiddenFoods: FoodItem[]
  obviousFoods: FoodItem[]
} {
  const hiddenFoods: FoodItem[] = []
  const obviousFoods: FoodItem[] = []

  mergedFoods.forEach(food => {
    const detectedFrom = food.metadata?.detected_from as CaptureAngle[] | undefined

    if (detectedFrom && detectedFrom.length === 1 && detectedFrom[0] !== 'top_down') {
      // Only detected from angle or side view = was hidden from top
      hiddenFoods.push(food)
    } else {
      obviousFoods.push(food)
    }
  })

  return { hiddenFoods, obviousFoods }
}

/**
 * Calculate improvement statistics from multi-angle capture
 */
export function calculateMultiAngleStats(
  singleAngleCount: number,
  multiAngleCount: number
): {
  improvement: number
  additionalFoods: number
  percentIncrease: number
} {
  const additionalFoods = multiAngleCount - singleAngleCount
  const percentIncrease = singleAngleCount > 0
    ? (additionalFoods / singleAngleCount) * 100
    : 0

  return {
    improvement: additionalFoods,
    additionalFoods,
    percentIncrease
  }
}

/**
 * Generate summary report for multi-angle capture
 */
export function generateMultiAngleSummary(
  captures: AngleCapture[],
  mergedFoods: FoodItem[]
): string {
  const { hiddenFoods } = identifyHiddenFoods(mergedFoods)

  let summary = `📸 Multi-Angle Analysis Complete:\n`
  summary += `   Angles captured: ${captures.length}\n`
  summary += `   Total foods detected: ${mergedFoods.length}\n`

  if (hiddenFoods.length > 0) {
    summary += `   Hidden foods found: ${hiddenFoods.map(f => f.name).join(', ')}\n`
  }

  summary += `   ✅ More comprehensive analysis!`

  return summary
}
