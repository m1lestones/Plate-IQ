import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FoodItem } from '../types'
import { reportFoodCorrection } from '../lib/feedbackCollector'

interface EditFoodModalProps {
  food: FoodItem
  index: number
  originalGrams?: number
  portionSize?: 'S' | 'M' | 'L'
  onSave: (index: number, updatedFood: FoodItem, portionSize?: 'S' | 'M' | 'L') => void
  onDelete: (index: number) => void
  onClose: () => void
}

export function EditFoodModal({ food, index, originalGrams, portionSize, onSave, onDelete, onClose }: EditFoodModalProps) {
  const { t } = useTranslation()
  const [editedFood, setEditedFood] = useState<FoodItem>(food)
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | null>(portionSize || null)

  const baseGrams = originalGrams || food.estimated_grams

  const applyPortionSize = (size: 'S' | 'M' | 'L') => {
    const grams = size === 'S' ? Math.round(baseGrams * 0.7) : size === 'L' ? Math.round(baseGrams * 1.3) : baseGrams
    setEditedFood({ ...editedFood, estimated_grams: grams })
    setSelectedSize(size)
  }

  const handleSave = async () => {
    // Report correction for collective learning (helps ALL users!)
    if (JSON.stringify(food) !== JSON.stringify(editedFood)) {
      await reportFoodCorrection(food, editedFood)
      console.log('🌍 Your correction helps improve the app for everyone!')
    }

    // Clear accuracy when user manually edits — it's no longer an AI reading
    onSave(index, { ...editedFood, confidence: undefined }, selectedSize || undefined)
    onClose()
  }

  const handleDelete = () => {
    if (confirm(t('editFoodModal.confirmDelete', { name: food.name }))) {
      onDelete(index)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{t('editFoodModal.title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Food Name */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">{t('editFoodModal.foodName')}</label>
            <input
              type="text"
              value={editedFood.name}
              onChange={(e) => setEditedFood({ ...editedFood, name: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-green-500 focus:outline-none"
              placeholder={t('editFoodModal.foodNamePlaceholder')}
            />
          </div>

          {/* Portion Size */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">{t('editFoodModal.portionSize')}</label>
            {/* S/M/L quick select */}
            {originalGrams && (
              <div className="flex gap-2 mb-2">
                {(['S', 'M', 'L'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => applyPortionSize(size)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedSize === size
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
            <input
              type="number"
              value={editedFood.estimated_grams}
              onChange={(e) => { setEditedFood({ ...editedFood, estimated_grams: parseInt(e.target.value) || 0 }); setSelectedSize(null) }}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-green-500 focus:outline-none"
              min="0"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">{t('editFoodModal.category')}</label>
            <select
              value={editedFood.category}
              onChange={(e) => setEditedFood({ ...editedFood, category: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-green-500 focus:outline-none"
            >
              <option value="protein">{t('editFoodModal.categories.protein')}</option>
              <option value="carb">{t('editFoodModal.categories.carb')}</option>
              <option value="vegetable">{t('editFoodModal.categories.vegetable')}</option>
              <option value="fruit">{t('editFoodModal.categories.fruit')}</option>
              <option value="dairy">{t('editFoodModal.categories.dairy')}</option>
              <option value="fat">{t('editFoodModal.categories.fat')}</option>
              <option value="other">{t('editFoodModal.categories.other')}</option>
            </select>
          </div>

          {/* Processing Level */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">{t('editFoodModal.processingLevel')}</label>
            <select
              value={editedFood.nova_level}
              onChange={(e) => setEditedFood({ ...editedFood, nova_level: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-green-500 focus:outline-none"
            >
              <option value={1}>{t('editFoodModal.processingLevels.1')}</option>
              <option value={2}>{t('editFoodModal.processingLevels.2')}</option>
              <option value={3}>{t('editFoodModal.processingLevels.3')}</option>
              <option value={4}>{t('editFoodModal.processingLevels.4')}</option>
            </select>
          </div>

          {/* AI Accuracy */}
          {food.confidence !== undefined && (
            <div className={`rounded-lg p-3 border ${
              food.confidence >= 0.85 ? 'bg-green-50 border-green-200' :
              food.confidence >= 0.6  ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-red-50 border-red-200'
            }`}>
              <p className="text-xs text-slate-500 mb-1">AI Accuracy</p>
              <p className={`text-lg font-bold ${
                food.confidence >= 0.85 ? 'text-green-600' :
                food.confidence >= 0.6  ? 'text-yellow-600' :
                                          'text-red-600'
              }`}>
                {Math.round(food.confidence * 100)}%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Editing this item will remove the accuracy reading</p>
            </div>
          )}

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600">
              {t('editFoodModal.infoNote')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition-all"
          >
            {t('editFoodModal.delete')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-all"
          >
            {t('editFoodModal.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold transition-all"
          >
            {t('editFoodModal.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  )
}
