import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHealthProfile, saveHealthProfile, clearAllData } from '../lib/healthStorage'
import type { HealthCondition } from '../types'

const CONDITIONS: { id: HealthCondition; icon: string; label: string; description: string }[] = [
  { id: 'hypertension',      icon: '🫀', label: 'Hypertension',      description: 'High blood pressure — track sodium & potassium' },
  { id: 'high_cholesterol',  icon: '🩸', label: 'High Cholesterol',   description: 'Monitor saturated fat, cholesterol & fiber' },
  { id: 'type2_diabetes',    icon: '📊', label: 'Type 2 Diabetes',    description: 'Track carbohydrates, added sugar & fiber' },
  { id: 'stroke_risk',       icon: '🧠', label: 'Stroke Risk',        description: 'Combined sodium, saturated fat & potassium tracking' },
]

export function ProfilePage() {
  const navigate = useNavigate()
  const profile = getHealthProfile()
  const [selected, setSelected] = useState<Set<HealthCondition>>(
    new Set(profile?.conditions ?? [])
  )
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggle = (id: HealthCondition) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setSaved(false)
  }

  const handleSave = () => {
    saveHealthProfile({ conditions: Array.from(selected), setupComplete: true })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    clearAllData()
    navigate('/onboarding')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Health Profile</h1>
        <p className="text-white/50 text-sm mt-1">Update your conditions anytime — PlateIQ adjusts your meal analysis accordingly.</p>
      </div>

      {/* Conditions */}
      <div className="flex flex-col gap-3 mb-6">
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
                  <div className="font-semibold text-sm">{c.label}</div>
                  <div className="text-white/50 text-xs mt-0.5">{c.description}</div>
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

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
          saved
            ? 'bg-green-600 text-white'
            : 'bg-green-500 hover:bg-green-400 text-white'
        }`}
      >
        {saved ? '✓ Saved' : 'Save Changes'}
      </button>

      {/* Reset section */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h2 className="text-sm font-semibold text-white/70 mb-1">Data & Privacy</h2>
        <p className="text-xs text-white/40 mb-4">All data is stored locally on your device. Resetting will clear your health profile, scan history, and all saved meals.</p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
          >
            Reset All Data
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-red-300 mb-3">This will delete everything and restart onboarding. Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-all"
              >
                Yes, reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
