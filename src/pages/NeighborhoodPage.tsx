import { useTranslation } from 'react-i18next'

export function NeighborhoodPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('neighborhood.title')}</h1>
        <p className="text-white/50 text-sm mt-1">
          {t('neighborhood.subtitle')}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white/80">{t('neighborhood.comingSoon')}</h2>
          <p className="text-white/50 text-sm">
            {t('neighborhood.description')}
            <br />
            {t('neighborhood.descriptionLine2')}
          </p>
          <div className="pt-4">
            <span className="inline-block px-4 py-2 rounded-lg bg-white/5 text-white/40 text-xs font-medium">
              {t('neighborhood.stretchGoal')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
