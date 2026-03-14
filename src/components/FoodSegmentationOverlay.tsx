import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { FoodItem } from '../types'
import { reportPositionCorrection } from '../lib/feedbackCollector'

interface FoodSegmentationOverlayProps {
  imageUrl: string
  foods: FoodItem[]
  onEditFood: (food: FoodItem, index: number) => void
  onAddFood: () => void
  hasEdits: boolean
  onSaveCorrections: () => void
}

// Color palette for food highlighting
const FOOD_COLORS = [
  { bg: 'rgba(34, 197, 94, 0.3)', border: '#22c55e', text: '#dcfce7' },   // Green
  { bg: 'rgba(59, 130, 246, 0.3)', border: '#3b82f6', text: '#dbeafe' },  // Blue
  { bg: 'rgba(251, 146, 60, 0.3)', border: '#fb923c', text: '#fed7aa' },  // Orange
  { bg: 'rgba(236, 72, 153, 0.3)', border: '#ec4899', text: '#fce7f3' },  // Pink
  { bg: 'rgba(168, 85, 247, 0.3)', border: '#a855f7', text: '#f3e8ff' },  // Purple
  { bg: 'rgba(234, 179, 8, 0.3)', border: '#eab308', text: '#fef9c3' },   // Yellow
  { bg: 'rgba(20, 184, 166, 0.3)', border: '#14b8a6', text: '#ccfbf1' },  // Teal
  { bg: 'rgba(239, 68, 68, 0.3)', border: '#ef4444', text: '#fee2e2' },   // Red
]

// Default positions (used as fallback)
const DEFAULT_POSITIONS = [
  { x: 50, y: 40 },  // Center-top
  { x: 30, y: 55 },  // Left-center
  { x: 70, y: 55 },  // Right-center
  { x: 50, y: 70 },  // Center-bottom
  { x: 25, y: 30 },  // Top-left
  { x: 75, y: 30 },  // Top-right
  { x: 25, y: 75 },  // Bottom-left
  { x: 75, y: 75 },  // Bottom-right
]

// Position correction learning system
interface PositionCorrection {
  foodName: string
  x: number
  y: number
  timestamp: number
}

const savePositionCorrection = (foodName: string, x: number, y: number) => {
  const corrections: PositionCorrection[] = JSON.parse(
    localStorage.getItem('plateiq_position_corrections') || '[]'
  )

  corrections.push({
    foodName: foodName.toLowerCase(),
    x,
    y,
    timestamp: Date.now()
  })

  // Keep last 500 corrections
  const limited = corrections.slice(-500)
  localStorage.setItem('plateiq_position_corrections', JSON.stringify(limited))
}

// Get community-learned positions (from ALL users!)
const getCommunityPosition = async (foodName: string): Promise<{ x: number; y: number } | null> => {
  try {
    const response = await fetch('http://localhost:3001/api/community/positions')
    const communityData = await response.json() as Record<string, { x: number; y: number; confidence: number; sampleSize: number }>

    const normalized = foodName.toLowerCase().trim()

    // Direct match
    if (communityData[normalized]) {
      console.log(`🌍 Community wisdom: "${foodName}" at (${communityData[normalized].x}, ${communityData[normalized].y}) from ${communityData[normalized].sampleSize} users`)
      return { x: communityData[normalized].x, y: communityData[normalized].y }
    }

    // Fuzzy match
    for (const [key, value] of Object.entries(communityData)) {
      if (key.includes(normalized) || normalized.includes(key)) {
        console.log(`🌍 Community wisdom (fuzzy): "${foodName}" at (${value.x}, ${value.y}) from ${value.sampleSize} users`)
        return { x: value.x, y: value.y }
      }
    }
  } catch (err) {
    // Fallback to local if server unavailable
  }

  return null
}

const getPredictedPosition = (foodName: string): { x: number; y: number } | null => {
  const corrections: PositionCorrection[] = JSON.parse(
    localStorage.getItem('plateiq_position_corrections') || '[]'
  )

  // Find all corrections for this food (fuzzy match)
  const matches = corrections.filter(c =>
    c.foodName.includes(foodName.toLowerCase()) ||
    foodName.toLowerCase().includes(c.foodName)
  )

  if (matches.length === 0) return null

  // Average the positions (weighted by recency)
  const now = Date.now()
  const weighted = matches.map(m => ({
    ...m,
    weight: Math.exp(-(now - m.timestamp) / (1000 * 60 * 60 * 24 * 30)) // Decay over 30 days
  }))

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
  const avgX = weighted.reduce((sum, w) => sum + w.x * w.weight, 0) / totalWeight
  const avgY = weighted.reduce((sum, w) => sum + w.y * w.weight, 0) / totalWeight

  console.log(`👤 Personal prediction: "${foodName}" at (${Math.round(avgX)}, ${Math.round(avgY)})`)
  return { x: avgX, y: avgY }
}

