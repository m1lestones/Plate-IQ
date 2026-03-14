export type ScanStep = 'capture' | 'preview' | 'loading' | 'done'

export interface CapturedImage {
  dataUrl: string
  file?: File
}

export type HealthCondition = 'hypertension' | 'high_cholesterol' | 'type2_diabetes' | 'stroke_risk'

export interface HealthProfile {
  conditions: HealthCondition[]
  setupComplete: boolean
}

export interface FoodNutrients {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sodium_mg: number
  saturated_fat_g: number
  cholesterol_mg: number
  added_sugar_g: number
  potassium_mg: number
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
  nova_verified?: boolean // True if verified by Open Food Facts database
  confidence: number
  category: string
  nutrients: FoodNutrients
  metadata?: Record<string, unknown>
}

export interface ValidationWarning {
  type: 'portion' | 'calorie' | 'logical' | 'meal_context'
  severity: 'error' | 'warning' | 'info'
  message: string
  foodName?: string
  suggestion?: string
}

export interface MealData {
  meal_id: string
  meal_type: string
  primary_cuisine: string
  estimated_calories_low: number
  estimated_calories_high: number
  foods: FoodItem[]
  timestamp: string
  verdict?: MealVerdict
  reference_object_detected?: string
  filtered_foods?: FoodItem[]
  validation_warnings?: ValidationWarning[]
}

export type VerdictLevel = 'safe' | 'caution' | 'avoid'

export interface ConditionFlag {
  text: string
  source: string
  url: string
  population?: {
    stat: string
    source: string
    url: string
    sampleSize: string
  }
}

export interface ConditionVerdict {
  condition: HealthCondition
  verdict: VerdictLevel
  flags: Array<ConditionFlag | string>
}

export interface MealVerdict {
  overall: VerdictLevel
  byCondition: ConditionVerdict[]
  aiInsight: string
}

export interface JournalEntry {
  meal_id: string
  timestamp: string
  meal_type: string
  estimated_calories_low: number
  estimated_calories_high: number
  verdict?: MealVerdict
  foods: { name: string; estimated_grams: number }[]
}

export interface ClaudeVisionError {
  type: 'api_error' | 'network_error' | 'validation_error'
  message: string
}

export interface MealAnalysis {
  foods: FoodItem[]
  total_calories: number
  timestamp: string
}
