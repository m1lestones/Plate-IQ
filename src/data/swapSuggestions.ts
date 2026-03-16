/**
 * Swap suggestions for flagged nutrients, keyed by nutrient → food category.
 * Used in the VerdictCard to suggest healthier alternatives for the top offending food.
 */

const SWAPS: Record<string, Record<string, string>> = {
  sodium_mg: {
    carb:      'Swap baked goods for plain oats, brown rice, or unsalted whole grains',
    protein:   'Choose fresh poultry or fish over cured, smoked, or processed meats',
    dairy:     'Try unsalted cheese or low-sodium dairy alternatives',
    fat:       'Use unsalted nuts or oils instead of salted varieties',
    vegetable: 'Use fresh or frozen vegetables instead of canned with added salt',
    default:   'Replace packaged or seasoned items with fresh, unsalted whole foods',
  },
  saturated_fat_g: {
    protein:   'Swap for leaner cuts — chicken breast, white fish, or lentils',
    dairy:     'Try low-fat dairy, plain Greek yogurt, or plant-based alternatives',
    fat:       'Replace with unsaturated fats — olive oil, avocado, or walnuts',
    carb:      'Choose whole grain options without added butter or cream',
    default:   'Opt for plant-based proteins or lean animal proteins',
  },
  carbs_g: {
    carb:      'Swap refined carbs for cauliflower rice, zucchini noodles, or leafy greens',
    fruit:     'Try lower-sugar fruits like berries, which are also higher in fiber',
    dairy:     'Choose unsweetened dairy or plain Greek yogurt',
    default:   'Replace high-carb items with non-starchy vegetables',
  },
  added_sugar_g: {
    carb:      'Try unsweetened versions or swap for naturally sweet whole fruit',
    fruit:     'Stick to whole fruit over juice or dried fruit to reduce concentrated sugar',
    dairy:     'Choose plain, unsweetened dairy over flavored varieties',
    default:   'Swap sweetened items for fresh fruit or unsweetened alternatives',
  },
  cholesterol_mg: {
    protein:   'Try egg whites instead of whole eggs, or swap for tofu or legumes',
    dairy:     'Choose low-fat or plant-based dairy alternatives',
    default:   'Opt for lean proteins and increase plant-based protein sources',
  },
  fiber_g: {
    carb:      'Choose whole grain versions — oats, quinoa, or whole wheat over refined options',
    vegetable: 'Add more leafy greens, broccoli, or legumes to boost fiber',
    fruit:     'Include high-fiber fruits like pears, apples (with skin), or raspberries',
    default:   'Add legumes, seeds, or vegetables to increase fiber content',
  },
  potassium_mg: {
    vegetable: 'Boost potassium with spinach, sweet potato, or avocado',
    protein:   'Try salmon or white beans, which are naturally high in potassium',
    default:   'Add potassium-rich foods — sweet potatoes, leafy greens, or bananas',
  },
}

export function getSwapSuggestion(nutrientKey: string, topOffenderCategory: string): string | undefined {
  const nutrientSwaps = SWAPS[nutrientKey]
  if (!nutrientSwaps) return undefined
  return nutrientSwaps[topOffenderCategory] ?? nutrientSwaps['default']
}
