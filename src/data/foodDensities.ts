/**
 * Food Density Database (g/cm³)
 * Based on NYU Tandon research and USDA nutritional data
 *
 * Density = mass / volume
 * Used for volumetric portion estimation when reference objects are detected
 */

export interface FoodDensityEntry {
  density: number // g/cm³
  category: string
  aliases: string[] // Alternative names
}

/**
 * Comprehensive food density database
 * Organized by food type for easy lookup
 */
export const FOOD_DENSITIES: Record<string, FoodDensityEntry> = {
  // ========== GRAINS & STARCHES ==========
  'white rice': { density: 0.85, category: 'carb', aliases: ['steamed rice', 'jasmine rice', 'basmati rice'] },
  'brown rice': { density: 0.80, category: 'carb', aliases: ['whole grain rice'] },
  'fried rice': { density: 0.75, category: 'carb', aliases: [] },
  'quinoa': { density: 0.75, category: 'carb', aliases: ['quinoa grain'] },
  'couscous': { density: 0.70, category: 'carb', aliases: [] },
  'pasta': { density: 0.90, category: 'carb', aliases: ['spaghetti', 'penne', 'macaroni', 'noodles'] },
  'bread': { density: 0.25, category: 'carb', aliases: ['toast', 'sandwich bread', 'sliced bread'] },
  'bagel': { density: 0.50, category: 'carb', aliases: [] },
  'tortilla': { density: 0.40, category: 'carb', aliases: ['wrap', 'flatbread'] },
  'oatmeal': { density: 0.85, category: 'carb', aliases: ['porridge', 'oats'] },

  // ========== PROTEINS - MEAT ==========
  'chicken breast': { density: 1.05, category: 'protein', aliases: ['grilled chicken', 'baked chicken', 'chicken'] },
  'chicken thigh': { density: 1.08, category: 'protein', aliases: ['dark meat chicken'] },
  'ground beef': { density: 1.00, category: 'protein', aliases: ['minced beef', 'hamburger'] },
  'beef steak': { density: 1.10, category: 'protein', aliases: ['steak', 'sirloin', 'ribeye'] },
  'pork chop': { density: 1.08, category: 'protein', aliases: ['pork'] },
  'bacon': { density: 0.95, category: 'protein', aliases: ['bacon strips'] },
  'sausage': { density: 1.05, category: 'protein', aliases: ['hot dog', 'bratwurst'] },
  'ham': { density: 1.10, category: 'protein', aliases: ['deli ham', 'sliced ham'] },

  // ========== PROTEINS - SEAFOOD ==========
  'salmon': { density: 1.00, category: 'protein', aliases: ['grilled salmon', 'baked salmon'] },
  'tuna': { density: 1.05, category: 'protein', aliases: ['tuna steak'] },
  'shrimp': { density: 0.95, category: 'protein', aliases: ['prawns', 'grilled shrimp'] },
  'fish fillet': { density: 1.00, category: 'protein', aliases: ['fish', 'white fish', 'cod', 'tilapia'] },

  // ========== PROTEINS - PLANT-BASED ==========
  'tofu': { density: 0.95, category: 'protein', aliases: ['bean curd'] },
  'tempeh': { density: 1.00, category: 'protein', aliases: [] },
  'beans': { density: 0.85, category: 'protein', aliases: ['black beans', 'kidney beans', 'pinto beans'] },
  'lentils': { density: 0.80, category: 'protein', aliases: ['dal'] },
  'chickpeas': { density: 0.85, category: 'protein', aliases: ['garbanzo beans'] },
  'edamame': { density: 0.75, category: 'protein', aliases: ['soybeans'] },

  // ========== PROTEINS - EGGS & DAIRY ==========
  'eggs': { density: 1.03, category: 'protein', aliases: ['scrambled eggs', 'fried egg', 'boiled egg'] },
  'cheese': { density: 1.15, category: 'dairy', aliases: ['cheddar', 'mozzarella', 'swiss'] },
  'cottage cheese': { density: 1.05, category: 'dairy', aliases: [] },
  'yogurt': { density: 1.05, category: 'dairy', aliases: ['greek yogurt'] },
  'milk': { density: 1.03, category: 'dairy', aliases: [] },

  // ========== VEGETABLES - COOKED ==========
  'broccoli': { density: 0.60, category: 'vegetable', aliases: ['steamed broccoli'] },
  'carrots': { density: 0.70, category: 'vegetable', aliases: ['cooked carrots'] },
  'spinach': { density: 0.55, category: 'vegetable', aliases: ['cooked spinach'] },
  'kale': { density: 0.50, category: 'vegetable', aliases: ['cooked kale'] },
  'green beans': { density: 0.65, category: 'vegetable', aliases: ['string beans'] },
  'peas': { density: 0.80, category: 'vegetable', aliases: ['green peas'] },
  'corn': { density: 0.75, category: 'vegetable', aliases: ['corn kernels'] },
  'cauliflower': { density: 0.55, category: 'vegetable', aliases: [] },
  'bell pepper': { density: 0.50, category: 'vegetable', aliases: ['peppers', 'capsicum'] },
  'zucchini': { density: 0.60, category: 'vegetable', aliases: ['courgette'] },
  'eggplant': { density: 0.55, category: 'vegetable', aliases: ['aubergine'] },
  'mushrooms': { density: 0.50, category: 'vegetable', aliases: ['cooked mushrooms'] },
  'tomato': { density: 0.60, category: 'vegetable', aliases: ['tomatoes', 'cooked tomato'] },
  'asparagus': { density: 0.55, category: 'vegetable', aliases: [] },

  // ========== VEGETABLES - RAW ==========
  'salad': { density: 0.30, category: 'vegetable', aliases: ['lettuce', 'mixed greens', 'leafy greens'] },
  'cucumber': { density: 0.40, category: 'vegetable', aliases: [] },
  'raw carrot': { density: 0.55, category: 'vegetable', aliases: ['carrot sticks'] },

  // ========== FRUITS ==========
  'apple': { density: 0.65, category: 'fruit', aliases: ['sliced apple'] },
  'banana': { density: 0.60, category: 'fruit', aliases: ['sliced banana'] },
  'orange': { density: 0.70, category: 'fruit', aliases: ['orange slices'] },
  'berries': { density: 0.55, category: 'fruit', aliases: ['strawberries', 'blueberries', 'raspberries'] },
  'grapes': { density: 0.65, category: 'fruit', aliases: [] },
  'melon': { density: 0.50, category: 'fruit', aliases: ['watermelon', 'cantaloupe'] },
  'mango': { density: 0.60, category: 'fruit', aliases: [] },
  'pineapple': { density: 0.55, category: 'fruit', aliases: [] },
  'avocado': { density: 0.70, category: 'fruit', aliases: [] },

  // ========== FATS & OILS ==========
  'olive oil': { density: 0.92, category: 'fat', aliases: ['oil'] },
  'butter': { density: 0.91, category: 'fat', aliases: [] },
  'nuts': { density: 0.65, category: 'fat', aliases: ['almonds', 'walnuts', 'cashews', 'peanuts'] },
  'seeds': { density: 0.60, category: 'fat', aliases: ['sunflower seeds', 'chia seeds'] },
  'peanut butter': { density: 1.10, category: 'fat', aliases: ['nut butter'] },

  // ========== SAUCES & CONDIMENTS ==========
  'tomato sauce': { density: 1.00, category: 'other', aliases: ['marinara', 'pasta sauce'] },
  'soy sauce': { density: 1.10, category: 'other', aliases: [] },
  'salsa': { density: 0.95, category: 'other', aliases: [] },
  'hummus': { density: 1.05, category: 'other', aliases: [] },
  'guacamole': { density: 0.85, category: 'other', aliases: [] },
  'gravy': { density: 1.00, category: 'other', aliases: [] },
  'mayonnaise': { density: 0.95, category: 'fat', aliases: ['mayo'] },
  'ketchup': { density: 1.10, category: 'other', aliases: [] },
  'mustard': { density: 1.05, category: 'other', aliases: [] },

  // ========== SOUPS & LIQUIDS ==========
  'soup': { density: 1.00, category: 'other', aliases: ['broth', 'stew'] },
  'curry': { density: 0.95, category: 'other', aliases: ['curry sauce'] },
  'chili': { density: 1.00, category: 'other', aliases: [] },

  // ========== PROCESSED FOODS ==========
  'pizza': { density: 0.70, category: 'other', aliases: ['pizza slice'] },
  'burger patty': { density: 1.00, category: 'protein', aliases: [] },
  'french fries': { density: 0.50, category: 'carb', aliases: ['fries', 'chips'] },
  'potato chips': { density: 0.30, category: 'carb', aliases: ['crisps'] },
  'ice cream': { density: 0.55, category: 'other', aliases: [] },
  'cake': { density: 0.40, category: 'other', aliases: ['sponge cake'] },
  'cookie': { density: 0.45, category: 'other', aliases: ['biscuit'] },
  'chocolate': { density: 1.20, category: 'other', aliases: [] },

  // ========== DEFAULT FALLBACKS ==========
  'default_solid': { density: 0.85, category: 'other', aliases: [] },
  'default_liquid': { density: 1.00, category: 'other', aliases: [] },
}

