import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20 md:py-32">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 md:w-14 md:h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Plate<span className="text-green-400">IQ</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-3xl text-white/70 font-light max-w-2xl mx-auto">
            Snap Your Plate. Know Your Food.
          </p>

          {/* Value Prop */}
          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto">
            AI-powered food wellness dashboard. Get instant nutrition breakdown,
            processing-level transparency, and personalized insights from a single photo.
          </p>

          {/* CTA Button */}
          <div className="pt-8">
            <Link
              to="/scan"
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-2xl shadow-xl hover:shadow-green-500/50 transition-all active:scale-95 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Scan Now
            </Link>
          </div>

          {/* How It Works - Optional P2 */}
          <div className="pt-16">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-8">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {/* Step 1 */}
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-400">1</span>
                </div>
                <h3 className="font-semibold text-white">Snap</h3>
                <p className="text-sm text-white/50">
                  Take a photo of your meal or upload from your camera roll
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-400">2</span>
                </div>
                <h3 className="font-semibold text-white">Analyze</h3>
                <p className="text-sm text-white/50">
                  AI identifies foods, estimates portions, and calculates nutrition
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-400">3</span>
                </div>
                <h3 className="font-semibold text-white">Understand</h3>
                <p className="text-sm text-white/50">
                  See processing levels, nutrient gaps, and personalized insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-white/30 text-sm border-t border-white/5">
        <p>PlateIQ &copy; {new Date().getFullYear()} — 8-Day Capstone Project</p>
      </footer>
    </div>
  )
}
