/**
 * Comprehensive Glycemic Index (GI) Database
 * Sources:
 *   - https://glycemic-index.net/glycemic-index-chart/
 *   - https://glycemic-index.net/glycemic-index-of-fruits/
 *   - https://glycemic-index.net/glycemic-index-of-cereals-and-grains/
 *   - https://glycemic-index.net/glycemic-index-of-bread/
 *   - https://glycemic-index.net/glycemic-index-of-vegetables/
 *   - https://glycemic-index.net/glycemic-index-of-rice/
 *   - https://zoe.com/learn/glycemic-index-chart
 *   - https://www.diabetes.ca (Diabetes Canada GI food guide)
 *
 * GI < 55  = Low   (safe)
 * GI 55-69 = Medium (caution for diabetes)
 * GI 70+   = High  (avoid for diabetes)
 */

export type GILevel = 'low' | 'medium' | 'high'

// ─────────────────────────────────────────────
// HIGH GI (70+) — flag for diabetes
// ─────────────────────────────────────────────
const HIGH_GI_FOODS: string[] = [
  // Fruits
  'watermelon', 'dates', 'date',
  'plantain', 'plantains', 'cooked plantain',
  'lychee in syrup', 'canned lychee',

  // Vegetables
  'baked potato', 'fried potato', 'mashed potato', 'mashed potatoes',
  'boiled potato', 'boiled potatoes', 'potato',
  'instant potato', 'instant potatoes',
  'potato chips', 'french fries', 'fries',
  'parsnip', 'parsnips',
  'cooked carrot', 'boiled carrot',
  'boiled celery', 'cooked celery',
  'pumpkin', 'boiled pumpkin',
  'rutabaga', 'turnip cooked', 'boiled turnip',
  'sweet potato', 'yam', 'batata',

  // Grains & Rice
  'instant oats', 'instant oatmeal',
  'instant rice', 'white rice', 'sticky rice', 'risotto',
  'rice flakes', 'rice flour', 'rice porridge',
  'cornflakes', 'corn flakes', 'corn starch', 'corn flour',
  'cornmeal', 'corn meal',
  'millet', 'millet porridge',
  'sorghum',
  'gnocchi',
  'white flour', 'wheat flour', 'premium wheat flour',
  'arrowroot', 'arrowroot flour',

  // Bread & Baked
  'white bread', 'sandwich bread', 'baguette',
  'bagel', 'bagels',
  'croissant', 'croissants',
  'donut', 'donuts', 'doughnut', 'doughnuts',
  'waffles', 'waffle',
  'crackers', 'rice cakes', 'rice cake',
  'rice biscuits', 'rice bread',
  'biscuit', 'biscuits',
  'brioche',
  'wheat bread',

  // Sweets
  'glucose', 'dextrose', 'glucose syrup',
  'rice syrup', 'corn syrup', 'wheat syrup',
  'brown sugar', 'molasses',
  'chocolate bar', 'candy bar',
  'condensed milk with sugar',
  'fruit bar', 'fruit snack bar',

  // Beverages
  'beer', 'sports drink', 'sports drinks', 'energy drink',
  'soda', 'cola', 'soft drink',

  // Fast Food
  'tacos', 'taco',
  'dumplings', 'tapioca',
]

// ─────────────────────────────────────────────
// MEDIUM GI (55–69) — caution for diabetes
// ─────────────────────────────────────────────
const MEDIUM_GI_FOODS: string[] = [
  // Fruits
  'mango', 'mangoes', 'mango slices',
  'pineapple', 'pineapples',
  'melon', 'cantaloupe', 'honeydew', 'rockmelon',
  'papaya', 'papayas',
  'raisins',
  'dried fruit', 'dried fruits',
  'ripe banana', 'very ripe banana', 'overripe banana',
  'breadfruit',

  // Vegetables
  'boiled beets', 'beets boiled', 'cooked beets',
  'canned vegetables',
  'yam cooked',

  // Grains & Rice
  'oatmeal', 'oats', 'rolled oats', 'porridge',
  'oat porridge', 'oatmeal porridge',
  'couscous',
  'long grain rice', 'jasmine rice', 'rice jasmine',
  'udon', 'udon noodles',
  'corn pasta', 'rice noodles',
  'buckwheat noodles',
  'bulgur', 'bulgar',
  'muesli', 'granola',
  'durum wheat semolina', 'semolina',
  'pearl barley', 'pearl barley steamed',
  'red rice',
  'wholemeal flour', 'whole wheat flour',
  'yellow corn', 'corn canned', 'canned corn',

  // Bread & Baked
  'hamburger bun', 'burger bun',
  'pancakes', 'pancake',
  'pizza',
  'pita', 'pita bread',
  'rye bread', 'rye crackers',
  'wholemeal bread', 'whole wheat bread', 'brown bread',
  'bran bread',
  'flatbread', 'flatbreads',
  'shortbread', 'butter cookies',
  'oatmeal cookies',
  'rice waffles',

  // Dairy
  'ice cream', 'vanilla ice cream',
  'oat milk',
  'processed cheese',
  'sweetened yogurt', 'fruit yogurt', 'flavored yogurt',

  // Sweets
  'honey',
  'maple syrup',
  'sugar', 'table sugar',
  'condensed milk',
  'chocolate powder with sugar',
  'jam', 'marmalade with sugar',
  'sorbet',

  // Beverages
  'grape juice',
  'soft drinks', 'cola drinks',
  'beet juice',

  // Fast Food
  'hamburger', 'burger',
  'corn chips', 'tortilla chips',

  // Other
  'chestnut', 'chestnuts',
  'sushi',
  'ketchup',
]

