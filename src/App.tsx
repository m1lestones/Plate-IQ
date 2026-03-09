import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { LandingPage } from './pages/LandingPage'
import { ScanPage } from './pages/ScanPage'
import { DashboardPage } from './pages/DashboardPage'
import { NeighborhoodPage } from './pages/NeighborhoodPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
        <NavBar />

        {/* Main Content - with padding for navbar */}
        <main className="flex-1 flex flex-col pt-20 md:pt-24 pb-20 md:pb-10 px-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/neighborhood" element={<NeighborhoodPage />} />
          </Routes>        </main>
      </div>
    </BrowserRouter>
  )
}
