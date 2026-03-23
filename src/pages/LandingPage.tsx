import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLastScan } from '../lib/healthStorage'
import { MiniDashboardPreview } from '../components/MiniDashboardPreview'

export function LandingPage() {
  const { t } = useTranslation()
  const lastScan = getLastScan()

  return (
    <div className="flex flex-col -mt-6">
      {/* Hero Section */}
      <section style={{ backgroundColor: '#2B3541' }} className="text-white min-h-[500px] flex flex-col pt-10 pb-16 px-8 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-5xl mx-auto flex-grow gap-12 lg:gap-8">
          <div className="w-full lg:w-1/2 flex flex-col items-start text-center lg:text-left gap-8">
            <h1 style={{ fontFamily: 'Merriweather, serif' }} className="text-5xl lg:text-[64px] font-bold leading-[1.1]">
              Nutrition<br />transparency in<br />every bite.
            </h1>
            <div className="flex flex-col items-center lg:items-start gap-3 w-full sm:w-auto">
              <Link
                to="/scan"
                style={{ backgroundColor: '#52B76C' }}
                className="hover:opacity-90 active:scale-95 text-white font-medium py-3 px-8 rounded-full transition-all text-lg w-full sm:w-auto text-center"
              >
                {t('landing.scanNow')}
              </Link>
              {lastScan && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-100 active:scale-95 text-slate-600 font-medium rounded-full transition-all text-sm w-full sm:w-auto justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Last Scan
                </Link>
              )}
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end pr-4">
            <img
              src="/filet_mignon.png"
              alt="Healthy plated food"
              className="w-full max-w-[340px] lg:max-w-[440px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-8 lg:px-24">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#52B76C' }}>The Process</span>
          <h2 style={{ fontFamily: 'Merriweather, serif' }} className="text-3xl font-bold text-slate-800 mt-2">{t('landing.howItWorks')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: t('landing.step1Title'),
              desc: t('landing.step1Description'),
              img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC62bfGBTvAh6REuZIpUNEfVkUxQbAcLs_fTgU1JXusfHOLGAzEKBQ3rhDQmlWCpCMR76O09SreJ4PcqV2KR1ASWW2c6oXZYrocwcsJ9ksThbWx-Do-KLkN75GLi00Qqwo2SM-J5bdmTWvheuwhcgYrJDTflhPGFsC9GZe1SfYQcwuCPoF2IYawRGMBu1BRypU9aMqMhtMPtQMAkq_V8FZvZ0_0GHR5cenNaKHNNP9N0ey4c8eQVNxeJGUnDMuJCjqQlK4-5doTr_oX',
            },
            {
              icon: (
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: t('landing.step2Title'),
              desc: t('landing.step2Description'),
              img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ8nCuVHoBUMyzmDVBXL5XgcqYZJ_Whc9ALl7gnewNh_S9Sk8vMRjuaZs2FCZNzEMmVCu1YTBM_IBoGGpBSNfFJ1bRkZ7guNCbSkdoamho825tchNinwRaScBfkechhbw_Rt7P6YKz4KaY_NDfPYzO63TEJvIhtb4dUbmx3ekRexCHnxryvjlEi0aed99aZlJMZx5cJOxKxOc4ew9rqWwZKKPu7UAsiZ36Ksh-GGT7_DIwPATdRn2l4ficvpl3R1ca6pIZsv5ZD8Ev',
            },
            {
              icon: (
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              ),
              title: t('landing.step3Title'),
              desc: t('landing.step3Description'),
              img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVgDceZJqWgDWOJJl8-JuRBDg8C4zh-wM6CHl9zi0kM403IRzKNQp7NKw9PIk3OxLpZiN_b5BZInTtg7MYTpQHdct_c0GNMV1R5nnAi_GCVXx5uBN1eD16OYJOjIFw9ss5tRz51h2Y9GAqqnLLFiK0NxzsnhR1NQgsKMmJhUGcKBMz_U865yeXnQ9t3LSbQOLWSVy0akTV3FiCkmc4r2yi8FPw3gmEKsaLE4mfSNpnjSkeINzvBpZXxffLNHhPyKvVEk6RHl-P3aa4',
            },
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                <div style={{ backgroundColor: '#52B76C' }} className="w-10 h-10 rounded-full flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
              <div className="w-full sm:w-1/2 flex-shrink-0 relative">
                {i === 2 ? <MiniDashboardPreview /> : <img src={i === 1 ? '/eggs_meal.png' : step.img} alt={step.title} className="w-full h-auto rounded-lg object-cover shadow-sm" />}
                {i === 1 && (
                  <div className="absolute inset-0 rounded-lg" style={{ background: 'rgba(82,183,108,0.08)' }}>
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl" style={{ borderColor: '#52B76C' }} />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr" style={{ borderColor: '#52B76C' }} />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl" style={{ borderColor: '#52B76C' }} />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br" style={{ borderColor: '#52B76C' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200">
        <p>{t('landing.footer', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  )
}
