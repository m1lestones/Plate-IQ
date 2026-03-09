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
}

export interface MealAnalysis {
  foods: FoodItem[]
  total_calories: number
  timestamp: string
}

export interface ClaudeVisionError {
  type: 'api_error' | 'network_error' | 'validation_error'
  message: string
}
