import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '../components/Scanner'
import { Preview } from '../components/Preview'
import { LoadingState } from '../components/LoadingState'
import { getRandomDemoMeal } from '../data/demoMeals'
import { analyzeMealWithClaude } from '../services/claudeVision'
import { enhanceMealWithUSDA, isUSDAConfigured } from '../utils/usdaEnhancer'
import type { CapturedImage, ScanStep, MealData } from '../types'

export function ScanPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<ScanStep>('capture')
  const [image, setImage] = useState<CapturedImage | null>(null)
  const [mealData, setMealData] = useState<MealData | null>(null)

  const handleCapture = (img: CapturedImage) => {
    setImage(img)
    setStep('preview')
  }

  const handleConfirm = async () => {
    if (!image) return

    setStep('loading')

    let mealData: MealData

    try {
      // Check if we should use Claude Vision API or demo mode
      const useDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
      const hasClaudeKey = import.meta.env.VITE_CLAUDE_API_KEY?.trim()

      if (!useDemoMode && hasClaudeKey) {
        // REAL FOOD RECOGNITION with Claude Vision API
        console.log('🤖 Using Claude Vision API for real food recognition...')
        mealData = await analyzeMealWithClaude(image.dataUrl)
        console.log('✅ Claude Vision identified foods:', mealData.foods.map(f => f.name))
      } else {
        // Demo mode - use pre-cached meals
        console.log('📦 Demo mode - using pre-cached meal data')
        mealData = getRandomDemoMeal()
      }

      // Enhance with USDA nutrition data if configured
      if (isUSDAConfigured()) {
        console.log('🥗 Enhancing with USDA nutrition data...')
        mealData = await enhanceMealWithUSDA(mealData)
        console.log('✅ USDA enhancement complete')
      }

      // Navigate to dashboard
      navigate('/dashboard', {
        state: {
          mealData,
          image: image.dataUrl
        }
      })

    } catch (error) {
      console.error('❌ Analysis failed:', error)
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nFalling back to demo mode.`)

      // Fallback to demo mode
      const demoMeal = getRandomDemoMeal()
      navigate('/dashboard', {
        state: {
          mealData: demoMeal,
          image: image.dataUrl
        }
      })
    }
  }

  const handleRetake = () => {
    setImage(null)
    setMealData(null)
    setStep('capture')
  }

  return (
    <div className="flex flex-col h-full">
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
          <p className="text-white/40 text-xs">Meal analyzed successfully!</p>
          <button
            onClick={handleRetake}
            className="mt-4 px-6 py-2.5 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-all text-sm"
          >
            Scan another meal
          </button>
        </div>
      )}
    </div>
  )
}
