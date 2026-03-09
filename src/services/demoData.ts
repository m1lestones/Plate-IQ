import type { MealAnalysis } from '../types'

/**
 * Pre-cached demo meal responses for offline mode
 * Enables presentations and development without API key
 */

const demoMeals: MealAnalysis[] = [
  {
    foods: [
      {
        name: 'Grilled Chicken Breast',
        portion_grams: 150,
        estimated_calories: 248,
        confidence: 0.92
      },
      {
        name: 'Brown Rice',
        portion_grams: 200,
        estimated_calories: 218,
        confidence: 0.88
      },
      {
        name: 'Steamed Broccoli',
        portion_grams: 100,
        estimated_calories: 35,
        confidence: 0.95
      }
    ],
    total_calories: 501,
    timestamp: new Date().toISOString()
  },
  {
    foods: [
      {
        name: 'Grilled Salmon',
        portion_grams: 180,
        estimated_calories: 367,
        confidence: 0.89
      },
      {
        name: 'Quinoa',
        portion_grams: 150,
        estimated_calories: 180,
        confidence: 0.85
      },
      {
        name: 'Mixed Green Salad',
        portion_grams: 80,
        estimated_calories: 20,
        confidence: 0.91
      },
      {
        name: 'Olive Oil Dressing',
        portion_grams: 15,
        estimated_calories: 120,
        confidence: 0.78
      }
    ],
    total_calories: 687,
    timestamp: new Date().toISOString()
  },
  {
    foods: [
      {
        name: 'Whole Wheat Pasta',
        portion_grams: 200,
        estimated_calories: 280,
        confidence: 0.87
      },
      {
        name: 'Tomato Marinara Sauce',
        portion_grams: 120,
        estimated_calories: 70,
        confidence: 0.83
      },
      {
        name: 'Caesar Salad',
        portion_grams: 150,
        estimated_calories: 190,
        confidence: 0.86
      },
      {
        name: 'Parmesan Cheese',
        portion_grams: 20,
        estimated_calories: 85,
        confidence: 0.90
      }
    ],
    total_calories: 625,
    timestamp: new Date().toISOString()
  }
]

/**
 * Returns a random demo meal with a fresh timestamp
 * Simulates variety in meal analysis for presentations
 */
export function getRandomDemoMeal(): MealAnalysis {
  const randomIndex = Math.floor(Math.random() * demoMeals.length)
  const meal = demoMeals[randomIndex]

  // Return a fresh copy with updated timestamp
  return {
    ...meal,
    foods: meal.foods.map(food => ({ ...food })),
    timestamp: new Date().toISOString()
  }
}
