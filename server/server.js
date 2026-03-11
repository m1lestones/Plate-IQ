import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', claudeKey: !!process.env.VITE_CLAUDE_API_KEY })
})

app.post('/api/analyze', async (req, res) => {
  try {
    const { imageData, mediaType } = req.body
    console.log('Received mediaType:', mediaType, '| imageData length:', imageData?.length)
    const validMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const safeMediaType = validMediaTypes.includes(mediaType) ? mediaType : 'image/jpeg'
    const apiKey = process.env.VITE_CLAUDE_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'Claude API key not configured' })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: safeMediaType, data: imageData }
            },
            {
              type: 'text',
              text: `You are an expert food identification system trained on NYU Tandon research. Analyze this meal image and identify ALL visible foods with accurate portion estimates.

🔍 CRITICAL: First check for REFERENCE OBJECTS for scale measurement:
- Credit card (85.6mm × 53.98mm)
- Fork/Spoon (~200mm length)
- Knife (~220mm length)
- Dinner plate (~250-280mm diameter)
- Coin (quarter: 24.26mm)
- Phone (~150mm height)

If found, use these known sizes to calculate accurate portion sizes!

Return ONLY valid JSON (no markdown):
{
  "foods": [
    {
      "name": "Specific food name (e.g. 'Brown Rice' not 'Rice')",
      "estimated_grams": weight_in_grams,
      "nova_level": 1_to_4_processing_level,
      "category": "protein|carb|vegetable|fruit|dairy|fat|other"
    }
  ],
  "reference_object_detected": "credit_card|fork|spoon|plate|coin|phone|none",
  "meal_type": "breakfast|lunch|dinner|snack",
  "primary_cuisine": "American|Italian|Mexican|etc"
}

PORTION ESTIMATION GUIDELINES:
- WITH reference object: Measure food area relative to known object size, apply food density
- WITHOUT reference object: Use visual cues (plate coverage, typical serving sizes)
- Food densities: rice/grains ~0.8g/cm³, meat ~1.0g/cm³, vegetables ~0.6g/cm³

IDENTIFICATION TIPS:
- Be SPECIFIC: "Jasmine Rice" not "Rice", "Grilled Chicken Breast" not "Chicken"
- Don't miss small items: sauces, garnishes, condiments, herbs
- Distinguish similar foods: quinoa (ring-shaped) vs couscous (tiny round), brown rice vs white rice (color)
- Look for partially hidden foods behind/under other items

NOVA LEVELS:
1 = Unprocessed (fresh vegetables, plain meat, eggs, rice)
2 = Processed ingredients (oils, butter, sugar, salt)
3 = Processed foods (canned vegetables, cheese, bread)
4 = Ultra-processed (packaged snacks, fast food, processed meats)`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Claude API error:', errorData)
      return res.status(response.status).json({ error: 'Claude API error', details: errorData })
    }

    const data = await response.json()
    const textContent = data.content?.find(c => c.type === 'text')?.text
    const jsonText = textContent?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(jsonText)

    res.json(parsed)
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`\n🚀 PlateIQ Backend running on http://localhost:${PORT}`)
  console.log(`🔑 Claude API Key: ${process.env.VITE_CLAUDE_API_KEY ? 'Configured ✅' : 'Missing ❌'}\n`)
})
