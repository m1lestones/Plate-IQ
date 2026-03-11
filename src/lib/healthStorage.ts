import type { HealthProfile, JournalEntry, MealData } from '../types'

const PROFILE_KEY = 'plateiq_health_profile'
const JOURNAL_KEY = 'plateiq_journal'

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
