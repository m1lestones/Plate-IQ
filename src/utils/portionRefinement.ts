import { getFoodDensity, calculatePortionWeight } from '../data/foodDensities'
import type { FoodItem } from '../types'

/**
 * Refine portion estimates using food density data
 * Applied as post-processing after Claude Vision analysis
 */

/**
 * Validate and refine a single food item's portion
 */
export function refineFoodPortion(food: FoodItem): FoodItem {
  const density = getFoodDensity(food.name)

  // If portion seems off, suggest recalculation
  // This is a sanity check, not a replacement
  if (food.estimated_grams > 1000) {
    console.warn(`⚠️ ${food.name}: ${food.estimated_grams}g seems large. Density: ${density}g/cm³`)
  }

  if (food.estimated_grams < 10 && !food.name.toLowerCase().includes('sauce')) {
    console.warn(`⚠️ ${food.name}: ${food.estimated_grams}g seems small. Density: ${density}g/cm³`)
  }

  return {
    ...food,
    metadata: {
      ...food.metadata,
      density_used: density,
      density_source: 'nyu_research_database'
    }
  }
}

/**
 * Refine all portions in a meal
 */
export function refineMealPortions(foods: FoodItem[]): FoodItem[] {
  return foods.map(refineFoodPortion)
}

/**
 * Calculate expected portion range based on density
 * Useful for validation
 */
export function getPortionRange(foodName: string, visualSize: 'small' | 'medium' | 'large'): {
  min: number
  max: number
  density: number
} {
  const density = getFoodDensity(foodName)

  // Typical portion sizes in cm² (visual estimation)
  const sizes = {
    small: { area: 30, height: 1.5 },   // ~45g for density 1.0
    medium: { area: 80, height: 1.5 },  // ~120g for density 1.0
    large: { area: 150, height: 2.0 },  // ~300g for density 1.0
  }

  const size = sizes[visualSize]
  const weight = calculatePortionWeight(size.area, density, size.height)

  return {
    min: Math.round(weight * 0.8),
    max: Math.round(weight * 1.2),
    density
  }
}

/**
 * Log density info for debugging
 */
export function logDensityInfo(foods: FoodItem[]): void {
  console.group('🔬 Food Density Analysis')
  foods.forEach(food => {
    const density = getFoodDensity(food.name)
    const volume = food.estimated_grams / density
    console.log(`${food.name}:`, {
      grams: food.estimated_grams,
      density: `${density}g/cm³`,
      estimated_volume: `${volume.toFixed(1)}cm³`,
      category: food.category
    })
  })
  console.groupEnd()
}
