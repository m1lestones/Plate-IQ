import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Rectangle } from 'recharts'
import type { MealData } from '../../types'

interface MicronutrientBarsProps {
  mealData: MealData
}

export function MicronutrientBars({ mealData }: MicronutrientBarsProps) {
  // Calculate total micronutrients from all foods (% DV)
  const micronutrients = {
    'Vitamin A': mealData.foods.reduce((sum, food) => sum + food.nutrients.vitamin_a_dv, 0),
    'Vitamin C': mealData.foods.reduce((sum, food) => sum + food.nutrients.vitamin_c_dv, 0),
    'Vitamin D': mealData.foods.reduce((sum, food) => sum + food.nutrients.vitamin_d_dv, 0),
    'Calcium': mealData.foods.reduce((sum, food) => sum + food.nutrients.calcium_dv, 0),
    'Iron': mealData.foods.reduce((sum, food) => sum + food.nutrients.iron_dv, 0),
    'Potassium': mealData.foods.reduce((sum, food) => sum + food.nutrients.potassium_dv, 0)
  }

  const data = Object.entries(micronutrients).map(([name, value]) => ({
    name,
    value: Math.round(value),
    fullName: name
  }))

  // Color based on % DV: green if >=20%, yellow if 10-20%, red if <10%
  const getColor = (value: number) => {
    if (value >= 20) return '#10b981'
    if (value >= 10) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold mb-4">Micronutrient Coverage</h3>
      <p className="text-xs text-white/50 mb-4">% of Daily Value per serving</p>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis type="number" stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#171717',
              border: '1px solid #ffffff20',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#fff' }}
            formatter={(value: any) => [`${value}% DV`, '']}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            shape={(props: any) => <Rectangle {...props} fill={getColor(props.value)} />}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-white/60 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>≥20% DV</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>10-20% DV</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>&lt;10% DV</span>
        </div>
      </div>
    </div>
  )
}
