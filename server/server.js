import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { supabase } from './supabaseClient.js'
import { verifyMealNovaLevels } from './novaVerification.js'
import crypto from 'crypto'

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

// Upload meal image to Supabase Storage
app.post('/api/upload-image', async (req, res) => {
  try {
    const { imageData, mediaType, sessionId } = req.body

    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = crypto.randomBytes(8).toString('hex')
    const extension = mediaType?.split('/')[1] || 'jpg'
    const filename = `${sessionId || 'anonymous'}_${timestamp}_${randomId}.${extension}`
    const filepath = `meals/${filename}`

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meal-images')
      .upload(filepath, buffer, {
        contentType: mediaType || 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return res.status(500).json({ error: 'Failed to upload image', details: uploadError })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('meal-images')
      .getPublicUrl(filepath)

    console.log(`✅ Image uploaded: ${filename}`)

    res.json({
      success: true,
      imageUrl: urlData.publicUrl,
      imagePath: filepath
    })
  } catch (error) {
    console.error('❌ Image upload error:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

// Collective Learning Endpoint - Receives feedback from ALL users
app.post('/api/feedback', async (req, res) => {
  try {
    const { type, data, sessionId } = req.body

    console.log(`📊 Feedback received: ${type}`)

    // Save to appropriate Supabase table based on feedback type
    let result

    if (type === 'food_correction') {
      const { original, corrected, mealScanId } = data
      result = await supabase.from('food_corrections').insert({
        meal_scan_id: mealScanId || null,
        session_id: sessionId || 'anonymous',
        original_food_name: original.name,
        original_grams: original.grams,
        original_nova_level: original.nova_level || 1,
        corrected_food_name: corrected.name,
        corrected_grams: corrected.grams,
        corrected_nova_level: corrected.nova_level || 1,
        correction_type: original.name !== corrected.name ? 'name_change' : 'portion_change'
      })
    } else if (type === 'position_correction') {
      const { foodName, originalPosition, correctedPosition, mealScanId } = data
      result = await supabase.from('position_corrections').insert({
        meal_scan_id: mealScanId || null,
        session_id: sessionId || 'anonymous',
        food_name: foodName,
        original_x: originalPosition.x,
        original_y: originalPosition.y,
        corrected_x: correctedPosition.x,
        corrected_y: correctedPosition.y
      })
    } else if (type === 'portion_adjustment') {
      const { foodName, originalGrams, adjustedGrams, adjustmentType, mealScanId } = data
      result = await supabase.from('portion_adjustments').insert({
        meal_scan_id: mealScanId || null,
        session_id: sessionId || 'anonymous',
        food_name: foodName,
        original_grams: originalGrams,
        adjusted_grams: adjustedGrams,
        adjustment_type: adjustmentType || 'custom'
      })
    }

    if (result?.error) {
      console.error('❌ Database error:', result.error)
      return res.status(500).json({ error: 'Failed to save feedback' })
    }

    console.log(`✅ Feedback saved to database`)
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
    const { data, error } = await supabase
      .from('position_corrections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) throw error

    // Aggregate positions by food name
    const aggregated = {}
    data.forEach(correction => {
      const foodName = correction.food_name.toLowerCase()
      if (!aggregated[foodName]) {
        aggregated[foodName] = {
          avgX: 0,
          avgY: 0,
          count: 0
        }
      }
      aggregated[foodName].avgX += correction.corrected_x
      aggregated[foodName].avgY += correction.corrected_y
      aggregated[foodName].count += 1
    })

    // Calculate averages
    Object.keys(aggregated).forEach(foodName => {
      const item = aggregated[foodName]
      aggregated[foodName] = {
        x: Math.round((item.avgX / item.count) * 100) / 100,
        y: Math.round((item.avgY / item.count) * 100) / 100,
        sampleSize: item.count
      }
    })

    res.json(aggregated)
  } catch (error) {
    console.error('❌ Community positions error:', error)
    res.status(500).json({ error: 'Failed to get community positions' })
  }
})

// Get common food identification corrections
app.get('/api/community/food-corrections', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('food_corrections')
      .select('original_food_name, corrected_food_name')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) throw error

    // Count correction patterns
    const corrections = {}
    data.forEach(item => {
      const key = `${item.original_food_name}→${item.corrected_food_name}`
      corrections[key] = (corrections[key] || 0) + 1
    })

    // Convert to array and sort
    const result = Object.entries(corrections)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([key, count]) => {
        const [original, corrected] = key.split('→')
        return { original, corrected, count }
      })

    res.json(result)
  } catch (error) {
    console.error('❌ Food corrections error:', error)
    res.status(500).json({ error: 'Failed to get food corrections' })
  }
})

// Get portion adjustment patterns
app.get('/api/community/portion-adjustments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('portion_adjustments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) throw error

    // Aggregate by food name
    const adjustments = {}
    data.forEach(item => {
      const foodName = item.food_name
      if (!adjustments[foodName]) {
        adjustments[foodName] = {
          totalRatio: 0,
          count: 0
        }
      }
      const ratio = item.adjusted_grams / item.original_grams
      adjustments[foodName].totalRatio += ratio
      adjustments[foodName].count += 1
    })

    // Calculate averages
    const result = {}
    Object.keys(adjustments).forEach(foodName => {
      const item = adjustments[foodName]
      const avgRatio = item.totalRatio / item.count
      result[foodName] = {
        averageAdjustmentRatio: Math.round(avgRatio * 100) / 100,
        sampleSize: item.count,
        suggestion: avgRatio > 1.1 ? 'AI underestimates' : avgRatio < 0.9 ? 'AI overestimates' : 'Accurate'
      }
    })

    res.json(result)
  } catch (error) {
    console.error('❌ Portion adjustments error:', error)
    res.status(500).json({ error: 'Failed to get portion adjustments' })
  }
})

