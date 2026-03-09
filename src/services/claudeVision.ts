import type { MealAnalysis, ClaudeVisionError } from '../types'
import { stripDataUrlPrefix, getMediaTypeFromDataUrl } from '../utils/imageUtils'
import { getRandomDemoMeal } from './demoData'

const BACKEND_API_URL = 'http://localhost:3001/api/analyze'
const API_TIMEOUT_MS = 10000 // 10 seconds

/**
 * Checks if demo mode is enabled
 * Returns true if:
 * - VITE_DEMO_MODE is explicitly set to 'true'
 * - VITE_CLAUDE_API_KEY is missing or empty
 */
function isDemoMode(): boolean {
  const demoMode = import.meta.env.VITE_DEMO_MODE
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  return demoMode === 'true' || !apiKey || apiKey.trim() === ''
}

/**
 * Demo mode meal analysis
 * Returns a random pre-cached meal after simulated delay
 */
export async function analyzeMealImageDemo(
  _imageDataUrl: string
): Promise<MealAnalysis> {
  // Simulate 2-second API delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 2000))
  return getRandomDemoMeal()
}

/**
 * Main API call via backend proxy
 * Analyzes a meal image and returns structured food data
 *
 * @param imageDataUrl - Base64 data URL of the meal image
 * @returns Promise<MealAnalysis> - Structured meal data
 * @throws Error on API, network, or validation failures
 */
async function analyzeMealImageAPI(
  imageDataUrl: string
): Promise<MealAnalysis> {
  // Extract base64 data and media type
  const base64Data = stripDataUrlPrefix(imageDataUrl)
  const mediaType = getMediaTypeFromDataUrl(imageDataUrl)

  // Set up abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageData: base64Data,
        mediaType: mediaType
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok) {
      // Backend returned an error
      throw new Error(data.error || `API error: ${response.status}`)
    }

    // Backend returns the analysis directly
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(
          `Request timeout after ${API_TIMEOUT_MS / 1000} seconds`
        )
      }
      throw error
    }

    throw new Error('Unknown error during API call')
  }
}

/**
 * Main entry point for meal image analysis
 * Automatically routes to demo mode or API based on configuration
 * Falls back to demo mode on API errors
 *
 * @param imageDataUrl - Base64 data URL of the meal image
 * @returns Promise<MealAnalysis> - Structured meal data
 */
export async function analyzeMealImage(
  imageDataUrl: string
): Promise<MealAnalysis> {
  // Use demo mode if configured or no API key
  if (isDemoMode()) {
    return analyzeMealImageDemo(imageDataUrl)
  }

  // Try API, fall back to demo on error
  try {
    return await analyzeMealImageAPI(imageDataUrl)
  } catch (error) {
    console.warn('API call failed, falling back to demo mode:', error)
    return analyzeMealImageDemo(imageDataUrl)
  }
}
