import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '../components/Scanner'
import { Preview } from '../components/Preview'
import { LoadingState } from '../components/LoadingState'
import { getRandomDemoMeal } from '../data/demoMeals'
import { analyzeMealWithClaude } from '../services/claudeVision'
import { enhanceMealWithUSDA, isUSDAConfigured } from '../utils/usdaEnhancer'
import { refineMealPortions, logDensityInfo } from '../utils/portionRefinement'
import { evaluateMeal } from '../lib/thresholdEngine'
import { getHealthProfile, saveMealToJournal } from '../lib/healthStorage'
import type { CapturedImage, ScanStep, MealData } from '../types'

export function ScanPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<ScanStep>('capture')
  const [image, setImage] = useState<CapturedImage | null>(null)

  const handleCapture = (img: CapturedImage) => {
    setImage(img)
    setStep('preview')
  }

  const handleConfirm = async () => {
    if (!image) return
    setStep('loading')

    let mealData: MealData

    try {
      const useDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
      const hasClaudeKey = import.meta.env.VITE_CLAUDE_API_KEY?.trim()

      if (!useDemoMode && hasClaudeKey) {
        mealData = await analyzeMealWithClaude(image.dataUrl)
      } else {
        mealData = getRandomDemoMeal()
      }

      // Apply NYU density-based portion refinement
      mealData.foods = refineMealPortions(mealData.foods)
      logDensityInfo(mealData.foods)

      if (isUSDAConfigured()) {
        mealData = await enhanceMealWithUSDA(mealData)
      }

      // Run condition threshold engine
      const profile = getHealthProfile()
      if (profile && profile.conditions.length > 0) {
        const { overall, byCondition } = evaluateMeal(mealData, profile.conditions)
        mealData = { ...mealData, verdict: { overall, byCondition, aiInsight: '' } }
      }

      saveMealToJournal(mealData)

      navigate('/dashboard', { state: { mealData, image: image.dataUrl } })

    } catch (error) {
      console.error('Analysis failed:', error)
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nFalling back to demo mode.`)
      const demoMeal = getRandomDemoMeal()
      saveMealToJournal(demoMeal)
      navigate('/dashboard', { state: { mealData: demoMeal, image: image.dataUrl } })
    }
  }

  const handleRetake = () => {
    setImage(null)
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
    </div>
  )
}