export function FoodSegmentationOverlay({
  imageUrl,
  foods,
  onEditFood,
  onAddFood,
  hasEdits,
  onSaveCorrections,
}: FoodSegmentationOverlayProps) {
  const { t } = useTranslation()
  const [showOverlay, setShowOverlay] = useState(true)
  const [positions, setPositions] = useState<Record<number, { x: number; y: number }>>({})
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Initialize positions using COMMUNITY wisdom, then personal, then defaults
  useEffect(() => {
    const loadPositions = async () => {
      const initialPositions: Record<number, { x: number; y: number }> = {}

      for (let index = 0; index < foods.length; index++) {
        const food = foods[index]

        // Priority 1: Try community-learned position (from ALL users!)
        const communityPos = await getCommunityPosition(food.name)
        if (communityPos) {
          initialPositions[index] = communityPos
          continue
        }

        // Priority 2: Try personal learned position
        const personalPos = getPredictedPosition(food.name)
        if (personalPos) {
          initialPositions[index] = personalPos
          continue
        }

        // Priority 3: Use default circular positions
        initialPositions[index] = DEFAULT_POSITIONS[index % DEFAULT_POSITIONS.length]
      }

      setPositions(initialPositions)
    }

    loadPositions()
  }, [foods])

  // Handle drag events
  const handleDragStart = (index: number) => {
    setDraggingIndex(index)
  }

  const handleDrag = (e: React.MouseEvent, index: number) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Clamp within bounds
    const clampedX = Math.max(5, Math.min(95, x))
    const clampedY = Math.max(5, Math.min(95, y))

    setPositions(prev => ({
      ...prev,
      [index]: { x: clampedX, y: clampedY }
    }))
  }

  const handleDragEnd = async (index: number) => {
    setDraggingIndex(null)

    // Save this correction for future learning
    const position = positions[index]
    const defaultPos = DEFAULT_POSITIONS[index % DEFAULT_POSITIONS.length]

    if (position) {
      // Local learning (for this user)
      savePositionCorrection(foods[index].name, position.x, position.y)

      // Collective learning (helps ALL users!)
      await reportPositionCorrection(foods[index].name, defaultPos, position)

      console.log(`💡 Learned: "${foods[index].name}" is at (${Math.round(position.x)}, ${Math.round(position.y)})`)
      console.log('🌍 Your correction helps improve the app for everyone!')
    }
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setShowOverlay(!showOverlay)}
        className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showOverlay ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          )}
        </svg>
        {showOverlay ? t('foodSegmentation.toggleHide') : t('foodSegmentation.toggleShow')} {t('foodSegmentation.labels')}
      </button>

      {/* Drag Hint */}
      {showOverlay && (
        <div className="absolute top-16 right-4 z-20 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-100 text-xs max-w-xs backdrop-blur-sm">
          💡 <strong>Tip:</strong> Drag labels to correct positions. The app learns from your corrections!
        </div>
      )}

      {/* Main Image Container */}
      <div className="relative w-full max-w-2xl mx-auto">
        <img
          ref={imageRef}
          src={imageUrl}
          alt={t('foodSegmentation.altText')}
          className="w-full rounded-xl"
        />

        {/* Overlay Layer */}
        {showOverlay && (
          <div className="absolute inset-0">
            {/* Food Labels & Pointers */}
            {foods.map((food, index) => {
              const color = FOOD_COLORS[index % FOOD_COLORS.length]
              const position = positions[index] || DEFAULT_POSITIONS[index % DEFAULT_POSITIONS.length]
              const isDragging = draggingIndex === index

              return (
                <div
                  key={index}
                  className="absolute cursor-move"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isDragging ? 100 : 10
                  }}
                  onMouseDown={() => handleDragStart(index)}
                  onMouseMove={(e) => isDragging && handleDrag(e, index)}
                  onMouseUp={() => handleDragEnd(index)}
                  onMouseLeave={() => draggingIndex === index && handleDragEnd(index)}
                >
                  {/* Pulse Animation */}
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      backgroundColor: color.border,
                      opacity: 0.3,
                      width: '80px',
                      height: '80px',
                      left: '-40px',
                      top: '-40px'
                    }}
                  />

                  {/* Center Dot */}
                  <div
                    className="w-3 h-3 rounded-full relative z-10"
                    style={{
                      backgroundColor: color.border,
                      boxShadow: `0 0 10px ${color.border}`
                    }}
                  />

                  {/* Food Label */}
                  <div
                    className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-semibold whitespace-nowrap shadow-lg"
                    style={{
                      backgroundColor: color.bg,
                      border: `2px solid ${color.border}`,
                      color: color.text
                    }}
                  >
                    {food.name}
                  </div>

                  {/* Portion Info */}
                  <div
                    className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded backdrop-blur-md text-xs whitespace-nowrap"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: color.text
                    }}
                  >
                    {food.estimated_grams}g
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detected Foods Legend */}
      <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {t('foodSegmentation.detectedFoods')}
          </h4>
          <div className="flex gap-2">
            <button
              onClick={onAddFood}
              className="px-3 py-1.5 rounded-lg border border-green-500/50 text-green-400 hover:bg-green-500/10 text-xs font-semibold transition-all flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('foodSegmentation.addFood')}
            </button>
            {hasEdits && (
              <button
                onClick={onSaveCorrections}
                className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-xs font-semibold transition-all flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('foodSegmentation.save')}
              </button>
            )}
          </div>
        </div>

        {/* Food Items */}
        <div className="flex flex-wrap gap-2">
          {foods.map((food, index) => {
            const color = FOOD_COLORS[index % FOOD_COLORS.length]

            return (
              <div
                key={index}
                className="inline-flex items-center gap-2 p-3 rounded-lg"
                style={{ backgroundColor: color.bg, border: `1px solid ${color.border}30` }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color.border }}
                />
                <div>
                  <p className="text-sm font-medium text-white">{food.name}</p>
                  <p className="text-xs text-white/60">
                    {food.estimated_grams}g • {Math.round((food.nutrients.calories * food.estimated_grams) / 100)} {t('foodSegmentation.caloriesShort')}
                  </p>
                </div>
                <button
                  onClick={() => onEditFood(food, index)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                >
                  {t('foodSegmentation.details')}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* NYU Attribution */}
      <div className="mt-3 text-center">
        <p className="text-xs text-white/40">
          {t('foodSegmentation.attribution')}
        </p>
      </div>
    </div>
  )
}
