import type { MealData } from '../../types'

interface NovaGaugeProps {
  mealData: MealData
}

export function NovaGauge({ mealData }: NovaGaugeProps) {
  // Calculate average NOVA level weighted by portion
  const totalGrams = mealData.foods.reduce((sum, food) => sum + food.estimated_grams, 0)
  const weightedNova = mealData.foods.reduce(
    (sum, food) => sum + food.nova_level * food.estimated_grams,
    0
  )
  const avgNova = weightedNova / totalGrams

  // Determine color and label based on NOVA level
  const getNovaInfo = (level: number) => {
    if (level <= 1.5) return { color: 'bg-green-500', label: 'Unprocessed', text: 'Whole foods' }
    if (level <= 2.5) return { color: 'bg-yellow-500', label: 'Processed Ingredients', text: 'Minimal processing' }
    if (level <= 3.5) return { color: 'bg-orange-500', label: 'Processed', text: 'Some additives' }
    return { color: 'bg-red-500', label: 'Ultra-Processed', text: 'Highly processed' }
  }

  const novaInfo = getNovaInfo(avgNova)
  const percentage = ((avgNova - 1) / 3) * 100 // Convert 1-4 scale to 0-100%

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold mb-4">NOVA Processing Level</h3>

      {/* Gauge Bar */}
      <div className="mb-6">
        <div className="h-4 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className={`h-full ${novaInfo.color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
          {/* Gradient overlay for visual effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-20" />
        </div>

        {/* Scale markers */}
        <div className="flex justify-between mt-2 text-xs text-white/40">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <div className={`inline-block px-4 py-2 rounded-lg ${novaInfo.color} bg-opacity-20 border border-current`}>
          <p className="font-semibold text-white">{novaInfo.label}</p>
          <p className="text-sm text-white/70">{novaInfo.text}</p>
        </div>
      </div>

      {/* NOVA breakdown */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
        {[1, 2, 3, 4].map((level) => {
          const count = mealData.foods.filter(f => f.nova_level === level).length
          return (
            <div key={level} className="text-center">
              <div className="text-white/60">NOVA {level}</div>
              <div className="text-white font-semibold">{count} items</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
