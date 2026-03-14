import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { useTranslation } from 'react-i18next'
import type { MealData } from '../../types'

interface MacroDonutProps {
  mealData: MealData
}

export function MacroDonut({ mealData }: MacroDonutProps) {
  const { t } = useTranslation()

  // Calculate total macros from all foods
  const totalProtein = mealData.foods.reduce(
    (sum, food) => sum + (food.nutrients.protein_g * food.estimated_grams) / 100,
    0
  )
  const totalCarbs = mealData.foods.reduce(
    (sum, food) => sum + (food.nutrients.carbs_g * food.estimated_grams) / 100,
    0
  )
  const totalFat = mealData.foods.reduce(
    (sum, food) => sum + (food.nutrients.fat_g * food.estimated_grams) / 100,
    0
  )

  // Store translated labels in variables for chart data
  const proteinLabel = t('charts.macros.protein')
  const carbsLabel = t('charts.macros.carbs')
  const fatLabel = t('charts.macros.fat')

  const data = [
    { name: proteinLabel, value: Math.round(totalProtein), color: '#10b981' },
    { name: carbsLabel, value: Math.round(totalCarbs), color: '#3b82f6' },
    { name: fatLabel, value: Math.round(totalFat), color: '#f59e0b' }
  ]

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold mb-4">{t('charts.macros.title')}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-white/80 text-sm">
                {value}: {entry.payload.value}g
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
