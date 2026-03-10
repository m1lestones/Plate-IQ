export type ScanStep = 'capture' | 'preview' | 'loading' | 'done'

export interface CapturedImage {
  dataUrl: string
  file?: File
}

export interface FoodNutrients {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  vitamin_a_dv: number
  vitamin_c_dv: number
  vitamin_d_dv: number
  calcium_dv: number
  iron_dv: number
  potassium_dv: number
}

export interface FoodItem {
  name: string
  estimated_grams: number
  nova_level: number
  confidence: number
  category: string
  nutrients: FoodNutrients
}

export interface MealData {
  meal_id: string
  meal_type: string
  primary_cuisine: string
  estimated_calories_low: number
  estimated_calories_high: number
  foods: FoodItem[]
  timestamp: string
}

export interface ClaudeVisionError {
  type: 'api_error' | 'network_error' | 'validation_error'
  message: string
}
