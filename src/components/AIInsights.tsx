import { useState, useEffect } from 'react'
import type { MealData } from '../types'

interface AIInsightsProps {
  mealData: MealData
}

export function AIInsights({ mealData }: AIInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate AI insights generation (demo mode)
    // In production, this would be a second Claude API call
    const generateInsights = () => {
      const avgNova = mealData.foods.reduce((sum, f) => sum + f.nova_level * f.estimated_grams, 0) /
        mealData.foods.reduce((sum, f) => sum + f.estimated_grams, 0)

      const totalFiber = mealData.foods.reduce(
        (sum, f) => sum + (f.nutrients.fiber_g * f.estimated_grams) / 100,
        0
      )

      const hasProtein = mealData.foods.some(f => f.category === 'protein')
      const hasVegetables = mealData.foods.some(f => f.category === 'vegetable')

      // Generate contextual insights
      let insight = ''

      if (avgNova <= 1.5) {
        insight = `Excellent choice! This meal features whole, unprocessed foods that provide sustained energy and essential nutrients. `
      } else if (avgNova <= 2.5) {
        insight = `Good meal with mostly minimally processed ingredients. `
      } else if (avgNova <= 3.5) {
        insight = `This meal contains some processed foods. Consider swapping processed items for whole food alternatives when possible. `
      } else {
        insight = `This meal is heavily processed. Try replacing ultra-processed items with whole foods to improve nutritional quality. `
      }

      // Add fiber insight
      if (totalFiber < 8) {
        insight += `This meal is low in fiber (${Math.round(totalFiber)}g). Try adding beans, lentils, or leafy greens to boost fiber intake. `
      }

      // Add protein insight
      if (!hasProtein) {
        insight += `Consider adding a lean protein source like chicken, fish, tofu, or legumes. `
      }

      // Add veggie insight
      if (!hasVegetables) {
        insight += `Add colorful vegetables to increase vitamins and minerals. `
      } else {
        insight += `Great job including vegetables! `
      }

      // Food swap suggestion
      const processedFoods = mealData.foods.filter(f => f.nova_level >= 3)
      if (processedFoods.length > 0) {
        const food = processedFoods[0]
        if (food.name.toLowerCase().includes('sauce')) {
          insight += `\n\n💡 Swap suggestion: Replace store-bought sauce with homemade using fresh tomatoes and herbs.`
        } else if (food.name.toLowerCase().includes('pasta')) {
          insight += `\n\n💡 Swap suggestion: Try whole grain or legume-based pasta for more fiber and protein.`
        } else {
          insight += `\n\n💡 Swap suggestion: Replace ${food.name.toLowerCase()} with a whole food alternative.`
        }
      }

      return insight.trim()
    }

    // Simulate API delay
    setTimeout(() => {
      setInsights(generateInsights())
      setLoading(false)
    }, 1500)
  }, [mealData])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/20">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full" />
          <span className="text-white/60">Generating AI wellness insights...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-white">AI Wellness Insights</h3>
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
            {insights}
          </p>
        </div>
      </div>
    </div>
  )
}
