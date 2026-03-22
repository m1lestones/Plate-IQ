import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MacroDonut } from '../components/charts/MacroDonut'
import { MicronutrientBars } from '../components/charts/MicronutrientBars'
import { IngredientQuality } from '../components/charts/IngredientQuality'
import { AIInsights } from '../components/AIInsights'
import { VerdictCard } from '../components/VerdictCard'
import { EditFoodModal } from '../components/EditFoodModal'
import { FoodSegmentationOverlay } from '../components/FoodSegmentationOverlay'
import { saveMealCorrection } from '../lib/correctionTracking'
import { getHealthProfile, getLastScan } from '../lib/healthStorage'
import { evaluateMeal } from '../lib/thresholdEngine'
import type { MealData, FoodItem } from '../types'

export function DashboardPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const initialMealData = (location.state?.mealData as MealData | undefined) || getLastScan()
  const image = (location.state?.image as string | undefined) || initialMealData?.image_url

  const [mealData, setMealData] = useState<MealData | null>(initialMealData || null)
  const [originalMealData, setOriginalMealData] = useState<MealData | null>(initialMealData || null)
  const [editingFood, setEditingFood] = useState<{ food: FoodItem; index: number } | null>(null)
  const [hasEdits, setHasEdits] = useState(false)
  const [portionSizes, setPortionSizes] = useState<Record<number, 'S' | 'M' | 'L'>>({})

  // Recompute verdict on mount so topOffenders and NHANES context are always fresh
  useEffect(() => {
    if (!mealData) return
    const profile = getHealthProfile()
    if (!profile || profile.conditions.length === 0) return
    const { overall, byCondition } = evaluateMeal(mealData, profile.conditions)
    setMealData(prev => prev ? { ...prev, verdict: { overall, byCondition, aiInsight: prev.verdict?.aiInsight ?? '' } } : prev)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          <p className="text-slate-500">{t('dashboard.noMealData')}</p>
          <button
            onClick={() => navigate('/scan')}
            className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold transition-all"
          >
            {t('dashboard.scanAMeal')}
          </button>
        </div>
      </div>
    )
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
    alert(t('dashboard.correctionsSaved'))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{mealData.primary_cuisine} • {mealData.meal_type}</p>
        </div>
        <button
          onClick={() => navigate('/scan')}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all text-sm"
        >
          {t('dashboard.scanAnother')}
        </button>
      </div>

      {/* Condition Verdict — first, matching Stitch design */}
      {mealData.verdict && <VerdictCard verdict={mealData.verdict} />}

      {/* Meal Image with Visual Segmentation Overlay */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Meal subtitle */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-slate-500 text-sm capitalize">{mealData.meal_type}</p>
          <h2 className="text-lg font-bold text-slate-800">{mealData.primary_cuisine}</h2>
        </div>
        <div className="px-4 pb-4">
          <FoodSegmentationOverlay
            imageUrl={image}
            foods={mealData.foods}
            onEditFood={(food, index) => setEditingFood({ food, index })}
            onAddFood={handleAddFood}
            hasEdits={hasEdits}
            onSaveCorrections={handleSaveCorrections}
          />
        </div>
      </div>

      {/* Reference Object Detection Badge */}
      {mealData.reference_object_detected && mealData.reference_object_detected !== 'none' && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-blue-800">{t('dashboard.referenceObjectDetected', { object: mealData.reference_object_detected.replace('_', ' ') })}</p>
            <p className="text-sm text-blue-600">{t('dashboard.referenceObjectMessage')}</p>
          </div>
        </div>
      )}

      {/* Confidence Filtering Notice */}
      {mealData.filtered_foods && mealData.filtered_foods.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">
              {t('dashboard.filteredFoodsTitle', { count: mealData.filtered_foods.length })}
            </p>
            <p className="text-sm text-yellow-700">
              {t('dashboard.filteredFoodsMessage', { foods: mealData.filtered_foods.map(f => f.name).join(', ') })}
            </p>
          </div>
        </div>
      )}

      {/* Calorie Summary */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{t('dashboard.estimatedCalories')}</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">
              {mealData.estimated_calories_low} – {mealData.estimated_calories_high}
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Macros & Micros Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <MacroDonut mealData={mealData} />
        <MicronutrientBars mealData={mealData} />
      </div>

      {/* Food Quality + AI Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <IngredientQuality mealData={mealData} />
        <AIInsights mealData={mealData} />
      </div>

      {/* Edit Food Modal */}
      {editingFood && (
        <EditFoodModal
          food={editingFood.food}
          index={editingFood.index}
          originalGrams={originalMealData?.foods[editingFood.index]?.estimated_grams}
          portionSize={portionSizes[editingFood.index]}
          onSave={(index, updatedFood, size) => {
            if (editingFood.index >= mealData.foods.length) {
              handleSaveNewFood(index, updatedFood)
            } else {
              handleEditFood(index, updatedFood)
              if (size) setPortionSizes(prev => ({ ...prev, [index]: size }))
            }
          }}
          onDelete={handleDeleteFood}
          onClose={() => setEditingFood(null)}
        />
      )}
    </div>
  )
}
