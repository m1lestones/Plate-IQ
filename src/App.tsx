import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { LandingPage } from './pages/LandingPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ScanPage } from './pages/ScanPage'
import { DashboardPage } from './pages/DashboardPage'
import { JournalPage } from './pages/JournalPage'
import { getHealthProfile } from './lib/healthStorage'

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const profile = getHealthProfile()
  if (!profile?.setupComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding — no navbar */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Main app — with navbar */}
        <Route path="/*" element={
          <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <NavBar />
            <main className="flex-1 flex flex-col pt-20 md:pt-24 pb-20 md:pb-10 px-6">
              <Routes>
                <Route path="/" element={<RequireOnboarding><LandingPage /></RequireOnboarding>} />
                <Route path="/scan" element={<RequireOnboarding><ScanPage /></RequireOnboarding>} />
                <Route path="/dashboard" element={<RequireOnboarding><DashboardPage /></RequireOnboarding>} />
                <Route path="/journal" element={<RequireOnboarding><JournalPage /></RequireOnboarding>} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}
