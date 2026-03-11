import { getJournal } from '../lib/healthStorage'
import { CONDITION_LABELS } from '../data/healthThresholds'
import type { VerdictLevel } from '../types'

const VERDICT_STYLES: Record<VerdictLevel, { dot: string; label: string }> = {
  safe: { dot: 'bg-green-500', label: 'Safe' },
  caution: { dot: 'bg-yellow-400', label: 'Caution' },
  avoid: { dot: 'bg-red-500', label: 'Avoid' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  })
}

export function JournalPage() {
  const entries = getJournal()

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-white/40 text-sm">No meals logged yet.</p>
        <p className="text-white/30 text-xs mt-1">Scan a meal to start tracking.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <h1 className="text-xl font-bold mb-6">Meal Journal</h1>
      <div className="flex flex-col gap-3">
        {entries.map(entry => {
          const verdict = entry.verdict
          const style = verdict ? VERDICT_STYLES[verdict.overall] : null

          return (
            <div key={entry.meal_id} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {style && (
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    )}
                    <span className="font-medium text-sm capitalize">{entry.meal_type}</span>
                    <span className="text-white/30 text-xs">{formatDate(entry.timestamp)}</span>
                  </div>
                  <p className="text-white/60 text-xs">
                    {entry.foods.map(f => f.name).join(', ')}
                  </p>
                  {verdict && verdict.byCondition.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {verdict.byCondition.map(c => (
                        <span
                          key={c.condition}
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            c.verdict === 'avoid' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                            c.verdict === 'caution' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                            'bg-green-500/10 border-green-500/30 text-green-300'
                          }`}
                        >
                          {CONDITION_LABELS[c.condition]}: {c.verdict}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold">
                    {entry.estimated_calories_low}–{entry.estimated_calories_high}
                  </div>
                  <div className="text-white/40 text-xs">cal</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
