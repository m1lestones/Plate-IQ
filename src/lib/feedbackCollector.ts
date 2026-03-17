/**
 * Anonymous Feedback Collection System
 * Collects user corrections to improve the AI over time
 * Privacy-first: No personal data, only corrections
 */

import type { FoodItem, MealData } from '../types'

const FEEDBACK_ENDPOINT = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/feedback`
  : 'http://localhost:3001/api/feedback'

interface FoodCorrection {
  original: {
    name: string
    grams: number
    nova_level: number
    category: string
  }
  corrected: {
    name: string
    grams: number
    nova_level: number
    category: string
  }
  confidence: number // AI's original confidence
  timestamp: number
}

interface PositionCorrection {
  foodName: string
  originalPosition: { x: number; y: number }
  correctedPosition: { x: number; y: number }
  timestamp: number
}

interface ValidationFeedback {
  type: 'missing_food' | 'wrong_food' | 'portion_off' | 'nova_wrong'
  details: string
  timestamp: number
}

/**
 * Report when user edits a food item
 * This helps improve AI food recognition
 */
export async function reportFoodCorrection(
  original: FoodItem,
  corrected: FoodItem,
  sendToServer = true
): Promise<void> {
  const correction: FoodCorrection = {
    original: {
      name: original.name,
      grams: original.estimated_grams,
      nova_level: original.nova_level,
      category: original.category
    },
    corrected: {
      name: corrected.name,
      grams: corrected.estimated_grams,
      nova_level: corrected.nova_level,
      category: corrected.category
    },
    confidence: original.confidence || 0,
    timestamp: Date.now()
  }

  // Store locally for analytics
  const localCorrections = getLocalCorrections()
  localCorrections.foodEdits.push(correction)
  localStorage.setItem('plateiq_feedback', JSON.stringify(localCorrections))

  // Send to server for collective learning
  if (sendToServer && navigator.onLine) {
    try {
      await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'food_correction',
          data: correction,
          version: '1.0'
        })
      })
      console.log('✅ Feedback sent: Food correction')
    } catch (err) {
      console.log('⚠️  Feedback queued for later (offline)')
      queueForLater(correction)
    }
  }
}

/**
 * Report when user drags a food label to correct position
 */
export async function reportPositionCorrection(
  foodName: string,
  originalPos: { x: number; y: number },
  correctedPos: { x: number; y: number }
): Promise<void> {
  const correction: PositionCorrection = {
    foodName,
    originalPosition: originalPos,
    correctedPosition: correctedPos,
    timestamp: Date.now()
  }

  const localCorrections = getLocalCorrections()
  localCorrections.positionEdits.push(correction)
  localStorage.setItem('plateiq_feedback', JSON.stringify(localCorrections))

  if (navigator.onLine) {
    try {
      await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'position_correction',
          data: correction,
          version: '1.0'
        })
      })
    } catch {
      queueForLater(correction)
    }
  }
}

/**
 * Report validation issues (missing food, wrong identification, etc.)
 */
export async function reportValidationIssue(
  type: ValidationFeedback['type'],
  details: string
): Promise<void> {
  const feedback: ValidationFeedback = {
    type,
    details,
    timestamp: Date.now()
  }

  const localCorrections = getLocalCorrections()
  localCorrections.validationIssues.push(feedback)
  localStorage.setItem('plateiq_feedback', JSON.stringify(localCorrections))

  if (navigator.onLine) {
    await fetch(FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'validation_feedback',
        data: feedback,
        version: '1.0'
      })
    })
  }
}

/**
 * Track food pairing patterns (e.g., rice + beans often together)
 */
export function learnFoodPairings(meal: MealData): void {
  const foods = meal.foods.map(f => f.name.toLowerCase()).sort()

  if (foods.length < 2) return

  const pairings = getPairingsData()
  const key = foods.join('|')
  pairings[key] = (pairings[key] || 0) + 1

  localStorage.setItem('plateiq_pairings', JSON.stringify(pairings))
}

/**
 * Get common food suggestions based on what's already on plate
 */
export function suggestCommonPairings(existingFoods: string[]): string[] {
  const pairings = getPairingsData()
  const existing = existingFoods.map(f => f.toLowerCase()).sort()

  // Find meals that contain these foods
  const suggestions = new Set<string>()

  Object.keys(pairings).forEach(key => {
    const foods = key.split('|')
    const hasAll = existing.every(e => foods.includes(e))

    if (hasAll) {
      foods.forEach(f => {
        if (!existing.includes(f)) {
          suggestions.add(f)
        }
      })
    }
  })

  return Array.from(suggestions).slice(0, 5)
}

/**
 * Aggregate statistics for analytics
 */
export function getFeedbackStats() {
  const corrections = getLocalCorrections()

  return {
    totalFoodEdits: corrections.foodEdits.length,
    totalPositionEdits: corrections.positionEdits.length,
    totalValidationIssues: corrections.validationIssues.length,
    mostCorrectedFoods: getMostCorrectedFoods(corrections),
    averageConfidence: getAverageConfidence(corrections),
    commonIssues: getCommonIssues(corrections)
  }
}

// Helper functions
function getLocalCorrections() {
  const raw = localStorage.getItem('plateiq_feedback')
  return raw ? JSON.parse(raw) : { foodEdits: [], positionEdits: [], validationIssues: [] }
}

function getPairingsData(): Record<string, number> {
  const raw = localStorage.getItem('plateiq_pairings')
  return raw ? JSON.parse(raw) : {}
}

function queueForLater(data: any) {
  const queue = JSON.parse(localStorage.getItem('plateiq_feedback_queue') || '[]')
  queue.push(data)
  localStorage.setItem('plateiq_feedback_queue', JSON.stringify(queue))
}

function getMostCorrectedFoods(corrections: any) {
  const counts: Record<string, number> = {}
  corrections.foodEdits.forEach((edit: FoodCorrection) => {
    counts[edit.original.name] = (counts[edit.original.name] || 0) + 1
  })
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))
}

function getAverageConfidence(corrections: any) {
  if (corrections.foodEdits.length === 0) return 0
  const sum = corrections.foodEdits.reduce((acc: number, edit: FoodCorrection) =>
    acc + edit.confidence, 0)
  return sum / corrections.foodEdits.length
}

function getCommonIssues(corrections: any) {
  const issues: Record<string, number> = {}
  corrections.validationIssues.forEach((issue: ValidationFeedback) => {
    issues[issue.type] = (issues[issue.type] || 0) + 1
  })
  return issues
}
