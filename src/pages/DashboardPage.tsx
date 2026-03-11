import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MacroDonut } from '../components/charts/MacroDonut'
import { NovaGauge } from '../components/charts/NovaGauge'
import { MicronutrientBars } from '../components/charts/MicronutrientBars'
import { IngredientQuality } from '../components/charts/IngredientQuality'
import { AIInsights } from '../components/AIInsights'
import { VerdictCard } from '../components/VerdictCard'
import { EditFoodModal } from '../components/EditFoodModal'
import { saveMealCorrection } from '../lib/correctionTracking'
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
  const updatePortion = (index: number, newGrams: number) => {
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
  }

  // Portion size presets
  const getPortionPreset = (currentGrams: number, size: 'S' | 'M' | 'L') => {
    if (size === 'S') return Math.round(currentGrams * 0.7)
    if (size === 'L') return Math.round(currentGrams * 1.3)
    return currentGrams
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

      {/* Meal Image */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <img
          src={image}
          alt="Your meal"
          className="w-full max-w-md mx-auto rounded-xl"
        />
      </div>

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
        <div className="space-y-3">
          {mealData.foods.map((food, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 gap-3">
              <div className="flex-1">
                <p className="font-medium text-white">{food.name}</p>
                <p className="text-sm text-white/50">
                  {food.estimated_grams}g • {Math.round((food.nutrients.calories * food.estimated_grams) / 100)} cal
                </p>
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
                  onClick={() => updatePortion(index, getPortionPreset(food.estimated_grams, 'S'))}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-all"
                >
                  S
                </button>
                <button
                  onClick={() => updatePortion(index, food.estimated_grams)}
                  className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm transition-all"
                >
                  M
                </button>
                <button
                  onClick={() => updatePortion(index, getPortionPreset(food.estimated_grams, 'L'))}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-all"
                >
                  L
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Condition Verdict */}
      {mealData.verdict && <VerdictCard verdict={mealData.verdict} />}

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <MacroDonut mealData={mealData} />
        <NovaGauge mealData={mealData} />
        <MicronutrientBars mealData={mealData} />
        <IngredientQuality mealData={mealData} />
      </div>

      {/* AI Insights */}
      <AIInsights mealData={mealData} />

      {/* Edit Food Modal */}
      {editingFood && (
        <EditFoodModal
          food={editingFood.food}
          index={editingFood.index}
          onSave={handleEditFood}
          onDelete={handleDeleteFood}
          onClose={() => setEditingFood(null)}
        />
      )}
    </div>
  )
}
