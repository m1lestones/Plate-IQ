import { useTranslation } from 'react-i18next'
import type { CapturedImage } from '../types'

interface PreviewProps {
  image: CapturedImage
  onConfirm: () => void
  onRetake: () => void
}

export function Preview({ image, onConfirm, onRetake }: PreviewProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
        <img
          src={image.dataUrl}
          alt="Meal preview"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex gap-3 w-full max-w-md">
        <button
          onClick={onRetake}
          className="flex-1 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 active:scale-95 text-slate-600 font-medium transition-all"
        >
          {t('scan.retake')}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 text-white font-semibold transition-all shadow-lg"
        >
          {t('scan.analyzeMeal')}
        </button>
      </div>
    </div>
  )
}
