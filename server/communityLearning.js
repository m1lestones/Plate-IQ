/**
 * Community Learning Aggregator
 * Processes feedback from ALL users to generate collective wisdom
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Aggregate position corrections from all users
 * Returns average positions for each food
 */
export async function getAggregatedPositions() {
  const feedbackDir = path.join(__dirname, 'feedback')

  try {
    const files = await fs.readdir(feedbackDir)
    const positionCorrections = []

    // Read all position correction files
    for (const file of files) {
      if (file.startsWith('position_correction_')) {
        const content = await fs.readFile(path.join(feedbackDir, file), 'utf-8')
        const data = JSON.parse(content)
        positionCorrections.push(data.data)
      }
    }

    // Group by food name (case-insensitive, fuzzy match)
    const foodPositions = {}

    positionCorrections.forEach(correction => {
      const foodName = correction.foodName.toLowerCase().trim()

      if (!foodPositions[foodName]) {
        foodPositions[foodName] = []
      }

      foodPositions[foodName].push({
        x: correction.correctedPosition.x,
        y: correction.correctedPosition.y,
        timestamp: correction.timestamp
      })
    })

    // Calculate weighted averages (recent corrections weighted more)
    const aggregated = {}
    const now = Date.now()

    Object.keys(foodPositions).forEach(foodName => {
      const positions = foodPositions[foodName]

      // Weight by recency (exponential decay over 30 days)
      const weighted = positions.map(p => ({
        ...p,
        weight: Math.exp(-(now - p.timestamp) / (1000 * 60 * 60 * 24 * 30))
      }))

      const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)

      if (totalWeight > 0) {
        const avgX = weighted.reduce((sum, w) => sum + w.x * w.weight, 0) / totalWeight
        const avgY = weighted.reduce((sum, w) => sum + w.y * w.weight, 0) / totalWeight

        aggregated[foodName] = {
          x: Math.round(avgX * 100) / 100,
          y: Math.round(avgY * 100) / 100,
          confidence: Math.min(positions.length / 10, 1), // More corrections = higher confidence
          sampleSize: positions.length
        }
      }
    })

    return aggregated
  } catch (err) {
    console.error('Error aggregating positions:', err)
    return {}
  }
}

/**
 * Aggregate food identification corrections
 * Returns common patterns of AI mistakes
 */
export async function getCommonFoodCorrections() {
  const feedbackDir = path.join(__dirname, 'feedback')

  try {
    const files = await fs.readdir(feedbackDir)
    const corrections = {}

    for (const file of files) {
      if (file.startsWith('food_correction_')) {
        const content = await fs.readFile(path.join(feedbackDir, file), 'utf-8')
        const data = JSON.parse(content)
        const { original, corrected } = data.data

        const key = `${original.name}→${corrected.name}`
        corrections[key] = (corrections[key] || 0) + 1
      }
    }

    // Sort by frequency
    return Object.entries(corrections)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50) // Top 50 corrections
      .map(([key, count]) => {
        const [original, corrected] = key.split('→')
        return { original, corrected, count }
      })
  } catch (err) {
    return []
  }
}

/**
 * Get portion adjustment patterns
 * E.g., "AI estimates chicken at 150g, users correct to avg 180g"
 */
export async function getPortionAdjustments() {
  const feedbackDir = path.join(__dirname, 'feedback')

  try {
    const files = await fs.readdir(feedbackDir)
    const adjustments = {}

    for (const file of files) {
      if (file.startsWith('food_correction_')) {
        const content = await fs.readFile(path.join(feedbackDir, file), 'utf-8')
        const data = JSON.parse(content)
        const { original, corrected } = data.data

        const foodName = corrected.name || original.name

        if (!adjustments[foodName]) {
          adjustments[foodName] = { corrections: [] }
        }

        adjustments[foodName].corrections.push({
          originalGrams: original.grams,
          correctedGrams: corrected.grams,
          ratio: corrected.grams / original.grams
        })
      }
    }

    // Calculate average adjustment ratio for each food
    const patterns = {}
    Object.keys(adjustments).forEach(foodName => {
      const corrections = adjustments[foodName].corrections
      const avgRatio = corrections.reduce((sum, c) => sum + c.ratio, 0) / corrections.length

      patterns[foodName] = {
        averageAdjustmentRatio: Math.round(avgRatio * 100) / 100,
        sampleSize: corrections.length,
        suggestion: avgRatio > 1.1 ? 'AI underestimates' : avgRatio < 0.9 ? 'AI overestimates' : 'Accurate'
      }
    })

    return patterns
  } catch (err) {
    return {}
  }
}
