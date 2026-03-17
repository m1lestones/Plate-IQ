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

// HIGH GI (70+) — flag for diabetes
const HIGH_GI_FRUITS: string[] = [
  'watermelon',                              // GI 75
  'dates',                                   // GI 70
  'plantain', 'plantains', 'cooked plantain', // GI 70 cooked
  'lychee in syrup', 'canned lychee',        // GI 79 — canned only
]

// MEDIUM GI (56-69) — gentle caution for diabetes only
const MEDIUM_GI_FRUITS: string[] = [
  'mango', 'mangoes', 'mango slices',        // GI 56 — glycemic-index.net
  'pineapple', 'pineapples',                 // GI 66
  'melon', 'cantaloupe', 'honeydew', 'rockmelon', // GI 65
  'papaya', 'papayas',                       // GI 60
  'raisins',                                 // GI 65
  'dried fruit', 'dried fruits',             // GI 60+
  'breadfruit',                              // GI 65
  'ripe banana', 'very ripe banana',         // GI 60 when overripe
]

// LOW GI (≤55) — safe even for diabetes
const LOW_GI_FRUITS: string[] = [
  'avocado', 'avocados',                     // GI 10
  'physalis', 'cape gooseberry',             // GI 15
  'black currant', 'blackcurrant',           // GI 15
  'gooseberry', 'gooseberries',              // GI 15
  'grapefruit', 'grapefruits',               // GI 22
  'blueberry', 'blueberries',               // GI 25
  'blackberry', 'blackberries',             // GI 25
  'raspberry', 'raspberries',               // GI 25
  'strawberry', 'strawberries',             // GI 25
  'cherry', 'cherries',                     // GI 25
  'cloudberry', 'cloudberries',             // GI 25
  'goji berries', 'goji berry',             // GI 25
  'red currant', 'redcurrant',              // GI 25
  'pear', 'pears',                          // GI 30
  'mandarin', 'mandarins',                  // GI 30
  'tangerine', 'tangerines',                // GI 30
  'orange', 'oranges',                      // GI 30-35
  'passion fruit', 'passionfruit',          // GI 30
  'pomelo',                                 // GI 30
  'apricot', 'apricots',                    // GI 34
  'fig', 'figs',                            // GI 35
  'nectarine', 'nectarines',               // GI 35
  'peach', 'peaches',                      // GI 35
  'plum', 'plums',                         // GI 35
  'pomegranate', 'pomegranates',           // GI 35
  'prickly pear',                          // GI 35
  'quince',                                // GI 35
  'apple', 'apples',                       // GI 36
  'prune', 'prunes',                       // GI 40
  'melon pear', 'pepino',                  // GI 40
  'cranberry', 'cranberries',              // GI 45
  'green banana', 'unripe banana',         // GI 45
  'banana', 'bananas',                     // GI 48
  'grapes', 'grape', 'red grapes', 'green grapes', // GI 45-46
  'kiwi', 'kiwis', 'kiwifruit',           // GI 50
  'lychee', 'lychees',                     // GI 50 fresh
  'persimmon', 'persimmons',              // GI 50
  'lemon', 'lemons', 'lime', 'limes',     // very low
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
