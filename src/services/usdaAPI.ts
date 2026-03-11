/**
 * USDA FoodData Central API Integration
 * https://fdc.nal.usda.gov/api-guide.html
 *
 * Free API - 1,000 requests/hour
 * Sign up: https://fdc.nal.usda.gov/api-key-signup.html
 */

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1'
const API_KEY = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY'

export interface USDANutrient {
  nutrientId: number
  nutrientName: string
  value: number
  unitName: string
}

export interface USDAFood {
  fdcId: number
  description: string
  dataType: string
  foodNutrients: USDANutrient[]
}

export interface USDASearchResult {
  foods: USDAFood[]
  totalHits: number
}

/**
 * Search for foods in USDA database
 * @param query - Food name to search (e.g., "chicken breast")
 * @param pageSize - Number of results (default: 5)
 */
export async function searchFood(query: string, pageSize = 5): Promise<USDASearchResult> {
  try {
    const url = `${USDA_API_URL}/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&dataType=Foundation,SR Legacy`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('USDA API search failed:', error)
    throw error
  }
}

/**
 * Get detailed food data by FDC ID
 * @param fdcId - Food Data Central ID
 */
export async function getFoodById(fdcId: number): Promise<USDAFood> {
  try {
    const url = `${USDA_API_URL}/food/${fdcId}?api_key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('USDA API get food failed:', error)
    throw error
  }
}

/**
 * Extract specific nutrient from USDA food data
 * @param food - USDA food object
 * @param nutrientId - Nutrient ID from USDA database
 *
 * Common Nutrient IDs:
 * 1008 - Energy (calories)
 * 1003 - Protein
 * 1005 - Carbohydrate
 * 1004 - Total lipid (fat)
 * 1079 - Fiber
 * 1106 - Vitamin A
 * 1162 - Vitamin C
 * 1114 - Vitamin D
 * 1087 - Calcium
 * 1089 - Iron
 * 1092 - Potassium
 */
export function getNutrientValue(food: USDAFood, nutrientId: number): number {
  const nutrient = food.foodNutrients.find(n => n.nutrientId === nutrientId)
  return nutrient?.value || 0
}

/**
 * Convert USDA food data to our app's nutrient format
 * @param food - USDA food object
 */
export function convertToAppNutrients(food: USDAFood) {
  // Nutrient IDs: 1008=Energy, 1003=Protein, 1005=Carbs, 1004=Fat, 1079=Fiber
  // 1093=Sodium, 1258=Saturated Fat, 1253=Cholesterol, 1235=Added Sugar, 1092=Potassium
  // 1106=Vit A, 1162=Vit C, 1114=Vit D, 1087=Calcium, 1089=Iron
  return {
    calories: Math.round(getNutrientValue(food, 1008)),
    protein_g: Math.round(getNutrientValue(food, 1003) * 10) / 10,
    carbs_g: Math.round(getNutrientValue(food, 1005) * 10) / 10,
    fat_g: Math.round(getNutrientValue(food, 1004) * 10) / 10,
    fiber_g: Math.round(getNutrientValue(food, 1079) * 10) / 10,
    // Condition-relevant nutrients (per 100g)
    sodium_mg: Math.round(getNutrientValue(food, 1093)),
    saturated_fat_g: Math.round(getNutrientValue(food, 1258) * 10) / 10,
    cholesterol_mg: Math.round(getNutrientValue(food, 1253)),
    added_sugar_g: Math.round(getNutrientValue(food, 1235) * 10) / 10,
    potassium_mg: Math.round(getNutrientValue(food, 1092)),
    // Micronutrient % Daily Values
    vitamin_a_dv: Math.round((getNutrientValue(food, 1106) / 900) * 100),
    vitamin_c_dv: Math.round((getNutrientValue(food, 1162) / 90) * 100),
    vitamin_d_dv: Math.round((getNutrientValue(food, 1114) / 20) * 100),
    calcium_dv: Math.round((getNutrientValue(food, 1087) / 1300) * 100),
    iron_dv: Math.round((getNutrientValue(food, 1089) / 18) * 100),
    potassium_dv: Math.round((getNutrientValue(food, 1092) / 4700) * 100),
  }
}

/**
 * Get nutrition data for a food by name
 * Returns the first matching result
 * @param foodName - Name of the food
 */
export async function getNutritionByName(foodName: string) {
  try {
    const searchResults = await searchFood(foodName, 1)

    if (searchResults.foods.length === 0) {
      throw new Error(`No USDA data found for: ${foodName}`)
    }

    const food = searchResults.foods[0]
    const nutrients = convertToAppNutrients(food)

    return {
      fdcId: food.fdcId,
      description: food.description,
      nutrients
    }
  } catch (error) {
    console.error(`Failed to get nutrition for ${foodName}:`, error)
    return null
  }
}

/**
 * Batch get nutrition data for multiple foods
 * @param foodNames - Array of food names
 */
export async function batchGetNutrition(foodNames: string[]) {
  const results = await Promise.all(
    foodNames.map(name => getNutritionByName(name))
  )

  return results.filter(r => r !== null)
}
