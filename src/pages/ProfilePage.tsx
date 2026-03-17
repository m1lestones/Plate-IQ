import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { getHealthProfile, saveHealthProfile, clearAllData } from '../lib/healthStorage'
import type { HealthCondition } from '../types'

const CONDITIONS: { id: HealthCondition; icon: string; label: string; description: string }[] = [
  { id: 'hypertension',     icon: '🫀', label: 'Hypertension',     description: 'High blood pressure — track sodium & potassium' },
  { id: 'high_cholesterol', icon: '🩸', label: 'High Cholesterol',  description: 'Monitor saturated fat, cholesterol & fiber' },
  { id: 'type2_diabetes',   icon: '📊', label: 'Type 2 Diabetes',   description: 'Track carbohydrates, added sugar & fiber' },
  { id: 'stroke_risk',      icon: '🧠', label: 'Stroke Risk',       description: 'Combined sodium, saturated fat & potassium tracking' },
]

const COUNTRIES = ['United States', 'Mexico', 'Canada', 'United Kingdom', 'Spain', 'France', 'Germany', 'Brazil', 'Argentina', 'Colombia', 'Other']
const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

type Section = 'profile' | 'health' | 'security' | 'data'

export function ProfilePage() {
  const { user, signOut, deleteAccount, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [gender, setGender] = useState('')
  const [dob, setDob] = useState('')
  const [notifications, setNotifications] = useState(true)

  // Health conditions
  const localProfile = getHealthProfile()
  const [selected, setSelected] = useState<Set<HealthCondition>>(
    new Set(localProfile?.conditions ?? [])
  )

  // Load profile from Supabase
  useEffect(() => {
    if (!user) return
    supabase.from('user_profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) {
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
        setCountry(data.country || '')
        setGender(data.gender || '')
        setDob(data.date_of_birth || '')
        setNotifications(data.notifications_enabled ?? true)
        if (data.health_conditions?.length) {
          setSelected(new Set(data.health_conditions))
        }
      }
    })
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('user_profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      phone,
      country,
      gender,
      date_of_birth: dob || null,
      notifications_enabled: notifications,
      health_conditions: Array.from(selected),
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    // Keep localStorage in sync for offline use
    saveHealthProfile({ conditions: Array.from(selected), setupComplete: true })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveConditions = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('user_profiles')
      .update({ health_conditions: Array.from(selected), updated_at: new Date().toISOString() })
      .eq('id', user.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    saveHealthProfile({ conditions: Array.from(selected), setupComplete: true })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleResetPassword = async () => {
    if (!user?.email) return
    const { error } = await resetPassword(user.email)
    if (error) { setError(error); return }
    setResetSent(true)
  }

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount()
    if (error) { setError(error); return }
    navigate('/auth')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const handleResetAppData = async () => {
    clearAllData()
    await signOut()
    navigate('/auth')
  }

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    {
      id: 'profile', label: 'My Profile',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
    {
      id: 'health', label: 'Health Conditions',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    },
    {
      id: 'security', label: 'Security',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    },
    {
      id: 'data', label: 'Data & Privacy',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    },
  ]

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all"
        >
          Sign out
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 overflow-x-auto">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => { setActiveSection(s.id); setError(null) }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSection === s.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* My Profile */}
      {activeSection === 'profile' && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Full Name</label>
            <input
              type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/60"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Email</label>
            <input
              type="email" value={user?.email || ''} disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Phone Number</label>
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/60"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Gender</label>
              <select
                value={gender} onChange={e => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/60"
              >
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Date of Birth</label>
              <input
                type="date" value={dob} onChange={e => setDob(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/60"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Country</label>
            <select
              value={country} onChange={e => setCountry(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/60"
            >
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <div className="text-sm font-medium">Notifications</div>
              <div className="text-xs text-white/40 mt-0.5">Meal reminders and health tips</div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-green-500' : 'bg-white/20'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <button
            onClick={handleSaveProfile} disabled={saving}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
              saved ? 'bg-green-600 text-white' : 'bg-green-500 hover:bg-green-400 text-white'
            } disabled:opacity-50`}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Health Conditions */}
      {activeSection === 'health' && (
        <div className="flex flex-col gap-3">
          <p className="text-white/50 text-sm mb-2">PlateIQ flags meals that exceed clinical limits for each condition you select.</p>
          {CONDITIONS.map(c => {
            const isSelected = selected.has(c.id)
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelected(prev => {
                    const next = new Set(prev)
                    next.has(c.id) ? next.delete(c.id) : next.add(c.id)
                    return next
                  })
                  setSaved(false)
                }}
                className={`w-full text-left px-4 py-4 rounded-2xl border transition-all ${
                  isSelected ? 'bg-green-500/15 border-green-500/60' : 'bg-white/5 border-white/10 hover:bg-white/8'
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
          <button
            onClick={handleSaveConditions} disabled={saving}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all mt-2 ${
              saved ? 'bg-green-600 text-white' : 'bg-green-500 hover:bg-green-400 text-white'
            } disabled:opacity-50`}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Conditions'}
          </button>
        </div>
      )}

      {/* Security */}
      {activeSection === 'security' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="font-medium text-sm mb-1">Password</div>
            <div className="text-xs text-white/40 mb-4">We'll send a reset link to {user?.email}</div>
            {resetSent ? (
              <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                Reset link sent — check your email.
              </div>
            ) : (
              <button
                onClick={handleResetPassword}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-all"
              >
                Send Password Reset Email
              </button>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="font-medium text-sm mb-1">Account</div>
            <div className="text-xs text-white/40 mb-1">Signed in as</div>
            <div className="text-sm text-white/70">{user?.email}</div>
          </div>
        </div>
      )}

      {/* Data & Privacy */}
      {activeSection === 'data' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="font-medium text-sm mb-1">Your Data</div>
            <div className="text-xs text-white/40 leading-relaxed">
              All meal scans, corrections, and health data are stored securely. We never sell your data. You can delete everything at any time.
            </div>
          </div>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 rounded-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-sm font-medium transition-all"
            >
              Reset App Data
            </button>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-sm text-yellow-300 mb-1 font-medium">Reset app data?</p>
              <p className="text-xs text-yellow-300/70 mb-4">This clears your local scan history and health setup. You'll be asked to set up health conditions again on next login. Your account is not deleted.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetAppData}
                  className="flex-1 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-semibold transition-all"
                >
                  Yes, reset & sign out
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

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
            >
              Delete Account
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-red-300 mb-1 font-medium">Delete your account?</p>
              <p className="text-xs text-red-300/70 mb-4">This permanently deletes your profile, scan history, and all data. This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-all"
                >
                  Yes, delete everything
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
