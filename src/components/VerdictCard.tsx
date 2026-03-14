import { useTranslation } from 'react-i18next'
import { CONDITION_LABELS, CONDITION_BG, CONDITION_COLORS } from '../data/healthThresholds'
import type { MealVerdict, VerdictLevel } from '../types'

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
          <div className={`font-semibold ${CONDITION_COLORS[verdict.overall]}`}>
            {t(`verdictCard.${verdict.overall}`)}
          </div>
          <div className="text-white/50 text-xs mt-0.5">{t('verdictCard.basedOnProfile')}</div>
        </div>
      </div>

      {/* Per-condition breakdown */}
      {verdict.byCondition.length > 0 && (
        <div className="space-y-3">
          {verdict.byCondition.map(c => (
            <div key={c.condition} className="bg-black/20 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{CONDITION_LABELS(t)[c.condition]}</span>
                <span className={`text-xs font-semibold uppercase ${CONDITION_COLORS[c.verdict]}`}>
                  {t(`verdictLevels.${c.verdict}`)}
                </span>
              </div>
              {c.flags.length > 0 && (
                <ul className="space-y-0.5">
                  {c.flags.map((flag, i) => (
                    <li key={i} className="text-white/50 text-xs">• {flag}</li>
                  ))}
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
