import { useState } from 'react'
import type { FoodItem } from '../types'

interface EditFoodModalProps {
  food: FoodItem
  index: number
  onSave: (index: number, updatedFood: FoodItem) => void
  onDelete: (index: number) => void
  onClose: () => void
}

export function EditFoodModal({ food, index, onSave, onDelete, onClose }: EditFoodModalProps) {
  const [editedFood, setEditedFood] = useState<FoodItem>(food)

  const handleSave = () => {
    onSave(index, editedFood)
    onClose()
  }

  const handleDelete = () => {
    if (confirm(`Remove "${food.name}" from this meal?`)) {
      onDelete(index)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Food Item</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Food Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Food Name
            </label>
            <input
              type="text"
              value={editedFood.name}
              onChange={(e) => setEditedFood({ ...editedFood, name: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none"
              placeholder="e.g., Brown Rice"
            />
          </div>

          {/* Portion Size */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Portion Size (grams)
            </label>
            <input
              type="number"
              value={editedFood.estimated_grams}
              onChange={(e) => setEditedFood({ ...editedFood, estimated_grams: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none"
              min="0"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Category
            </label>
            <select
              value={editedFood.category}
              onChange={(e) => setEditedFood({ ...editedFood, category: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none"
            >
              <option value="protein">Protein</option>
              <option value="carb">Carbohydrate</option>
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="dairy">Dairy</option>
              <option value="fat">Fat/Oil</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* NOVA Level */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Processing Level (NOVA)
            </label>
            <select
              value={editedFood.nova_level}
              onChange={(e) => setEditedFood({ ...editedFood, nova_level: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none"
            >
              <option value={1}>1 - Unprocessed (fresh vegetables, plain meat)</option>
              <option value={2}>2 - Processed ingredients (oil, butter, salt)</option>
              <option value={3}>3 - Processed (canned, cheese, bread)</option>
              <option value={4}>4 - Ultra-processed (packaged snacks, fast food)</option>
            </select>
          </div>

          {/* Info Note */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-200">
              💡 Your corrections help improve accuracy. The app learns from your edits to provide better results over time.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-neutral-900 border-t border-white/10 p-6 flex gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
