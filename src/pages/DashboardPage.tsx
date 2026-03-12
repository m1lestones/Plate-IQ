import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MacroDonut } from '../components/charts/MacroDonut'
import { MicronutrientBars } from '../components/charts/MicronutrientBars'
import { IngredientQuality } from '../components/charts/IngredientQuality'
import { AIInsights } from '../components/AIInsights'
import { VerdictCard } from '../components/VerdictCard'
import { EditFoodModal } from '../components/EditFoodModal'
import { FoodSegmentationOverlay } from '../components/FoodSegmentationOverlay'
import { saveMealCorrection } from '../lib/correctionTracking'
import { getConfidenceLevel, getConfidenceColor, getConfidenceWarning } from '../utils/confidenceFiltering'
import { getWarningColor } from '../utils/smartValidation'
import type { MealData, FoodItem } from '../types'

export function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialMealData = location.state?.mealData as MealData | undefined
  const image = location.state?.image as string | undefined

  const [mealData, setMealData] = useState<MealData | null>(initialMealData || null)
  const [originalMealData, setOriginalMealData] = useState<MealData | null>(initialMealData || null)
  const [editingFood, setEditingFood] = useState<{ food: FoodItem; index: number } | null>(null)
  const [hasEdits, setHasEdits] = useState(false)
  const [portionSizes, setPortionSizes] = useState<Record<number, 'S' | 'M' | 'L'>>({})

  // Initialize all portion sizes to 'M' on mount
  useEffect(() => {
    if (mealData && Object.keys(portionSizes).length === 0) {
      const initialSizes: Record<number, 'S' | 'M' | 'L'> = {}
      mealData.foods.forEach((_, index) => {
        initialSizes[index] = 'M'
      })
      setPortionSizes(initialSizes)
    }
  }, [mealData, portionSizes])

  // Track if meal has been edited
  useEffect(() => {
    if (mealData && originalMealData) {
      const edited = JSON.stringify(mealData.foods) !== JSON.stringify(originalMealData.foods)
      setHasEdits(edited)
    }
  }, [mealData, originalMealData])

  if (!mealData || !image) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/60">No meal data available</p>
          <button
            onClick={() => navigate('/scan')}
            className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold transition-all"
          >
            Scan a meal
          </button>
        </div>
      </div>
    )
  }

  // Update portion size
  const updatePortion = (index: number, newGrams: number, size: 'S' | 'M' | 'L') => {
    const updatedFoods = [...mealData.foods]
    updatedFoods[index] = { ...updatedFoods[index], estimated_grams: newGrams }

    // Recalculate calorie range
    const totalCalories = updatedFoods.reduce(
      (sum, food) => sum + (food.nutrients.calories * food.estimated_grams) / 100,
      0
    )

    setMealData({
      ...mealData,
      foods: updatedFoods,
      estimated_calories_low: Math.round(totalCalories * 0.9),
      estimated_calories_high: Math.round(totalCalories * 1.1)
    })

    // Update portion size tracking
    setPortionSizes(prev => ({ ...prev, [index]: size }))
  }

  // Portion size presets - always calculate from original grams
  const getPortionPreset = (index: number, size: 'S' | 'M' | 'L') => {
    const originalGrams = originalMealData?.foods[index]?.estimated_grams || mealData.foods[index].estimated_grams
    if (size === 'S') return Math.round(originalGrams * 0.7)
    if (size === 'L') return Math.round(originalGrams * 1.3)
    return originalGrams
  }

  // Edit food handler
  const handleEditFood = (index: number, updatedFood: FoodItem) => {
    if (!mealData) return
    const updatedFoods = [...mealData.foods]
    updatedFoods[index] = updatedFood

    const totalCalories = updatedFoods.reduce(
      (sum, food) => sum + (food.nutrients.calories * food.estimated_grams) / 100,
      0
    )

    setMealData({
      ...mealData,
      foods: updatedFoods,
      estimated_calories_low: Math.round(totalCalories * 0.9),
      estimated_calories_high: Math.round(totalCalories * 1.1)
    })

    // Reset portion size to M after manual edit
    setPortionSizes(prev => ({ ...prev, [index]: 'M' }))
  }

  // Delete food handler
  const handleDeleteFood = (index: number) => {
    if (!mealData) return
    const updatedFoods = mealData.foods.filter((_, i) => i !== index)

    const totalCalories = updatedFoods.reduce(
      (sum, food) => sum + (food.nutrients.calories * food.estimated_grams) / 100,
      0
    )

    setMealData({
      ...mealData,
      foods: updatedFoods,
      estimated_calories_low: Math.round(totalCalories * 0.9),
      estimated_calories_high: Math.round(totalCalories * 1.1)
    })

    // Rebuild portion sizes map with updated indices
    const newPortionSizes: Record<number, 'S' | 'M' | 'L'> = {}
    let newIndex = 0
    Object.keys(portionSizes).forEach(key => {
      const oldIndex = parseInt(key)
      if (oldIndex !== index) {
        newPortionSizes[newIndex] = portionSizes[oldIndex]
        newIndex++
      }
    })
    setPortionSizes(newPortionSizes)
  }

  // Add new food handler
  const handleAddFood = () => {
    if (!mealData) return

    // Create blank food item
    const newFood: FoodItem = {
      name: '',
      estimated_grams: 100,
      nova_level: 1,
      confidence: 1.0,
      category: 'other',
      nutrients: {
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        sodium_mg: 0,
        saturated_fat_g: 0,
        cholesterol_mg: 0,
        added_sugar_g: 0,
        potassium_mg: 0,
        vitamin_a_dv: 0,
        vitamin_c_dv: 0,
        vitamin_d_dv: 0,
        calcium_dv: 0,
        iron_dv: 0,
        potassium_dv: 0
      }
    }

    // Open edit modal for new food
    setEditingFood({ food: newFood, index: mealData.foods.length })
  }

  // Save new food (called from modal)
  const handleSaveNewFood = (_index: number, newFood: FoodItem) => {
    if (!mealData) return

    // Add to foods array
    const updatedFoods = [...mealData.foods, newFood]

    const totalCalories = updatedFoods.reduce(
      (sum, food) => sum + (food.nutrients.calories * food.estimated_grams) / 100,
      0
    )

    setMealData({
      ...mealData,
      foods: updatedFoods,
      estimated_calories_low: Math.round(totalCalories * 0.9),
      estimated_calories_high: Math.round(totalCalories * 1.1)
    })

    // Set new food portion size to M
    setPortionSizes(prev => ({ ...prev, [updatedFoods.length - 1]: 'M' }))
  }

  // Save corrections
  const handleSaveCorrections = () => {
    if (!mealData || !originalMealData) return

    saveMealCorrection(
      mealData.meal_id,
      originalMealData.foods,
      mealData.foods,
      image
    )

    setOriginalMealData(mealData) // Update baseline
    setHasEdits(false)

    // Show success message
    alert('✅ Corrections saved! Your feedback helps improve accuracy.')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wellness Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">{mealData.primary_cuisine} • {mealData.meal_type}</p>
        </div>
        <button
          onClick={() => navigate('/scan')}
          className="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-all text-sm"
        >
          Scan Another
        </button>
      </div>

      {/* Meal Image with Visual Segmentation Overlay */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <FoodSegmentationOverlay
          imageUrl={image}
          foods={mealData.foods}
        />
      </div>

      {/* Reference Object Detection Badge */}
      {mealData.reference_object_detected && mealData.reference_object_detected !== 'none' && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-blue-100">Reference Object Detected: {mealData.reference_object_detected.replace('_', ' ')}</p>
            <p className="text-sm text-blue-200/80">Portion estimates are more accurate! (NYU research-backed)</p>
          </div>
        </div>
      )}

      {/* Confidence Filtering Notice */}
      {mealData.filtered_foods && mealData.filtered_foods.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-yellow-100">
              {mealData.filtered_foods.length} low-confidence item{mealData.filtered_foods.length > 1 ? 's' : ''} filtered out
            </p>
            <p className="text-sm text-yellow-200/80">
              Removed: {mealData.filtered_foods.map(f => f.name).join(', ')} (confidence &lt;50%)
            </p>
          </div>
        </div>
      )}

      {/* Smart Validation Warnings */}
      {mealData.validation_warnings && mealData.validation_warnings.length > 0 && (
        <div className="space-y-2">
          {mealData.validation_warnings
            .filter(w => w.severity === 'error' || w.severity === 'warning')
            .slice(0, 3) // Show top 3 warnings
            .map((warning, idx) => {
              const colors = getWarningColor(warning.severity)
              return (
                <div key={idx} className={`${colors.bg} border ${colors.border} rounded-xl p-4 flex items-start gap-3`}>
                  <svg className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {warning.severity === 'error' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    )}
                  </svg>
                  <div className="flex-1">
                    <p className={`font-medium ${colors.text}`}>{warning.message}</p>
                    {warning.suggestion && (
                      <p className="text-sm text-white/60 mt-1">💡 {warning.suggestion}</p>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Calorie Summary */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6 border border-green-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm text-white/60 uppercase tracking-wide">Estimated Calories</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {mealData.estimated_calories_low} - {mealData.estimated_calories_high}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Food Items with Edit & Portion Adjusters */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Foods Identified</h3>
          <div className="flex gap-2">
            <button
              onClick={handleAddFood}
              className="px-4 py-2 rounded-lg border border-green-500/50 text-green-400 hover:bg-green-500/10 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Food
            </button>
            {hasEdits && (
              <button
                onClick={handleSaveCorrections}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Corrections
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {mealData.foods.map((food, index) => {
            const confidenceLevel = getConfidenceLevel(food.confidence)
            const confidenceColors = getConfidenceColor(confidenceLevel)
            const warning = getConfidenceWarning(food)

            return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{food.name}</p>
                  {/* Confidence Badge */}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${confidenceColors.badge}`}>
                    {Math.round(food.confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm text-white/50">
                  {food.estimated_grams}g • {Math.round((food.nutrients.calories * food.estimated_grams) / 100)} cal
                </p>
                {/* Warning for low confidence */}
                {warning && (
                  <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Please verify
                  </p>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditingFood({ food, index })}
                className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>

              {/* Portion Adjuster */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updatePortion(index, getPortionPreset(index, 'S'), 'S')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    portionSizes[index] === 'S'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  S
                </button>
                <button
                  onClick={() => updatePortion(index, getPortionPreset(index, 'M'), 'M')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    portionSizes[index] === 'M'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  M
                </button>
                <button
                  onClick={() => updatePortion(index, getPortionPreset(index, 'L'), 'L')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    portionSizes[index] === 'L'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  L
                </button>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* Condition Verdict */}
      {mealData.verdict && <VerdictCard verdict={mealData.verdict} />}

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <MacroDonut mealData={mealData} />
        <MicronutrientBars mealData={mealData} />
        <div className="md:col-span-2">
          <IngredientQuality mealData={mealData} />
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights mealData={mealData} />

      {/* Edit Food Modal */}
      {editingFood && (
        <EditFoodModal
          food={editingFood.food}
          index={editingFood.index}
          onSave={editingFood.index >= mealData.foods.length ? handleSaveNewFood : handleEditFood}
          onDelete={handleDeleteFood}
          onClose={() => setEditingFood(null)}
        />
      )}
    </div>
  )
}
