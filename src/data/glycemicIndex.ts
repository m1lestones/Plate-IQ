/**
 * Glycemic Index classifications for fruits
 * Sources:
 *   - https://glycemic-index.net/glycemic-index-of-fruits/
 *   - https://zoe.com/learn/glycemic-index-chart
 *   - https://www.verywellhealth.com/glycemic-index-chart-for-common-foods-1087476
 *
 * GI < 55  = Low  (safe for diabetes)
 * GI 55-69 = Medium (caution for diabetes)
 * GI 70+   = High (avoid for diabetes)
 */

export type GILevel = 'low' | 'medium' | 'high'

const HIGH_GI_FRUITS: string[] = [
  'watermelon', 'dates', 'plantain', 'plantains', 'breadfruit',
  'lychee', 'lychees',
]

// Medium GI (56-69) — gentle caution for diabetes only
// Sources: glycemic-index.net + ZOE + Diabetes Canada
const MEDIUM_GI_FRUITS: string[] = [
  'pineapple', 'pineapples',
  'melon', 'cantaloupe', 'honeydew', 'rockmelon',
  'papaya', 'papayas',
  'raisins', 'dried fruit', 'dried fruits',
]

// Low GI (≤55) — safe even for diabetes
// Note: mango (51), banana (51), grapes (46) are LOW per Diabetes Canada
const LOW_GI_FRUITS: string[] = [
  'blueberry', 'blueberries',
  'strawberry', 'strawberries',
  'raspberry', 'raspberries',
  'blackberry', 'blackberries',
  'cherry', 'cherries',
  'apple', 'apples',
  'pear', 'pears',
  'orange', 'oranges',
  'grapefruit', 'grapefruits',
  'peach', 'peaches',
  'plum', 'plums',
  'apricot', 'apricots',
  'kiwi', 'kiwis', 'kiwifruit',
  'mandarin', 'mandarins', 'tangerine', 'tangerines',
  'passion fruit', 'passionfruit',
  'nectarine', 'nectarines',
  'fig', 'figs',
  'pomelo', 'cranberry', 'cranberries',
  'goji berries', 'goji berry',
  'lemon', 'lemons', 'lime', 'limes',
  'mango', 'mangoes', 'mango slices',       // GI 51 — Diabetes Canada
  'banana', 'bananas', 'ripe banana',        // GI 51 — Diabetes Canada
  'grapes', 'grape', 'red grapes', 'black grapes', 'green grapes', // GI 46 — Diabetes Canada
  'green banana', 'unripe banana',
]

export function getFruitGILevel(foodName: string): GILevel | null {
  const name = foodName.toLowerCase()

  if (HIGH_GI_FRUITS.some(f => name.includes(f))) return 'high'
  if (MEDIUM_GI_FRUITS.some(f => name.includes(f))) return 'medium'
  if (LOW_GI_FRUITS.some(f => name.includes(f))) return 'low'

  // Generic fruit detection — if name contains "fruit" or common fruit words
  if (name.includes('fruit') || name.includes('berry') || name.includes('berries')) return 'low'

  return null // not a fruit we recognize
}
