import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' })) // Increase limit for base64 images

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PlateIQ API Server' })
})

// Claude Vision API proxy endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { imageData, mediaType } = req.body

    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' })
    }

    const apiKey = process.env.VITE_CLAUDE_API_KEY

    if (!apiKey || apiKey.trim() === '') {
      return res.status(500).json({
        error: 'API key not configured',
        useDemoMode: true
      })
    }

    // Construct Claude API request
    const requestBody = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/jpeg',
                data: imageData
              }
            },
            {
              type: 'text',
              text: `Analyze this meal image and identify all visible foods with portion estimates.

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "foods": [
    {
      "name": "Food name",
      "portion_grams": estimated_weight_in_grams,
      "estimated_calories": calories_for_this_portion,
      "confidence": 0.0_to_1.0_confidence_score
    }
  ]
}

Guidelines:
- Identify all distinct food items visible in the image
- Estimate portion sizes in grams based on visual cues
- Calculate calories based on typical nutritional values
- Include confidence score (0.0-1.0) for each identification
- If you cannot identify any food, return an empty foods array
- Return pure JSON only, no additional text or formatting`
            }
          ]
        }
      ]
    }

    console.log('Making request to Claude API...')

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Claude API error:', errorData)
      return res.status(response.status).json({
        error: errorData.error?.message || `API error: ${response.status}`,
        useDemoMode: true
      })
    }

    const data = await response.json()
    console.log('Claude API response received')

    // Extract text content from Claude's response
    const textContent = data.content?.find(c => c.type === 'text')?.text

    if (!textContent) {
      return res.status(500).json({
        error: 'No text content in API response',
        useDemoMode: true
      })
    }

    // Parse JSON from the text content
    const jsonText = textContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(jsonText)

    // Validate response structure
    if (!parsed.foods || !Array.isArray(parsed.foods)) {
      return res.status(500).json({
        error: 'Invalid response structure',
        useDemoMode: true
      })
    }

    // Calculate total calories
    const total_calories = parsed.foods.reduce(
      (sum, food) => sum + (food.estimated_calories || 0),
      0
    )

    const analysis = {
      foods: parsed.foods,
      total_calories,
      timestamp: new Date().toISOString()
    }

    res.json(analysis)
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({
      error: error.message || 'Internal server error',
      useDemoMode: true
    })
  }
})

app.listen(PORT, () => {
  console.log(`\n🚀 PlateIQ API Server running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`🔑 API Key configured: ${process.env.VITE_CLAUDE_API_KEY ? 'Yes ✅' : 'No ❌'}\n`)
})
