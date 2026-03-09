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
      max_tokens: 2048, // Increased for detailed analysis
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
              text: `You are an expert food identification system. Analyze this meal image and identify ALL visible foods with accurate portion estimates.

CRITICAL: First check if there are any reference objects for scale (credit card, fork, spoon, knife, coin, phone, plate edge). If found, use them to calculate more accurate portion sizes.

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "foods": [
    {
      "name": "Specific food name (e.g., 'Brown Rice' not just 'Rice')",
      "portion_grams": estimated_weight_in_grams,
      "estimated_calories": calories_for_this_portion,
      "confidence": 0.0_to_1.0_confidence_score,
      "nova_level": 1_to_4_processing_level,
      "category": "protein|carb|vegetable|fruit|dairy|fat|other"
    }
  ],
  "reference_object_detected": "credit_card|fork|spoon|plate|none",
  "meal_type": "breakfast|lunch|dinner|snack",
  "primary_cuisine": "American|Italian|Mexican|Indian|etc"
}

IDENTIFICATION GUIDELINES:
- Be SPECIFIC with food names (e.g., "Jasmine Rice" not "Rice", "Grilled Chicken Breast" not "Chicken")
- Pay special attention to visually similar foods:
  * Rice types: white vs brown vs jasmine vs basmati (check color and grain shape)
  * Grains: quinoa (ring-shaped) vs couscous (tiny round) vs bulgur
  * Pasta shapes: penne vs rigatoni vs ziti (check tube diameter and angle)
  * Greens: spinach vs kale vs lettuce (leaf texture matters)
- Don't miss small items: sauces, garnishes, condiments, seeds, herbs
- Look for partially obscured foods behind/under other items

PORTION SIZE ESTIMATION:
- If reference object detected: Use its known size to calculate scale
  * Credit card: 85.6mm × 53.98mm
  * Dinner fork: ~200mm length
  * Dinner plate: ~250-280mm diameter
- Calculate the area each food occupies on the plate
- Cross-reference with typical food densities:
  * Rice/grains: ~0.8g per cubic cm
  * Meat/protein: ~1.0-1.2g per cubic cm
  * Vegetables (cooked): ~0.6-0.8g per cubic cm
  * Liquids/sauces: ~1.0g per cubic cm

NOVA PROCESSING LEVELS:
1 = Unprocessed/minimally processed (fresh vegetables, plain meat, eggs, rice)
2 = Processed culinary ingredients (oils, butter, sugar, salt)
3 = Processed foods (canned vegetables, cheese, bread)
4 = Ultra-processed (packaged snacks, soda, fast food, processed meats)

CONFIDENCE SCORING:
- 0.9-1.0: Clearly visible, distinctive appearance, common food
- 0.7-0.9: Visible but could be confused with similar items
- 0.5-0.7: Partially obscured or ambiguous
- <0.5: Low visibility or highly uncertain

VALIDATION:
- If you cannot identify any food with confidence >0.5, return empty foods array
- Return pure JSON only, no additional text or formatting
- Ensure all numeric values are numbers, not strings`
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
      reference_object_detected: parsed.reference_object_detected || 'none',
      meal_type: parsed.meal_type || 'dinner',
      primary_cuisine: parsed.primary_cuisine || 'Mixed',
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
