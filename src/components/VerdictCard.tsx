import { useTranslation } from 'react-i18next'
import { CONDITION_LABELS } from '../data/healthThresholds'
import type { ConditionFlag, MealVerdict, VerdictLevel } from '../types'

// Handles both new object flags and legacy string flags
function normalizeFlag(flag: ConditionFlag | string): ConditionFlag {
  if (typeof flag === 'string') return { text: flag, source: '', url: '' }
  return flag
}

const VERDICT_ICON: Record<VerdictLevel, string> = {
  safe: '✓',
  caution: '⚠',
  avoid: '✕',
}

const VERDICT_STYLES: Record<VerdictLevel, {
  section: string
  badge: string
  iconBg: string
  heading: string
  conditionBorder: string
}> = {
  avoid: {
    section: 'bg-red-50 border-red-200',
    badge: 'bg-red-600 text-white',
    iconBg: 'bg-red-600 text-white',
    heading: 'text-red-600',
    conditionBorder: 'border-red-100',
  },
  caution: {
    section: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-500 text-white',
    iconBg: 'bg-yellow-500 text-white',
    heading: 'text-yellow-700',
    conditionBorder: 'border-yellow-100',
  },
  safe: {
    section: 'bg-green-50 border-green-200',
    badge: 'bg-green-600 text-white',
    iconBg: 'bg-green-600 text-white',
    heading: 'text-green-700',
    conditionBorder: 'border-green-100',
  },
}

const CONDITION_VERDICT_COLORS: Record<VerdictLevel, string> = {
  avoid: 'text-red-600',
  caution: 'text-yellow-600',
  safe: 'text-green-600',
}

interface VerdictCardProps {
  verdict: MealVerdict
}

export function VerdictCard({ verdict }: VerdictCardProps) {
  const { t } = useTranslation()
  const styles = VERDICT_STYLES[verdict.overall]

  return (
    <div className={`rounded-3xl p-5 md:p-6 border relative ${styles.section}`}>
      {/* Overall verdict badge (top-right) */}
      <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded ${styles.badge}`}>
        {t(`verdictLevels.${verdict.overall}`).toUpperCase()}
      </span>

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold ${styles.iconBg}`}>
          {VERDICT_ICON[verdict.overall]}
        </div>
        <div>
          <h2 className={`font-bold text-lg ${styles.heading}`}>
            {t(`verdictCard.${verdict.overall}`)}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">{t('verdictCard.basedOnProfile')}</p>
        </div>
      </div>

      {/* Per-condition breakdown */}
      {verdict.byCondition.length > 0 && (
        <div className="space-y-4">
          {verdict.byCondition.map(c => (
            <div key={c.condition} className={`bg-white rounded-2xl p-4 border ${styles.conditionBorder}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-slate-800">{CONDITION_LABELS(t)[c.condition]}</h3>
                <span className={`text-xs font-bold uppercase ${CONDITION_VERDICT_COLORS[c.verdict]}`}>
                  {t(`verdictLevels.${c.verdict}`)}
                </span>
              </div>
              {c.flags.length > 0 && (
                <ul className="space-y-3">
                  {c.flags.map((raw, i) => {
                    const flag = normalizeFlag(raw)
                    return (
                      <li key={i}>
                        <div className="text-slate-700 text-sm flex flex-wrap items-center gap-1.5">
                          <span>• {flag.text}</span>
                          {flag.url && (
                            <a
                              href={flag.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs break-all"
                            >
                              {flag.source} ↗
                            </a>
                          )}
                        </div>
                        {flag.topOffenders && flag.topOffenders.length > 0 && (
                          <div className="mt-1 ml-3 text-slate-500 text-xs">
                            Main sources: {flag.topOffenders.map(f => `${f.name} (${f.amount})`).join(', ')}
                          </div>
                        )}
                        {flag.swapSuggestion && (
                          <div className="mt-1.5 ml-3 flex items-start gap-1.5">
                            <span className="text-green-600 text-xs">↔</span>
                            <span className="text-green-600 text-xs">{flag.swapSuggestion}</span>
                          </div>
                        )}
                        {flag.population && (
                          <div className="mt-1 ml-3 text-slate-400 text-xs italic leading-snug">
                            {flag.population.stat}{' '}
                            <a
                              href={flag.population.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 underline underline-offset-2 not-italic break-all"
                            >
                              {flag.population.source} ({flag.population.sampleSize}) ↗
                            </a>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI insight */}
      {verdict.aiInsight && (
        <p className="mt-3 text-slate-600 text-sm border-t border-slate-200 pt-3">
          {verdict.aiInsight}
        </p>
      )}
    </div>
  )
}
