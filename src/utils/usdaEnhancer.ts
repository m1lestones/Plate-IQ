/**
 * Utility to enhance meal data with real USDA nutrition information
 */

import { getNutritionByName } from '../services/usdaAPI'
import type { MealData, FoodItem } from '../types'

/**
 * Enhance a single food item with USDA nutrition data
 * Falls back to existing data if USDA lookup fails
 */
export async function enhanceFoodWithUSDA(food: FoodItem): Promise<FoodItem> {
  try {
    const usdaData = await getNutritionByName(food.name)

    if (!usdaData) {
      console.warn(`No USDA data for ${food.name}, using demo data`)
      return food
    }

    // Merge USDA nutrients with existing food data
    return {
      ...food,
      nutrients: usdaData.nutrients
    }
  } catch (error) {
    console.error(`Failed to enhance ${food.name} with USDA:`, error)
    return food
  }
}

/**
 * Enhance entire meal with USDA nutrition data
 * @param mealData - Meal data to enhance
 * @returns Enhanced meal data with real USDA nutrients
 */
export async function enhanceMealWithUSDA(mealData: MealData): Promise<MealData> {
  console.log('Enhancing meal with USDA nutrition data...')

  const enhancedFoods = await Promise.all(
    mealData.foods.map(food => enhanceFoodWithUSDA(food))
  )

  // Recalculate calorie totals
  const totalCalories = enhancedFoods.reduce(
    (sum, food) => sum + (food.nutrients.calories * food.estimated_grams) / 100,
    0
  )

  return {
    ...mealData,
    foods: enhancedFoods,
    estimated_calories_low: Math.round(totalCalories * 0.9),
    estimated_calories_high: Math.round(totalCalories * 1.1)
  }
}

/**
 * Check if USDA API is configured
 */
export function isUSDAConfigured(): boolean {
  const apiKey = import.meta.env.VITE_USDA_API_KEY
  return !!apiKey && apiKey !== 'DEMO_KEY' && apiKey.trim() !== ''
}
