/**
 * Open Food Facts NOVA Verification (Server-side)
 * Validates and corrects NOVA levels using the Open Food Facts database (4M+ products)
 */

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/cgi/search.pl'
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7 // 7 days

// In-memory cache to avoid redundant API calls
const novaCache = new Map()

/**
 * Search Open Food Facts database for a food item
 * Returns verified NOVA level if found, null if not found
 */
export async function verifyNovaLevel(foodName) {
  const normalized = foodName.toLowerCase().trim()

  // Check cache first
  const cached = novaCache.get(normalized)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { nova: cached.nova, verified: cached.verified, source: 'cache' }
  }

  try {
    // Search Open Food Facts
    const searchParams = new URLSearchParams({
      search_terms: foodName,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '5',
      fields: 'product_name,nova_group,brands,ingredients_text'
    })

    const response = await fetch(`${OPEN_FOOD_FACTS_API}?${searchParams}`, {
      headers: { 'User-Agent': 'PlateIQ-FoodWellness/1.0' }
    })

    if (!response.ok) {
      console.warn(`⚠️  Open Food Facts API error: ${response.status}`)
      return { nova: null, verified: false }
    }

    const data = await response.json()

    // Find best match (fuzzy matching on product name)
    const bestMatch = data.products.find(p => {
      const productName = p.product_name?.toLowerCase() || ''
      return productName.includes(normalized) || normalized.includes(productName)
    })

    if (bestMatch && bestMatch.nova_group) {
      const result = {
        nova: bestMatch.nova_group,
        verified: true,
        source: 'openfoodfacts'
      }

      // Cache result
      novaCache.set(normalized, {
        nova: bestMatch.nova_group,
        timestamp: Date.now(),
        verified: true
      })

      console.log(`✅ NOVA verified: "${foodName}" = NOVA ${bestMatch.nova_group} (Open Food Facts)`)
      return result
    }

    // Not found - cache negative result to avoid repeated lookups
    novaCache.set(normalized, {
      nova: null,
      timestamp: Date.now(),
      verified: false
    })

    return { nova: null, verified: false }

  } catch (error) {
    console.error('❌ Open Food Facts lookup error:', error.message)
    return { nova: null, verified: false }
  }
}

/**
 * Verify NOVA levels for all foods in a meal
 * Returns foods with verified NOVA levels
 */
export async function verifyMealNovaLevels(foods) {
  const verifications = await Promise.all(
    foods.map(async (food) => {
      const result = await verifyNovaLevel(food.name)

      const verifiedFood = { ...food }

      if (result.verified && result.nova) {
        // Update NOVA level with verified data
        verifiedFood.nova_level = result.nova
        verifiedFood.nova_verified = true
      } else {
        // Keep Claude's estimate
        verifiedFood.nova_verified = false
      }

      return verifiedFood
    })
  )

  const verifiedCount = verifications.filter(f => f.nova_verified).length
  const changedCount = verifications.filter((f, i) => f.nova_verified && f.nova_level !== foods[i].nova_level).length

  if (verifiedCount > 0) {
    console.log(`📊 NOVA verification: ${verifiedCount}/${foods.length} verified, ${changedCount} corrected`)
  }

  return verifications
}
