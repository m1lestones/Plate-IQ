/**
 * Pre-cached demo meals for offline demo mode
 * Following PRD data structure requirements
 */

import type { MealData } from '../types'

export type DemoMeal = MealData

export const demoMeals: DemoMeal[] = [
  // Meal 1: Grilled Chicken + Brown Rice + Broccoli (NOVA 1: Unprocessed)
  {
    meal_id: 'demo-1',
    meal_type: 'dinner',
    primary_cuisine: 'American',
    estimated_calories_low: 480,
    estimated_calories_high: 550,
    foods: [
      {
        name: 'Grilled Chicken Breast',
        estimated_grams: 150,
        nova_level: 1,
        confidence: 0.95,
        category: 'protein',
        nutrients: {
          calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0,
          vitamin_a_dv: 1, vitamin_c_dv: 0, vitamin_d_dv: 2, calcium_dv: 1, iron_dv: 6, potassium_dv: 12
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      },
      {
        name: 'Brown Rice',
        estimated_grams: 200,
        nova_level: 1,
        confidence: 0.92,
        category: 'carb',
        nutrients: {
          calories: 112, protein_g: 2.6, carbs_g: 23.5, fat_g: 0.9, fiber_g: 1.8,
          vitamin_a_dv: 0, vitamin_c_dv: 0, vitamin_d_dv: 0, calcium_dv: 1, iron_dv: 2, potassium_dv: 2
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      },
      {
        name: 'Steamed Broccoli',
        estimated_grams: 100,
        nova_level: 1,
        confidence: 0.97,
        category: 'vegetable',
        nutrients: {
          calories: 35, protein_g: 2.4, carbs_g: 7, fat_g: 0.4, fiber_g: 2.6,
          vitamin_a_dv: 12, vitamin_c_dv: 148, vitamin_d_dv: 0, calcium_dv: 4, iron_dv: 4, potassium_dv: 9
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      }
    ],
    timestamp: new Date().toISOString()
  },
  // Meal 2: Salmon + Quinoa + Salad (NOVA 1-2: Nutrient-dense)
  {
    meal_id: 'demo-2',
    meal_type: 'dinner',
    primary_cuisine: 'Mediterranean',
    estimated_calories_low: 620,
    estimated_calories_high: 720,
    foods: [
      {
        name: 'Grilled Salmon',
        estimated_grams: 180,
        nova_level: 1,
        confidence: 0.91,
        category: 'protein',
        nutrients: {
          calories: 206, protein_g: 22, carbs_g: 0, fat_g: 13, fiber_g: 0,
          vitamin_a_dv: 3, vitamin_c_dv: 6, vitamin_d_dv: 127, calcium_dv: 1, iron_dv: 3, potassium_dv: 13
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      },
      {
        name: 'Quinoa',
        estimated_grams: 150,
        nova_level: 1,
        confidence: 0.88,
        category: 'carb',
        nutrients: {
          calories: 120, protein_g: 4.4, carbs_g: 21.3, fat_g: 1.9, fiber_g: 2.8,
          vitamin_a_dv: 0, vitamin_c_dv: 0, vitamin_d_dv: 0, calcium_dv: 2, iron_dv: 8, potassium_dv: 5
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      },
      {
        name: 'Mixed Green Salad',
        estimated_grams: 80,
        nova_level: 1,
        confidence: 0.94,
        category: 'vegetable',
        nutrients: {
          calories: 25, protein_g: 1.2, carbs_g: 5, fat_g: 0.2, fiber_g: 1.5,
          vitamin_a_dv: 45, vitamin_c_dv: 22, vitamin_d_dv: 0, calcium_dv: 3, iron_dv: 5, potassium_dv: 6
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      },
      {
        name: 'Olive Oil Dressing',
        estimated_grams: 15,
        nova_level: 2,
        confidence: 0.82,
        category: 'fat',
        nutrients: {
          calories: 884, protein_g: 0, carbs_g: 0, fat_g: 100, fiber_g: 0,
          vitamin_a_dv: 0, vitamin_c_dv: 0, vitamin_d_dv: 0, calcium_dv: 0, iron_dv: 4, potassium_dv: 0
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      }
    ],
    timestamp: new Date().toISOString()
  },
  // Meal 3: Pasta + Marinara + Caesar (NOVA 2-3: Mix)
  {
    meal_id: 'demo-3',
    meal_type: 'dinner',
    primary_cuisine: 'Italian',
    estimated_calories_low: 580,
    estimated_calories_high: 680,
    foods: [
      {
        name: 'Whole Wheat Pasta',
        estimated_grams: 200,
        nova_level: 2,
        confidence: 0.89,
        category: 'carb',
        nutrients: {
          calories: 124, protein_g: 5.3, carbs_g: 26.5, fat_g: 0.5, fiber_g: 3.5,
          vitamin_a_dv: 0, vitamin_c_dv: 0, vitamin_d_dv: 0, calcium_dv: 2, iron_dv: 9, potassium_dv: 2
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      },
      {
        name: 'Tomato Marinara Sauce',
        estimated_grams: 120,
        nova_level: 3,
        confidence: 0.86,
        category: 'other',
        nutrients: {
          calories: 70, protein_g: 2, carbs_g: 11, fat_g: 2.5, fiber_g: 2,
          vitamin_a_dv: 15, vitamin_c_dv: 18, vitamin_d_dv: 0, calcium_dv: 3, iron_dv: 6, potassium_dv: 10
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      },
      {
        name: 'Caesar Salad',
        estimated_grams: 150,
        nova_level: 3,
        confidence: 0.88,
        category: 'vegetable',
        nutrients: {
          calories: 190, protein_g: 4, carbs_g: 8, fat_g: 16, fiber_g: 2,
          vitamin_a_dv: 35, vitamin_c_dv: 12, vitamin_d_dv: 0, calcium_dv: 8, iron_dv: 4, potassium_dv: 7
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      },
      {
        name: 'Parmesan Cheese',
        estimated_grams: 20,
        nova_level: 2,
        confidence: 0.93,
        category: 'dairy',
        nutrients: {
          calories: 431, protein_g: 38, carbs_g: 4, fat_g: 29, fiber_g: 0,
          vitamin_a_dv: 17, vitamin_c_dv: 0, vitamin_d_dv: 2, calcium_dv: 121, iron_dv: 5, potassium_dv: 3
        , sodium_mg: 300, saturated_fat_g: 2, cholesterol_mg: 50, added_sugar_g: 0, potassium_mg: 400
        }
      }
    ],
    timestamp: new Date().toISOString()
  }
]

export function getRandomDemoMeal(): DemoMeal {
  const randomIndex = Math.floor(Math.random() * demoMeals.length)
  const meal = demoMeals[randomIndex]
  return { ...meal, foods: meal.foods.map(f => ({...f})), timestamp: new Date().toISOString() }
}
