/**
 * Image Upload Service
 * Uploads meal images to Supabase Storage
 */

const BACKEND_API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/upload-image`
  : 'http://localhost:3001/api/upload-image'

export interface UploadImageResult {
  success: boolean
  imageUrl: string
  imagePath: string
}

/**
 * Upload meal image to Supabase Storage
 * @param imageDataUrl - Base64 data URL of meal photo
 * @param sessionId - User session identifier
 * @returns Image URL and path in storage
 */
export async function uploadMealImage(
  imageDataUrl: string,
  sessionId: string
): Promise<UploadImageResult> {
  const base64Data = imageDataUrl.split(',')[1] || imageDataUrl
  const mediaType = imageDataUrl.match(/data:(image\/[^;]+)/)?.[1] || 'image/jpeg'

  console.log('📤 Uploading meal image to Supabase Storage...')

  try {
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageData: base64Data,
        mediaType,
        sessionId
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Upload error:', errorData)
      throw new Error(`Upload failed: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Image uploaded successfully:', result.imageUrl)

    return result
  } catch (error) {
    console.error('❌ Image upload failed:', error)
    throw error
  }
}

/**
 * Get or create a persistent session ID for this user
 * Stored in localStorage to track user's scans across sessions
 */
export function getSessionId(): string {
  const STORAGE_KEY = 'plateiq_session_id'

  let sessionId = localStorage.getItem(STORAGE_KEY)

  if (!sessionId) {
    // Generate new session ID: timestamp + random string
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem(STORAGE_KEY, sessionId)
    console.log('✨ Created new session ID:', sessionId)
  }

  return sessionId
}
