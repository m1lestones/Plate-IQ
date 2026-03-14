import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { saveHealthProfile } from '../lib/healthStorage'
import type { HealthCondition, HealthProfile } from '../types'

const CONDITIONS: { id: HealthCondition; icon: string }[] = [
  {
    id: 'hypertension',
    icon: '🫀',
  },
  {
    id: 'high_cholesterol',
    icon: '🩸',
  },
  {
    id: 'type2_diabetes',
    icon: '📊',
  },
  {
    id: 'stroke_risk',
    icon: '🧠',
  },
]

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Set<HealthCondition>>(new Set())

  const toggle = (id: HealthCondition) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleContinue = () => {
    const profile: HealthProfile = {
      conditions: Array.from(selected),
      setupComplete: true,
    }
    saveHealthProfile(profile)
    navigate('/')
  }

  const handleSkip = () => {
    saveHealthProfile({ conditions: [], setupComplete: true })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">{t('onboarding.title')}</h1>
          <p className="text-white/50 text-sm mt-2">
            {t('onboarding.subtitle')}
          </p>
        </div>

        {/* Condition cards */}
        <div className="flex flex-col gap-3 mb-8">
          {CONDITIONS.map(c => {
            const isSelected = selected.has(c.id)
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`w-full text-left px-4 py-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-green-500/15 border-green-500/60'
                    : 'bg-white/5 border-white/10 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{t(`onboarding.conditions.${c.id}.label`)}</div>
                    <div className="text-white/50 text-xs mt-0.5">{t(`onboarding.conditions.${c.id}.description`)}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-green-500 border-green-500' : 'border-white/30'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <button
          onClick={handleContinue}
          className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold transition-all"
        >
          {selected.size > 0 ? t('onboarding.continueWith', { count: selected.size }) : t('onboarding.continue')}
        </button>
        <button
          onClick={handleSkip}
          className="w-full py-3 mt-2 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          {t('onboarding.skip')}
        </button>
      </div>
    </div>
  )
}
