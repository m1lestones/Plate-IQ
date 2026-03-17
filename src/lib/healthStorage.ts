import type { HealthProfile, JournalEntry, MealData } from '../types'

const PROFILE_KEY = 'plateiq_health_profile'
const JOURNAL_KEY = 'plateiq_journal'
const LAST_SCAN_KEY = 'plateiq_last_scan'

export function getHealthProfile(): HealthProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveHealthProfile(profile: HealthProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function getJournal(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLastScan(meal: MealData): void {
  localStorage.setItem(LAST_SCAN_KEY, JSON.stringify(meal))
}

export function getLastScan(): MealData | null {
  try {
    const raw = localStorage.getItem(LAST_SCAN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAllData(): void {
  localStorage.removeItem(PROFILE_KEY)
  localStorage.removeItem(JOURNAL_KEY)
  localStorage.removeItem(LAST_SCAN_KEY)
}

export function saveMealToJournal(meal: MealData): void {
  const journal = getJournal()
  const entry: JournalEntry = {
    meal_id: meal.meal_id,
    timestamp: meal.timestamp,
    meal_type: meal.meal_type,
    estimated_calories_low: meal.estimated_calories_low,
    estimated_calories_high: meal.estimated_calories_high,
    verdict: meal.verdict,
    foods: meal.foods.map(f => ({ name: f.name, estimated_grams: f.estimated_grams })),
  }
  // Keep last 30 entries
  const updated = [entry, ...journal].slice(0, 30)
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated))
}