// ─────────────────────────────────────────────
// LOW GI (≤55) — safe even for diabetes
// ─────────────────────────────────────────────
const LOW_GI_FOODS: string[] = [
  // Fruits
  'avocado', 'avocados',
  'grapefruit', 'grapefruits',
  'blueberry', 'blueberries',
  'blackberry', 'blackberries',
  'raspberry', 'raspberries',
  'strawberry', 'strawberries',
  'cherry', 'cherries',
  'cloudberry', 'cloudberries',
  'goji berry', 'goji berries',
  'red currant', 'black currant', 'currant',
  'gooseberry', 'gooseberries',
  'physalis', 'cape gooseberry',
  'pear', 'pears',
  'mandarin', 'mandarins',
  'tangerine', 'tangerines',
  'orange', 'oranges',
  'passion fruit', 'passionfruit',
  'pomelo',
  'apricot', 'apricots',
  'fig', 'figs',
  'nectarine', 'nectarines',
  'peach', 'peaches',
  'plum', 'plums',
  'pomegranate', 'pomegranates',
  'prickly pear',
  'quince',
  'apple', 'apples',
  'prune', 'prunes',
  'cranberry', 'cranberries',
  'green banana', 'unripe banana',
  'banana', 'bananas',
  'grapes', 'grape', 'red grapes', 'green grapes',
  'kiwi', 'kiwifruit',
  'lychee', 'lychees',
  'persimmon', 'persimmons',
  'lemon', 'lemons',
  'lime', 'limes',
  'melon pear', 'pepino',
  'sea buckthorn',
  'acerola', 'barbados cherry',

  // Vegetables (almost all raw/fresh vegetables are low GI)
  'broccoli', 'broccoli florets',
  'asparagus',
  'zucchini', 'courgette',
  'cabbage', 'white cabbage', 'chinese cabbage', 'red cabbage',
  'green beans', 'string beans',
  'cauliflower',
  'spinach',
  'lettuce', 'salad', 'arugula', 'rocket',
  'cucumber', 'cucumbers',
  'celery',
  'tomato', 'tomatoes', 'cherry tomatoes',
  'eggplant', 'aubergine',
  'mushroom', 'mushrooms',
  'onion', 'onions', 'red onion',
  'garlic',
  'leek', 'leeks',
  'artichoke', 'artichokes',
  'brussels sprouts',
  'radish', 'radishes',
  'beetroot', 'beets', 'beet',
  'carrot', 'carrots',
  'turnip',
  'fennel',
  'chilli', 'chili', 'chile', 'bell pepper', 'pepper', 'peppers',
  'sweet pepper',
  'squash', 'butternut squash', 'acorn squash',
  'sauerkraut',
  'rhubarb',
  'kale',
  'bok choy',
  'bamboo',
  'peas', 'green peas', 'snow peas', 'sugar snap peas',

  // Grains & Rice
  'quinoa',
  'brown rice',
  'basmati rice',
  'wild rice',
  'whole grain pasta', 'whole wheat pasta', 'wholemeal pasta',
  'spaghetti al dente', 'spaghetti', 'pasta', 'fettuccine', 'penne',
  'buckwheat', 'buckwheat groats', 'buckwheat pasta',
  'barley', 'barley groats', 'pearl barley raw',
  'oat bran', 'wheat bran', 'bran',
  'chia seeds', 'chia',
  'flaxseed', 'flax seeds',
  'pumpkin seeds', 'sunflower seeds',
  'tortilla corn', 'corn tortilla',
  'rye flakes',
  'amaranth',
  'kamut',
  'spelled wheat', 'spelt',
  'muesli sugar free', 'sugar free muesli',
  'whole grain bread', 'sprouted grain bread', 'pumpernickel',

  // Legumes & Beans
  'lentils', 'lentil', 'red lentils', 'green lentils',
  'chickpeas', 'chickpea', 'garbanzo',
  'hummus',
  'black beans', 'kidney beans', 'white beans',
  'soybeans', 'soy', 'tofu', 'tempeh', 'edamame',
  'mung beans',
  'navy beans', 'pinto beans',
  'falafel',

  // Nuts & Seeds
  'almonds', 'almond',
  'walnuts', 'walnut',
  'cashews', 'cashew',
  'pistachios', 'pistachio',
  'peanuts', 'peanut',
  'peanut butter',
  'hazelnuts', 'hazelnut',
  'pine nuts',
  'macadamia', 'macadamia nuts',
  'pecans', 'pecan',
  'mixed nuts', 'nuts',
  'sesame', 'sesame seeds', 'tahini',
  'coconut', 'coconut flour',

  // Dairy
  'milk', 'whole milk', 'skim milk', 'low fat milk',
  'yogurt', 'plain yogurt', 'greek yogurt', 'low fat yogurt',
  'cheese', 'cheddar', 'mozzarella', 'feta', 'cottage cheese',
  'cream', 'sour cream',
  'kefir',
  'almond milk',
  'soy milk', 'soymilk',
  'egg', 'eggs', 'omelette', 'scrambled eggs', 'fried eggs',

  // Meat & Fish (GI = 0, no carbs)
  'chicken', 'chicken breast', 'grilled chicken', 'roast chicken',
  'turkey', 'turkey breast',
  'beef', 'steak', 'ground beef', 'lean beef',
  'pork', 'pork chop', 'lean pork',
  'lamb', 'veal',
  'salmon', 'tuna', 'tilapia', 'cod', 'halibut',
  'shrimp', 'prawns', 'lobster', 'crab', 'oysters', 'mussels',
  'fish', 'grilled fish', 'baked fish',
  'sausage', 'ham',

  // Oils & Fats
  'olive oil', 'coconut oil', 'avocado oil', 'butter',
  'vegetable oil', 'canola oil',

  // Beverages
  'water', 'sparkling water',
  'coffee', 'black coffee',
  'tea', 'green tea', 'herbal tea',
  'orange juice', 'apple juice', 'grapefruit juice',
  'coconut water', 'coconut milk',
  'unsweetened almond milk',

  // Sweets (low)
  'dark chocolate', 'dark chocolate 70%', 'dark chocolate 85%',
  'sugar free chocolate',

  // Sauces & Condiments
  'tomato sauce', 'marinara', 'pesto',
  'soy sauce', 'hot sauce',
  'vinegar', 'balsamic vinegar',
  'dijon mustard', 'mustard',
  'olive', 'olives',

  // Soups
  'lentil soup', 'vegetable soup', 'tomato soup', 'chicken soup',
  'minestrone', 'gazpacho',
]

