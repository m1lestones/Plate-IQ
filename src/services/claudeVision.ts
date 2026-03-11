/**
 * Claude Vision API Integration
 * Analyzes meal photos and identifies foods with portions
 */

import type { MealData } from '../types'

const BACKEND_API_URL = 'http://localhost:3001/api/analyze'

/**
 * Analyze meal image with Claude Vision API
 * @param imageDataUrl - Base64 data URL of meal photo
 * @returns Meal analysis with identified foods
 */
export async function analyzeMealWithClaude(imageDataUrl: string): Promise<MealData> {
  // Extract base64 data
  const base64Data = imageDataUrl.split(',')[1] || imageDataUrl
  const mediaType = imageDataUrl.match(/data:(image\/[^;]+)/)?.[1] || 'image/jpeg'

  console.log('Calling backend proxy for Claude Vision...')

  try {
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageData: base64Data,
        mediaType
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend error:', errorData)
      throw new Error(`Backend error: ${response.status}`)
    }

    const parsed = await response.json()
    console.log('Claude Vision response:', parsed)

    if (!parsed.foods || !Array.isArray(parsed.foods)) {
      throw new Error('Invalid response structure from Claude')
    }

    // Add placeholder nutrients (will be filled by USDA)
    const foods = parsed.foods.map((food: any) => ({
      name: food.name,
      estimated_grams: food.estimated_grams,
      nova_level: food.nova_level || 1,
      confidence: 0.85, // Default confidence
      category: food.category || 'other',
      nutrients: {
        // Placeholder - will be replaced by USDA
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        vitamin_d_dv: 0,
        calcium_dv: 0,
        iron_dv: 0,
        potassium_dv: 0
      }
    }))

    // Rough estimate using ~1.5 cal/g average until USDA refines it
    const estimatedCalories = foods.reduce((sum: number, f: any) => sum + f.estimated_grams * 1.5, 0)

    const mealData: MealData = {
      meal_id: `claude-${Date.now()}`,
      meal_type: parsed.meal_type || 'dinner',
      primary_cuisine: parsed.primary_cuisine || 'Mixed',
      estimated_calories_low: Math.round(estimatedCalories * 0.8),
      estimated_calories_high: Math.round(estimatedCalories * 1.2),
      foods,
      timestamp: new Date().toISOString()
    }

    console.log('Claude Vision analysis complete:', mealData)
    return mealData

  } catch (error) {
    console.error('Claude Vision API failed:', error)
    throw error
  }
}
