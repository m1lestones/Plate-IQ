import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { getAggregatedPositions, getCommonFoodCorrections, getPortionAdjustments } from './communityLearning.js'
import { verifyMealNovaLevels } from './novaVerification.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (req, res) => {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY
  res.json({ status: 'ok', claudeKey: !!apiKey })
})

// Collective Learning Endpoint - Receives feedback from ALL users
app.post('/api/feedback', async (req, res) => {
  try {
    const { type, data, version } = req.body

    // Log feedback for analysis
    console.log(`📊 Feedback received: ${type}`)

    // Store in JSON file (for now - can move to database later)
    const fs = await import('fs/promises')
    const path = await import('path')

    const feedbackDir = path.join(__dirname, 'feedback')
    await fs.mkdir(feedbackDir, { recursive: true })

    const filename = `${type}_${Date.now()}.json`
    const filepath = path.join(feedbackDir, filename)

    await fs.writeFile(filepath, JSON.stringify({
      type,
      data,
      version,
      timestamp: new Date().toISOString()
    }, null, 2))

    console.log(`✅ Saved: ${filename}`)

    res.json({ success: true, message: 'Feedback received' })
  } catch (error) {
    console.error('❌ Feedback error:', error)
    res.status(500).json({ error: 'Failed to save feedback' })
  }
})

// Community Learning Endpoints - Powers collective intelligence

// Get community-learned positions (ALL users' corrections)
app.get('/api/community/positions', async (req, res) => {
  try {
    const positions = await getAggregatedPositions()
    res.json(positions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get community positions' })
  }
})

// Get common food identification corrections
app.get('/api/community/food-corrections', async (req, res) => {
  try {
    const corrections = await getCommonFoodCorrections()
    res.json(corrections)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get food corrections' })
  }
})

// Get portion adjustment patterns
app.get('/api/community/portion-adjustments', async (req, res) => {
  try {
    const adjustments = await getPortionAdjustments()
    res.json(adjustments)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get portion adjustments' })
  }
})

// Analytics endpoint - Get aggregated learning data
app.get('/api/analytics', async (req, res) => {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')

    const feedbackDir = path.join(__dirname, 'feedback')

    try {
      const files = await fs.readdir(feedbackDir)
      const feedbackData = []

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(feedbackDir, file), 'utf-8')
          feedbackData.push(JSON.parse(content))
        }
      }

      // Aggregate statistics
      const stats = {
        totalFeedback: feedbackData.length,
        byType: {},
        mostCorrectedFoods: {},
        averageConfidence: 0
      }

      feedbackData.forEach(item => {
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1

        if (item.type === 'food_correction') {
          const foodName = item.data.original.name
          stats.mostCorrectedFoods[foodName] = (stats.mostCorrectedFoods[foodName] || 0) + 1
        }
      })

      res.json(stats)
    } catch (err) {
      res.json({ totalFeedback: 0, message: 'No feedback data yet' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Analytics error' })
  }
})

app.post('/api/analyze', async (req, res) => {
  try {
    const { imageData, mediaType } = req.body
    console.log('Received mediaType:', mediaType, '| imageData length:', imageData?.length)
    const validMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const safeMediaType = validMediaTypes.includes(mediaType) ? mediaType : 'image/jpeg'
    // Check for API key in both production (CLAUDE_API_KEY) and dev (VITE_CLAUDE_API_KEY)
    const apiKey = process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'Claude API key not configured' })
    }

    // Add timeout controller (60 seconds for vision API)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    console.log('🔍 Sending request to Claude Vision API...')
    const startTime = Date.now()

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

RESEARCH-BACKED FOOD DENSITIES (g/cm³):
Grains: white rice 0.85, brown rice 0.80, pasta 0.90, quinoa 0.75, bread 0.25
Proteins: chicken 1.05, beef 1.10, fish 1.00, tofu 0.95, eggs 1.03
Vegetables (cooked): broccoli 0.60, carrots 0.70, spinach 0.55, peas 0.80, corn 0.75
Vegetables (raw): salad 0.30, cucumber 0.40
Fruits: apple 0.65, banana 0.60, berries 0.55, avocado 0.70
Fats: nuts 0.65, cheese 1.15, butter 0.91
Sauces: tomato sauce 1.00, hummus 1.05, soup 1.00

VOLUMETRIC CALCULATION:
1. Measure food area in pixels relative to reference object
2. Convert to cm² using reference object's known size
3. Multiply by assumed height (~1.5cm for flat foods, ~3cm for piled foods)
4. Multiply by food-specific density
5. Result = estimated grams

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
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ Claude API responded in ${duration}s`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Claude API error:', errorData)
      return res.status(response.status).json({ error: 'Claude API error', details: errorData })
    }

    const data = await response.json()
    const textContent = data.content?.find(c => c.type === 'text')?.text
    const jsonText = textContent?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(jsonText)

    console.log(`🍽️  Identified ${parsed.foods?.length || 0} foods`)

    // Verify NOVA levels with Open Food Facts database
    if (parsed.foods && parsed.foods.length > 0) {
      console.log('🔍 Verifying NOVA levels with Open Food Facts...')
      parsed.foods = await verifyMealNovaLevels(parsed.foods)
    }

    res.json(parsed)
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('⏱️  Request timeout after 60s')
      return res.status(504).json({ error: 'Request timeout - try a smaller image' })
    }
    console.error('❌ Server error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY
  console.log(`\n🚀 PlateIQ Backend running on http://localhost:${PORT}`)
  console.log(`🔑 Claude API Key: ${apiKey ? 'Configured ✅' : 'Missing ❌'}\n`)
})