export function getFoodGILevel(foodName: string): GILevel | null {
  const name = foodName.toLowerCase().trim()

  // Check HIGH first (most specific matches win)
  if (HIGH_GI_FOODS.some(f => name.includes(f) || f.includes(name))) return 'high'
  if (MEDIUM_GI_FOODS.some(f => name.includes(f) || f.includes(name))) return 'medium'
  if (LOW_GI_FOODS.some(f => name.includes(f) || f.includes(name))) return 'low'

  // Fallback pattern matching
  if (name.includes('fried') || name.includes('deep fried')) return 'high'
  if (name.includes('instant')) return 'high'
  if (name.includes('white rice') || name.includes('steamed rice')) return 'high'
  if (name.includes('berry') || name.includes('berries')) return 'low'
  if (name.includes('salad')) return 'low'
  if (name.includes('grilled') || name.includes('steamed') || name.includes('roasted')) return 'low'
  if (name.includes('whole grain') || name.includes('whole wheat')) return 'low'
  if (name.includes('chips') || name.includes('fries')) return 'high'
  if (name.includes('cake') || name.includes('cookie') || name.includes('pastry')) return 'high'
  if (name.includes('juice') || name.includes('smoothie')) return 'medium'

  return null
}

// Keep backward compatibility
export const getFruitGILevel = getFoodGILevel
export type { GILevel as GlycemicLevel }
