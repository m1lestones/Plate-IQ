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
              text: `Analyze this meal photo and identify ALL visible foods.

For each food item, provide:
- Exact name of the food
- Estimated portion size in grams
- NOVA processing level (1=unprocessed, 2=processed ingredients, 3=processed, 4=ultra-processed)
- Food category (protein, carb, vegetable, fruit, dairy, fat, other)

Return ONLY valid JSON (no markdown):
{
  "foods": [{"name": "Food Name", "estimated_grams": 150, "nova_level": 1, "category": "protein"}],
  "meal_type": "breakfast|lunch|dinner|snack",
  "primary_cuisine": "American|Italian|etc"
}`
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
