import type { FoodItem, MealData } from '../types'

/**
 * Smart Validation System
 * Catches obvious AI errors and illogical results
 * Based on nutritional science and common sense rules
 */

export interface ValidationWarning {
  type: 'portion' | 'calorie' | 'logical' | 'meal_context'
  severity: 'error' | 'warning' | 'info'
  message: string
  foodName?: string
  suggestion?: string
}

// Portion size ranges (in grams)
const PORTION_LIMITS = {
  MIN_NORMAL: 10,        // Below this is suspiciously small
  MAX_NORMAL: 1000,      // Above this is suspiciously large
  TYPICAL_MIN: 30,       // Typical minimum portion
  TYPICAL_MAX: 500,      // Typical maximum portion
}

// Calorie ranges by meal type
const MEAL_CALORIE_RANGES = {
  breakfast: { min: 250, max: 700, typical: 400 },
  lunch: { min: 350, max: 900, typical: 550 },
  dinner: { min: 400, max: 1200, typical: 650 },
  snack: { min: 50, max: 400, typical: 150 },
}

// Food-specific portion expectations (grams)
const FOOD_PORTION_RANGES: Record<string, { min: number; max: number }> = {
  rice: { min: 100, max: 400 },
  chicken: { min: 80, max: 350 },
  beef: { min: 80, max: 400 },
  fish: { min: 100, max: 300 },
  salad: { min: 50, max: 300 },
  broccoli: { min: 50, max: 250 },
  pasta: { min: 100, max: 400 },
  bread: { min: 25, max: 150 },
  soup: { min: 150, max: 500 },
  sauce: { min: 15, max: 100 },
}

/**
 * Validate portion sizes for individual foods
 */
export function validateFoodPortion(food: FoodItem): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const grams = food.estimated_grams

  // Extremely small portions
  if (grams < PORTION_LIMITS.MIN_NORMAL) {
    warnings.push({
      type: 'portion',
      severity: 'warning',
      message: `${food.name} (${grams}g) seems unusually small`,
      foodName: food.name,
      suggestion: 'Verify this portion size or remove if incorrect'
    })
  }

  // Extremely large portions
  if (grams > PORTION_LIMITS.MAX_NORMAL) {
    warnings.push({
      type: 'portion',
      severity: 'error',
      message: `${food.name} (${grams}g) seems unrealistically large`,
      foodName: food.name,
      suggestion: 'This is likely an AI error - please adjust'
    })
  }

  // Check against food-specific ranges
  const foodKey = Object.keys(FOOD_PORTION_RANGES).find(key =>
    food.name.toLowerCase().includes(key)
  )

  if (foodKey) {
    const range = FOOD_PORTION_RANGES[foodKey]
    if (grams < range.min) {
      warnings.push({
        type: 'portion',
        severity: 'info',
        message: `${food.name} (${grams}g) is below typical portion (${range.min}-${range.max}g)`,
        foodName: food.name
      })
    }
    if (grams > range.max) {
      warnings.push({
        type: 'portion',
        severity: 'warning',
        message: `${food.name} (${grams}g) exceeds typical portion (${range.min}-${range.max}g)`,
        foodName: food.name
      })
    }
  }

  return warnings
}

/**
 * Validate total meal calories against meal type
 */
export function validateMealCalories(mealData: MealData): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const avgCalories = (mealData.estimated_calories_low + mealData.estimated_calories_high) / 2
  const mealType = mealData.meal_type || 'dinner'
  const range = MEAL_CALORIE_RANGES[mealType]

  if (avgCalories < range.min) {
    warnings.push({
      type: 'calorie',
      severity: 'warning',
      message: `${Math.round(avgCalories)} calories seems low for ${mealType}`,
      suggestion: `Typical ${mealType}: ${range.typical} calories. Check for missing foods.`
    })
  }

  if (avgCalories > range.max) {
    warnings.push({
      type: 'calorie',
      severity: 'info',
      message: `${Math.round(avgCalories)} calories is high for ${mealType}`,
      suggestion: `Typical ${mealType}: ${range.typical} calories. Verify portions.`
    })
  }

  // Extremely low total (likely missing foods)
  if (avgCalories < 100) {
    warnings.push({
      type: 'calorie',
      severity: 'error',
      message: 'Total calories suspiciously low',
      suggestion: 'AI likely missed foods. Use "Add Food" to include missing items.'
    })
  }

  // Extremely high total (likely AI error)
  if (avgCalories > 2500) {
    warnings.push({
      type: 'calorie',
      severity: 'error',
      message: 'Total calories extremely high',
      suggestion: 'Check for portion overestimates or duplicate foods.'
    })
  }

  return warnings
}

