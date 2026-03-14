import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Rectangle } from 'recharts'
import { useTranslation } from 'react-i18next'
import type { MealData } from '../../types'

interface MicronutrientBarsProps {
  mealData: MealData
}

export function MicronutrientBars({ mealData }: MicronutrientBarsProps) {
  const { t } = useTranslation()

  // Store translated nutrient names in variables
  const vitaminALabel = t('charts.micros.vitaminA')
  const vitaminCLabel = t('charts.micros.vitaminC')
  const vitaminDLabel = t('charts.micros.vitaminD')
  const calciumLabel = t('charts.micros.calcium')
  const ironLabel = t('charts.micros.iron')
  const potassiumLabel = t('charts.micros.potassium')

  // Calculate total micronutrients from all foods (% DV)
  const micronutrients = {
    [vitaminALabel]: mealData.foods.reduce((sum, food) => sum + food.nutrients.vitamin_a_dv, 0),
    [vitaminCLabel]: mealData.foods.reduce((sum, food) => sum + food.nutrients.vitamin_c_dv, 0),
    [vitaminDLabel]: mealData.foods.reduce((sum, food) => sum + food.nutrients.vitamin_d_dv, 0),
    [calciumLabel]: mealData.foods.reduce((sum, food) => sum + food.nutrients.calcium_dv, 0),
    [ironLabel]: mealData.foods.reduce((sum, food) => sum + food.nutrients.iron_dv, 0),
    [potassiumLabel]: mealData.foods.reduce((sum, food) => sum + food.nutrients.potassium_dv, 0)
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
      <h3 className="text-lg font-semibold mb-4">{t('charts.micros.title')}</h3>
      <p className="text-xs text-white/50 mb-4">{t('charts.micros.subtitle')}</p>

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
            formatter={(value: any) => [t('charts.micros.tooltipFormat', { value }), '']}
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
          <span>{t('charts.micros.legendHigh')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>{t('charts.micros.legendMedium')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>{t('charts.micros.legendLow')}</span>
        </div>
      </div>
    </div>
  )
}
