import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLastScan } from '../lib/healthStorage'

export function LandingPage() {
  const { t } = useTranslation()
  const lastScan = getLastScan()
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="flex items-center justify-center py-12 md:py-20">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl">
              <svg className="w-12 h-12 md:w-14 md:h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-800">
            Plate<span className="text-green-500">IQ</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-3xl text-slate-600 font-light max-w-2xl mx-auto">
            {t('landing.tagline')}
          </p>

          {/* Value Prop */}
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto">
            {t('landing.description')}
          </p>

          {/* CTA Button */}
          <div className="pt-8 flex flex-col items-center gap-3">
            <Link
              to="/scan"
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-green-500/30 transition-all active:scale-95 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('landing.scanNow')}
            </Link>
            {lastScan && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 font-medium rounded-2xl transition-all active:scale-95 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Last Scan
              </Link>
            )}
          </div>

          {/* How It Works */}
          <div className="pt-16">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-8">
              {t('landing.howItWorks')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[1, 2, 3].map(step => (
                <div key={step} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-green-600">{step}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800">{t(`landing.step${step}Title`)}</h3>
                  <p className="text-sm text-slate-500">
                    {t(`landing.step${step}Description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200">
        <p>{t('landing.footer', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  )
}
