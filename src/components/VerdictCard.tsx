import { useTranslation } from 'react-i18next'
import { CONDITION_LABELS, CONDITION_BG, CONDITION_COLORS } from '../data/healthThresholds'
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

interface VerdictCardProps {
  verdict: MealVerdict
}

export function VerdictCard({ verdict }: VerdictCardProps) {
  const { t } = useTranslation()
  return (
    <div className={`rounded-2xl p-5 border ${CONDITION_BG[verdict.overall]}`}>
      {/* Overall verdict */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
          verdict.overall === 'safe' ? 'bg-green-500/20 text-green-400' :
          verdict.overall === 'caution' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {VERDICT_ICON[verdict.overall]}
        </div>
        <div>
          <div className={`text-2xl font-bold ${CONDITION_COLORS[verdict.overall]}`}>
            {t(`verdictCard.${verdict.overall}`)}
          </div>
          <div className="text-white/50 text-sm mt-0.5">{t('verdictCard.basedOnProfile')}</div>
        </div>
      </div>

      {/* Per-condition breakdown */}
      {verdict.byCondition.length > 0 && (
        <div className="space-y-3">
          {verdict.byCondition.map(c => (
            <div key={c.condition} className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold">{CONDITION_LABELS(t)[c.condition]}</span>
                <span className={`text-base font-bold uppercase ${CONDITION_COLORS[c.verdict]}`}>
                  {t(`verdictLevels.${c.verdict}`)}
                </span>
              </div>
              {c.flags.length > 0 && (
                <ul className="space-y-3">
                  {c.flags.map((raw, i) => {
                    const flag = normalizeFlag(raw)
                    return (
                      <li key={i}>
                        <div className="text-white/70 text-base flex items-center gap-1.5">
                          <span>• {flag.text}</span>
                          {flag.url && (
                            <a
                              href={flag.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 whitespace-nowrap"
                            >
                              {flag.source} ↗
                            </a>
                          )}
                        </div>
                        {flag.topOffenders && flag.topOffenders.length > 0 && (
                          <div className="mt-1 ml-3 text-white/50 text-sm">
                            Main sources: {flag.topOffenders.map(f => `${f.name} (${f.amount})`).join(', ')}
                          </div>
                        )}
                        {flag.population && (
                          <div className="mt-1 ml-3 text-white/30 text-sm italic leading-snug">
                            {flag.population.stat}{' '}
                            <a
                              href={flag.population.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400/60 hover:text-blue-300 underline underline-offset-2 not-italic whitespace-nowrap"
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
        <p className="mt-3 text-white/70 text-sm border-t border-white/10 pt-3">
          {verdict.aiInsight}
        </p>
      )}
    </div>
  )
}
