/**
 * Open Food Facts NOVA Verification
 * Validates and corrects NOVA levels using the Open Food Facts database (4M+ products)
 */

interface OpenFoodFactsProduct {
  product_name: string
  nova_group?: number // 1-4 NOVA classification
  brands?: string
  ingredients_text?: string
  nutriments?: Record<string, number>
}

interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[]
  count: number
}

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/cgi/search.pl'
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7 // 7 days

// In-memory cache to avoid redundant API calls
const novaCache = new Map<string, { nova: number | null; timestamp: number; verified: boolean }>()

/**
 * Search Open Food Facts database for a food item
 * Returns verified NOVA level if found, null if not found
 */
export async function verifyNovaLevel(foodName: string): Promise<{
  nova: number | null
  verified: boolean
  source?: string
}> {
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
      console.warn(`Open Food Facts API error: ${response.status}`)
      return { nova: null, verified: false }
    }

    const data: OpenFoodFactsResponse = await response.json()

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

    console.log(`⚠️  NOVA not found in database: "${foodName}" (using Claude estimate)`)
    return { nova: null, verified: false }

  } catch (error) {
    console.error('Open Food Facts lookup error:', error)
    return { nova: null, verified: false }
  }
}

/**
 * Verify NOVA levels for multiple foods in parallel
 * Returns array of verified NOVA data
 */
export async function verifyMultipleNovaLevels(
  foods: Array<{ name: string; nova_level: number }>
): Promise<Array<{
  name: string
  originalNova: number
  verifiedNova: number
  verified: boolean
  changed: boolean
}>> {
  const verifications = await Promise.all(
    foods.map(async (food) => {
      const result = await verifyNovaLevel(food.name)
      return {
        name: food.name,
        originalNova: food.nova_level,
        verifiedNova: result.nova ?? food.nova_level,
        verified: result.verified,
        changed: result.verified && result.nova !== food.nova_level
      }
    })
  )

  const changedCount = verifications.filter(v => v.changed).length
  const verifiedCount = verifications.filter(v => v.verified).length

  if (verifiedCount > 0) {
    console.log(`📊 NOVA verification: ${verifiedCount}/${foods.length} verified, ${changedCount} corrected`)
  }

  return verifications
}

/**
 * Clear the NOVA cache (useful for testing)
 */
export function clearNovaCache(): void {
  novaCache.clear()
  console.log('🗑️  NOVA cache cleared')
}
