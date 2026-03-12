import { useState } from 'react'
import type { MealData } from '../../types'

interface IngredientQualityProps {
  mealData: MealData
}

export function IngredientQuality({ mealData }: IngredientQualityProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const wholeFoods = mealData.foods.filter(f => f.nova_level === 1).length
  const lightlyProcessed = mealData.foods.filter(f => f.nova_level === 2).length
  const processed = mealData.foods.filter(f => f.nova_level === 3).length
  const ultraProcessed = mealData.foods.filter(f => f.nova_level === 4).length
  const total = mealData.foods.length

  // Weighted average NOVA (1–4), then invert so 1 = right (100%), 4 = left (0%)
  const totalGrams = mealData.foods.reduce((sum, f) => sum + f.estimated_grams, 0)
  const weightedNova = mealData.foods.reduce((sum, f) => sum + f.nova_level * f.estimated_grams, 0)
  const avgNova = totalGrams > 0 ? weightedNova / totalGrams : 2.5
  const markerPercent = ((4 - avgNova) / 3) * 100 // 4→0%, 1→100%

  const getLabel = (nova: number) => {
    if (nova <= 1.5) return { text: 'Mostly Whole Foods', color: 'text-green-400' }
    if (nova <= 2.5) return { text: 'Lightly Processed', color: 'text-yellow-400' }
    if (nova <= 3.5) return { text: 'Moderately Processed', color: 'text-orange-400' }
    return { text: 'Highly Processed', color: 'text-red-400' }
  }

  const label = getLabel(avgNova)

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold">Food Quality Breakdown</h3>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </button>
          {showTooltip && (
            <div className="absolute left-6 top-0 z-10 w-56 bg-gray-800 border border-white/10 rounded-lg p-3 text-xs text-white/80 shadow-lg">
              Foods are grouped by how processed they are — from whole foods (fresh produce, plain meat) to ultra-processed (packaged snacks, fast food with additives).
            </div>
          )}
        </div>
      </div>

      {/* Gauge */}
      <div className="mb-2">
        {/* Triangle indicator above bar */}
        <div className="relative h-6 mb-1">
          <div
            className="absolute transition-all duration-500"
            style={{ left: `calc(${markerPercent}% - 14px)` }}
          >
            <svg width="28" height="18" viewBox="0 0 28 18">
              <polygon points="14,18 0,0 28,0" fill="white" />
            </svg>
          </div>
        </div>

        <div className="relative h-6 rounded-full" style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)' }}>
          {/* Vertical line through the bar */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-white/90 transition-all duration-500"
            style={{ left: `calc(${markerPercent}% - 4px)` }}
          />
        </div>

        {/* End labels */}
        <div className="flex justify-between mt-2 text-xs text-white/50">
          <span>Ultra-Processed</span>
          <span>Whole Foods</span>
        </div>
      </div>

      {/* Current label */}
      <div className={`text-center text-sm font-semibold mb-6 ${label.color}`}>
        {label.text}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-2 text-sm border-t border-white/10 pt-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="text-white/80 text-xs">Ultra-Processed</div>
          <div className="text-white/50 text-xs">{ultraProcessed} {ultraProcessed === 1 ? 'item' : 'items'}</div>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <div className="text-white/80 text-xs">Processed</div>
          <div className="text-white/50 text-xs">{processed} {processed === 1 ? 'item' : 'items'}</div>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="text-white/80 text-xs">Lightly Processed</div>
          <div className="text-white/50 text-xs">{lightlyProcessed} {lightlyProcessed === 1 ? 'item' : 'items'}</div>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div className="text-white/80 text-xs">Whole Foods</div>
          <div className="text-white/50 text-xs">{wholeFoods} {wholeFoods === 1 ? 'item' : 'items'}</div>
        </div>
      </div>
    </div>
  )
}
