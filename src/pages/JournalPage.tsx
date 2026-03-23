import { useTranslation } from 'react-i18next'
import { getJournal } from '../lib/healthStorage'
import { CONDITION_LABELS } from '../data/healthThresholds'
import type { VerdictLevel } from '../types'

const VERDICT_STYLES: Record<VerdictLevel, { dot: string }> = {
  safe: { dot: 'bg-green-500' },
  caution: { dot: 'bg-yellow-400' },
  avoid: { dot: 'bg-red-500' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  })
}

export function JournalPage() {
  const { t } = useTranslation()
  const entries = getJournal()

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-slate-400 text-sm">{t('journal.noMeals')}</p>
        <p className="text-slate-300 text-xs mt-1">{t('journal.noMealsPrompt')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <h1 className="text-xl font-bold mb-6">{t('journal.title')}</h1>
      <div className="flex flex-col gap-3">
        {entries.map(entry => {
          const verdict = entry.verdict
          const style = verdict ? VERDICT_STYLES[verdict.overall] : null

          return (
            <div key={entry.meal_id} className="bg-white border border-slate-100 rounded-3xl px-4 py-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {style && (
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    )}
                    <span className="font-medium text-sm text-slate-800 capitalize">{entry.meal_type}</span>
                    <span className="text-slate-400 text-xs">{formatDate(entry.timestamp)}</span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {entry.foods.map(f => f.name).join(', ')}
                  </p>
                  {verdict && verdict.byCondition.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {verdict.byCondition.map(c => (
                        <span
                          key={c.condition}
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            c.verdict === 'avoid' ? 'bg-red-50 border-red-200 text-red-600' :
                            c.verdict === 'caution' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                            'bg-green-50 border-green-200 text-green-700'
                          }`}
                        >
                          {CONDITION_LABELS(t)[c.condition]}: {t(`verdictLevels.${c.verdict}`)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-slate-800">
                    {entry.estimated_calories_low}–{entry.estimated_calories_high}
                  </div>
                  <div className="text-slate-400 text-xs">{t('journal.calories')}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
