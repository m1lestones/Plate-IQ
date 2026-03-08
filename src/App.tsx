import { useState } from 'react'
import { Scanner } from './components/Scanner'
import { Preview } from './components/Preview'
import { LoadingState } from './components/LoadingState'
import type { CapturedImage, ScanStep } from './types'

export default function App() {
  const [step, setStep] = useState<ScanStep>('capture')
  const [image, setImage] = useState<CapturedImage | null>(null)

  const handleCapture = (img: CapturedImage) => {
    setImage(img)
    setStep('preview')
  }

  const handleConfirm = () => {
    setStep('loading')
    // Claude Vision API call will go here
    setTimeout(() => setStep('done'), 7000)
  }

  const handleRetake = () => {
    setImage(null)
    setStep('capture')
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white flex flex-col">
      {/* header */}
      <header className="px-6 py-5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight">PlateIQ</span>
      </header>

      {/* main */}
      <main className="flex-1 flex flex-col px-6 pb-10">
        {step === 'capture' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Scan your meal</h1>
              <p className="text-white/50 text-sm mt-1">Point your camera at your plate</p>
            </div>
            <Scanner onCapture={handleCapture} />
          </>
        )}

        {step === 'preview' && image && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Looks good?</h1>
              <p className="text-white/50 text-sm mt-1">Confirm to start analysis</p>
            </div>
            <Preview image={image} onConfirm={handleConfirm} onRetake={handleRetake} />
          </>
        )}

        {step === 'loading' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Analyzing...</h1>
              <p className="text-white/50 text-sm mt-1">This takes just a few seconds</p>
            </div>
            <LoadingState />
          </>
        )}

        {step === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white/60 text-sm">Dashboard coming next</p>
            <button
              onClick={handleRetake}
              className="mt-4 px-6 py-2.5 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-all text-sm"
            >
              Scan another meal
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