// Analytics endpoint - Get aggregated learning data from Supabase
app.get('/api/analytics', async (req, res) => {
  try {
    // Get counts from all tables
    const [scansResult, correctionsResult, positionsResult, portionsResult] = await Promise.all([
      supabase.from('meal_scans').select('*', { count: 'exact', head: true }),
      supabase.from('food_corrections').select('*', { count: 'exact', head: true }),
      supabase.from('position_corrections').select('*', { count: 'exact', head: true }),
      supabase.from('portion_adjustments').select('*', { count: 'exact', head: true })
    ])

    // Get most corrected foods
    const { data: topCorrections } = await supabase
      .from('food_corrections')
      .select('original_food_name')
      .order('created_at', { ascending: false })
      .limit(100)

    const mostCorrectedFoods = {}
    topCorrections?.forEach(item => {
      const name = item.original_food_name
      mostCorrectedFoods[name] = (mostCorrectedFoods[name] || 0) + 1
    })

    const stats = {
      totalMealScans: scansResult.count || 0,
      totalFeedback: (correctionsResult.count || 0) + (positionsResult.count || 0) + (portionsResult.count || 0),
      byType: {
        food_corrections: correctionsResult.count || 0,
        position_corrections: positionsResult.count || 0,
        portion_adjustments: portionsResult.count || 0
      },
      mostCorrectedFoods
    }

    res.json(stats)
  } catch (error) {
    console.error('❌ Analytics error:', error)
    res.status(500).json({ error: 'Analytics error' })
  }
})

app.post('/api/analyze', async (req, res) => {
  try {
    const { imageData, mediaType, sessionId, imageUrl, imagePath } = req.body
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
      "category": "protein|carb|vegetable|fruit|dairy|fat|other",
      "confidence": 0.0_to_1.0_how_confident_you_are_in_this_identification
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

    // Save meal scan to Supabase database
    try {
      const { data: mealScan, error: dbError } = await supabase
        .from('meal_scans')
        .insert({
          session_id: sessionId || 'anonymous',
          image_url: imageUrl || null,
          image_path: imagePath || null,
          meal_type: parsed.meal_type || null,
          primary_cuisine: parsed.primary_cuisine || null,
          reference_object_detected: parsed.reference_object_detected || 'none',
          foods: parsed.foods || []
        })
        .select()
        .single()

      if (dbError) {
        console.error('❌ Failed to save meal scan:', dbError)
      } else {
        console.log(`✅ Meal scan saved to database (ID: ${mealScan.id})`)
        parsed.mealScanId = mealScan.id  // Return scan ID to frontend for feedback linking
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
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
