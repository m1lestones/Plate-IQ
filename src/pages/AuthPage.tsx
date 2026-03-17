import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type AuthTab = 'login' | 'signup' | 'forgot'

export function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<AuthTab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup fields
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(loginEmail, loginPassword)
    setLoading(false)
    if (error) { setError(error); return }
    navigate('/')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match')
      return
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await signUp(signupEmail, signupPassword, signupName)
    setLoading(false)
    if (error) { setError(error); return }
    navigate('/onboarding')
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await resetPassword(forgotEmail)
    setLoading(false)
    if (error) { setError(error); return }
    setSuccess('Check your email for a password reset link.')
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">PlateIQ</h1>
          <p className="text-white/50 text-sm mt-1">AI-powered meal analysis</p>
        </div>

        {/* Tabs (login / signup only) */}
        {tab !== 'forgot' && (
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setTab('login'); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'login' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setTab('signup'); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'signup' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email" required placeholder="Email"
              value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/60"
            />
            <input
              type="password" required placeholder="Password"
              value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/60"
            />
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-semibold transition-all"
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>
            <button
              type="button" onClick={() => { setTab('forgot'); setError(null) }}
              className="text-sm text-white/40 hover:text-white/70 transition-colors text-center"
            >
              Forgot password?
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <input
              type="text" required placeholder="Full name"
              value={signupName} onChange={e => setSignupName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/60"
            />
            <input
              type="email" required placeholder="Email"
              value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/60"
            />
            <input
              type="password" required placeholder="Password (min 6 characters)"
              value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/60"
            />
            <input
              type="password" required placeholder="Confirm password"
              value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/60"
            />
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-semibold transition-all"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgot} className="flex flex-col gap-3">
            <div className="text-center mb-2">
              <h2 className="font-semibold">Reset Password</h2>
              <p className="text-white/50 text-sm mt-1">Enter your email and we'll send a reset link.</p>
            </div>
            <input
              type="email" required placeholder="Email"
              value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-green-500/60"
            />
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-semibold transition-all"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <button
              type="button" onClick={() => { setTab('login'); setError(null); setSuccess(null) }}
              className="text-sm text-white/40 hover:text-white/70 transition-colors text-center"
            >
              Back to Log In
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
