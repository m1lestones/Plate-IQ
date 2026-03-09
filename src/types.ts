export type ScanStep = 'capture' | 'preview' | 'loading' | 'done'

export interface CapturedImage {
  dataUrl: string
  file?: File
}

// API Response types
export interface FoodItem {
  name: string
  portion_grams: number
  estimated_calories: number
  confidence?: number
  nova_level?: 1 | 2 | 3 | 4
  category?: 'protein' | 'carb' | 'vegetable' | 'fruit' | 'dairy' | 'fat' | 'other'
}

export interface MealAnalysis {
  foods: FoodItem[]
  total_calories: number
  reference_object_detected?: 'credit_card' | 'fork' | 'spoon' | 'plate' | 'none'
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  primary_cuisine?: string
  timestamp: string
}

// User correction tracking
export interface FoodCorrection {
  original: FoodItem
  corrected: FoodItem
  correction_type: 'name' | 'portion' | 'added' | 'removed' | 'category' | 'nova_level'
}

export interface MealCorrection {
  meal_id: string
  original_analysis: MealAnalysis
  corrected_analysis: MealAnalysis
  corrections: FoodCorrection[]
  image_data: string
  timestamp: string
  user_notes?: string
}

export interface ClaudeVisionError {
  type: 'api_error' | 'network_error' | 'validation_error'
  message: string
}
