import type { MealData } from '../../types'

interface IngredientQualityProps {
  mealData: MealData
}

export function IngredientQuality({ mealData }: IngredientQualityProps) {
  // Count foods by processing level
  const wholeFoods = mealData.foods.filter(f => f.nova_level === 1).length
  const minimallyProcessed = mealData.foods.filter(f => f.nova_level === 2).length
  const processed = mealData.foods.filter(f => f.nova_level === 3).length
  const ultraProcessed = mealData.foods.filter(f => f.nova_level === 4).length

  const total = mealData.foods.length

  // Calculate percentages
  const wholePercent = (wholeFoods / total) * 100
  const minimalPercent = (minimallyProcessed / total) * 100
  const processedPercent = (processed / total) * 100
  const ultraPercent = (ultraProcessed / total) * 100

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold mb-4">Ingredient Quality</h3>

      {/* Stacked bar */}
      <div className="h-8 bg-white/10 rounded-full overflow-hidden flex mb-4">
        {wholePercent > 0 && (
          <div
            className="bg-green-500 flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${wholePercent}%` }}
          >
            {wholePercent >= 15 && `${Math.round(wholePercent)}%`}
          </div>
        )}
        {minimalPercent > 0 && (
          <div
            className="bg-yellow-500 flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${minimalPercent}%` }}
          >
            {minimalPercent >= 15 && `${Math.round(minimalPercent)}%`}
          </div>
        )}
        {processedPercent > 0 && (
          <div
            className="bg-orange-500 flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${processedPercent}%` }}
          >
            {processedPercent >= 15 && `${Math.round(processedPercent)}%`}
          </div>
        )}
        {ultraPercent > 0 && (
          <div
            className="bg-red-500 flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${ultraPercent}%` }}
          >
            {ultraPercent >= 15 && `${Math.round(ultraPercent)}%`}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <div>
            <div className="text-white/80">Whole Foods</div>
            <div className="text-white/50 text-xs">{wholeFoods} items</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <div>
            <div className="text-white/80">Minimal</div>
            <div className="text-white/50 text-xs">{minimallyProcessed} items</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <div>
            <div className="text-white/80">Processed</div>
            <div className="text-white/50 text-xs">{processed} items</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <div>
            <div className="text-white/80">Ultra-Processed</div>
            <div className="text-white/50 text-xs">{ultraProcessed} items</div>
          </div>
        </div>
      </div>
    </div>
  )
}