/**
 * Logical consistency checks
 */
export function validateLogicalConsistency(mealData: MealData): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const foods = mealData.foods

  // Check for duplicate foods
  const foodNames = foods.map(f => f.name.toLowerCase())
  const duplicates = foodNames.filter((name, index) => foodNames.indexOf(name) !== index)

  if (duplicates.length > 0) {
    warnings.push({
      type: 'logical',
      severity: 'warning',
      message: `Duplicate foods detected: ${duplicates.join(', ')}`,
      suggestion: 'Combine duplicates or verify they are different items'
    })
  }

  // Dessert with unrealistically low calories
  const hasDessert = foods.some(f =>
    f.name.toLowerCase().includes('cake') ||
    f.name.toLowerCase().includes('ice cream') ||
    f.name.toLowerCase().includes('cookie') ||
    f.name.toLowerCase().includes('chocolate')
  )

  if (hasDessert) {
    const dessertCalories = foods
      .filter(f => f.name.toLowerCase().includes('cake') ||
                   f.name.toLowerCase().includes('ice cream') ||
                   f.name.toLowerCase().includes('cookie'))
      .reduce((sum, f) => sum + (f.nutrients.calories * f.estimated_grams) / 100, 0)

    if (dessertCalories < 100) {
      warnings.push({
        type: 'logical',
        severity: 'warning',
        message: 'Dessert calories seem too low',
        suggestion: 'Typical dessert portions: 200-500 calories'
      })
    }
  }

  // Sauce without main dish
  const hasSauce = foods.some(f =>
    f.name.toLowerCase().includes('sauce') ||
    f.name.toLowerCase().includes('gravy')
  )
  const hasMain = foods.some(f =>
    f.category === 'protein' ||
    f.category === 'carb'
  )

  if (hasSauce && !hasMain) {
    warnings.push({
      type: 'logical',
      severity: 'info',
      message: 'Sauce detected without main dish',
      suggestion: 'AI may have missed the main protein or carb'
    })
  }

  // Only vegetables (might be incomplete)
  const allVegetables = foods.every(f => f.category === 'vegetable')
  if (allVegetables && foods.length > 0) {
    warnings.push({
      type: 'logical',
      severity: 'info',
      message: 'Meal contains only vegetables',
      suggestion: 'If this is a full meal, AI may have missed protein or carbs'
    })
  }

  return warnings
}

/**
 * Run all validations on a meal
 */
export function validateMeal(mealData: MealData): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  // Validate each food item
  mealData.foods.forEach(food => {
    warnings.push(...validateFoodPortion(food))
  })

  // Validate total calories
  warnings.push(...validateMealCalories(mealData))

  // Validate logical consistency
  warnings.push(...validateLogicalConsistency(mealData))

  // Log warnings
  if (warnings.length > 0) {
    console.group('⚠️ Smart Validation Warnings')
    warnings.forEach(w => {
      const icon = w.severity === 'error' ? '🚫' : w.severity === 'warning' ? '⚠️' : 'ℹ️'
      console.log(`${icon} [${w.type}] ${w.message}`)
      if (w.suggestion) console.log(`   💡 ${w.suggestion}`)
    })
    console.groupEnd()
  } else {
    console.log('✅ Smart Validation: No warnings')
  }

  return warnings
}

/**
 * Get color coding for warning severity
 */
export function getWarningColor(severity: ValidationWarning['severity']): {
  bg: string
  border: string
  text: string
} {
  const colors = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400'
    }
  }
  return colors[severity]
}
