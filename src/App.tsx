import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NavBar } from './components/NavBar'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ScanPage } from './pages/ScanPage'
import { DashboardPage } from './pages/DashboardPage'
import { JournalPage } from './pages/JournalPage'
import { ProfilePage } from './pages/ProfilePage'
import { getHealthProfile } from './lib/healthStorage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#eef2f7]" />
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#eef2f7]" />
  if (!user) return <Navigate to="/auth" replace />
  const profile = getHealthProfile()
  if (!profile?.setupComplete) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
      <Route path="/*" element={
        <div className="min-h-screen bg-[#eef2f7] text-slate-800 flex flex-col overflow-x-hidden">
          <NavBar />
          <main className="flex-1 flex flex-col pt-20 md:pt-24 pb-20 md:pb-10 px-6 w-full min-w-0">
            <Routes>
              <Route path="/" element={<RequireOnboarding><LandingPage /></RequireOnboarding>} />
              <Route path="/scan" element={<RequireOnboarding><ScanPage /></RequireOnboarding>} />
              <Route path="/dashboard" element={<RequireOnboarding><DashboardPage /></RequireOnboarding>} />
              <Route path="/journal" element={<RequireOnboarding><JournalPage /></RequireOnboarding>} />
              <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            </Routes>
          </main>
        </div>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
