import type { FoodItem } from '../types'

export interface MealCorrection {
  meal_id: string
  timestamp: string
  image_data?: string
  original_foods: FoodItem[]
  corrected_foods: FoodItem[]
  corrections: Array<{
    food_index: number
    original: FoodItem
    corrected: FoodItem
    correction_type: 'name' | 'portion' | 'category' | 'nova_level' | 'deleted' | 'added'
  }>
}

const STORAGE_KEY = 'plateiq_corrections'

/**
 * Save a meal correction to localStorage
 */
export function saveMealCorrection(
  mealId: string,
  originalFoods: FoodItem[],
  correctedFoods: FoodItem[],
  imageData?: string
): void {
  const corrections = getMealCorrections()

  // Detect what changed
  const changes = detectChanges(originalFoods, correctedFoods)

  const correction: MealCorrection = {
    meal_id: mealId,
    timestamp: new Date().toISOString(),
    image_data: imageData,
    original_foods: originalFoods,
    corrected_foods: correctedFoods,
    corrections: changes
  }

  corrections.push(correction)

  // Keep only last 50 corrections to avoid storage limits
  if (corrections.length > 50) {
    corrections.splice(0, corrections.length - 50)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(corrections))
}

/**
 * Get all saved corrections
 */
export function getMealCorrections(): MealCorrection[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Get correction statistics
 */
export function getCorrectionStats() {
  const corrections = getMealCorrections()

  const totalCorrections = corrections.length
  const totalChanges = corrections.reduce((sum, c) => sum + c.corrections.length, 0)

  // Count correction types
  const typeCount: Record<string, number> = {}
  corrections.forEach(c => {
    c.corrections.forEach(change => {
      typeCount[change.correction_type] = (typeCount[change.correction_type] || 0) + 1
    })
  })

  // Find most commonly corrected foods
  const foodCorrections: Record<string, number> = {}
  corrections.forEach(c => {
    c.corrections.forEach(change => {
      if (change.correction_type === 'name') {
        const key = `${change.original.name} → ${change.corrected.name}`
        foodCorrections[key] = (foodCorrections[key] || 0) + 1
      }
    })
  })

  return {
    totalCorrections,
    totalChanges,
    typeCount,
    foodCorrections,
    averageChangesPerMeal: totalCorrections > 0 ? (totalChanges / totalCorrections).toFixed(1) : '0'
  }
}

/**
 * Detect what changed between original and corrected foods
 */
function detectChanges(original: FoodItem[], corrected: FoodItem[]) {
  const changes: MealCorrection['corrections'] = []

  // Check for edits and deletions
  original.forEach((origFood, index) => {
    const corrFood = corrected[index]

    if (!corrFood) {
      // Food was deleted
      changes.push({
        food_index: index,
        original: origFood,
        corrected: origFood,
        correction_type: 'deleted'
      })
    } else {
      // Check what changed
      if (origFood.name !== corrFood.name) {
        changes.push({
          food_index: index,
          original: origFood,
          corrected: corrFood,
          correction_type: 'name'
        })
      }
      if (origFood.estimated_grams !== corrFood.estimated_grams) {
        changes.push({
          food_index: index,
          original: origFood,
          corrected: corrFood,
          correction_type: 'portion'
        })
      }
      if (origFood.category !== corrFood.category) {
        changes.push({
          food_index: index,
          original: origFood,
          corrected: corrFood,
          correction_type: 'category'
        })
      }
      if (origFood.nova_level !== corrFood.nova_level) {
        changes.push({
          food_index: index,
          original: origFood,
          corrected: corrFood,
          correction_type: 'nova_level'
        })
      }
    }
  })

  // Check for additions
  if (corrected.length > original.length) {
    corrected.slice(original.length).forEach((food, i) => {
      changes.push({
        food_index: original.length + i,
        original: food,
        corrected: food,
        correction_type: 'added'
      })
    })
  }

  return changes
}

/**
 * Clear all corrections (for testing/reset)
 */
export function clearCorrections(): void {
  localStorage.removeItem(STORAGE_KEY)
}
