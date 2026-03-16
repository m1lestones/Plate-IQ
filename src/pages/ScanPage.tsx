import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Scanner } from '../components/Scanner'
import { Preview } from '../components/Preview'
import { LoadingState } from '../components/LoadingState'
import { getRandomDemoMeal } from '../data/demoMeals'
import { analyzeMealWithClaude } from '../services/claudeVision'
import { uploadMealImage, getSessionId } from '../services/imageUpload'
import { enhanceMealWithUSDA, isUSDAConfigured } from '../utils/usdaEnhancer'
import { refineMealPortions, logDensityInfo } from '../utils/portionRefinement'
import { applyConfidenceFiltering } from '../utils/confidenceFiltering'
import { validateMeal } from '../utils/smartValidation'
import type { AngleCapture, CaptureAngle } from '../utils/multiAngleAnalysis'
import { evaluateMeal } from '../lib/thresholdEngine'
import { getHealthProfile, saveMealToJournal, saveLastScan } from '../lib/healthStorage'
import type { CapturedImage, ScanStep, MealData } from '../types'

export function ScanPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState<ScanStep>('capture')
  const [image, setImage] = useState<CapturedImage | null>(null)
  const [multiAngleMode] = useState(false) // setMultiAngleMode unused - multi-angle UI not fully implemented
  const [angleCaptures, setAngleCaptures] = useState<AngleCapture[]>([])
  const [currentAngle, setCurrentAngle] = useState<CaptureAngle>('top_down')

  const handleCapture = (img: CapturedImage) => {
    if (multiAngleMode) {
      // Multi-angle mode: collect multiple photos
      const newCapture: AngleCapture = {
        angle: currentAngle,
        imageData: img.dataUrl
      }

      const updatedCaptures = [...angleCaptures, newCapture]
      setAngleCaptures(updatedCaptures)

      // Move to next angle or preview
      if (currentAngle === 'top_down') {
        setCurrentAngle('angle_45')
        setImage(null) // Reset for next capture
        // Stay on capture screen for next photo
      } else {
        // Done capturing, go to preview
        setImage(img)
        setStep('preview')
      }
    } else {
      // Single photo mode (original behavior)
      setImage(img)
      setStep('preview')
    }
  }

  const handleConfirm = async () => {
    if (!image) return
    setStep('loading')

    let mealData: MealData

    try {
      const useDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
      const hasClaudeKey = import.meta.env.VITE_CLAUDE_API_KEY?.trim()

      // Get session ID for tracking user's scans
      const sessionId = getSessionId()

      let imageUrl: string | undefined
      let imagePath: string | undefined

      // Upload image to Supabase Storage (even in demo mode for data collection)
      try {
        const uploadResult = await uploadMealImage(image.dataUrl, sessionId)
        imageUrl = uploadResult.imageUrl
        imagePath = uploadResult.imagePath
        console.log('✅ Image uploaded:', imageUrl)
      } catch (uploadError) {
        console.error('⚠️ Image upload failed, continuing with analysis...', uploadError)
        // Continue even if upload fails - don't block the user
      }

      if (!useDemoMode && hasClaudeKey) {
        mealData = await analyzeMealWithClaude(image.dataUrl, sessionId, imageUrl, imagePath)
      } else {
        mealData = getRandomDemoMeal()
      }

      // Apply NYU density-based portion refinement
      mealData.foods = refineMealPortions(mealData.foods)
      logDensityInfo(mealData.foods)

      // Apply NYU confidence filtering (removes <50% confidence)
      mealData = applyConfidenceFiltering(mealData)

      // Run smart validation checks
      const validationWarnings = validateMeal(mealData)
      mealData = { ...mealData, validation_warnings: validationWarnings }

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
      saveLastScan(mealData)

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
            <h1 className="text-2xl font-bold">{t('scan.title')}</h1>
            <p className="text-white/50 text-sm mt-1">{t('scan.prompt')}</p>
          </div>
          <Scanner onCapture={handleCapture} />
        </>
      )}

      {step === 'preview' && image && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{t('scan.previewTitle')}</h1>
            <p className="text-white/50 text-sm mt-1">{t('scan.previewPrompt')}</p>
          </div>
          <Preview image={image} onConfirm={handleConfirm} onRetake={handleRetake} />
        </>
      )}

      {step === 'loading' && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{t('scan.analyzingTitle')}</h1>
            <p className="text-white/50 text-sm mt-1">{t('scan.analyzingPrompt')}</p>
          </div>
          <LoadingState />
        </>
      )}
    </div>
  )
}