/**
 * Lookup food density by name (case-insensitive, handles aliases)
 */
export function getFoodDensity(foodName: string): number {
  const normalized = foodName.toLowerCase().trim()

  // Direct match
  if (FOOD_DENSITIES[normalized]) {
    return FOOD_DENSITIES[normalized].density
  }

  // Check aliases
  for (const [, entry] of Object.entries(FOOD_DENSITIES)) {
    if (entry.aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return entry.density
    }
  }

  // Partial match (e.g., "grilled salmon" matches "salmon")
  for (const [foodKey, entry] of Object.entries(FOOD_DENSITIES)) {
    if (normalized.includes(foodKey) || foodKey.includes(normalized)) {
      return entry.density
    }
  }

  // Default fallback
  return FOOD_DENSITIES['default_solid'].density
}

/**
 * Get all foods in a category
 */
export function getFoodsByCategory(category: string): string[] {
  return Object.entries(FOOD_DENSITIES)
    .filter(([_, entry]) => entry.category === category)
    .map(([name]) => name)
}

/**
 * Calculate portion weight using volumetric method
 * @param foodAreaCm2 - Food area in cm² (from image analysis)
 * @param assumedHeightCm - Assumed height/thickness (default 1.5cm for average food)
 * @param density - Food density in g/cm³
 */
export function calculatePortionWeight(
  foodAreaCm2: number,
  density: number,
  assumedHeightCm: number = 1.5
): number {
  const volumeCm3 = foodAreaCm2 * assumedHeightCm
  return Math.round(volumeCm3 * density)
}
