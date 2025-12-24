import { useState } from 'react'

interface RecipeFormProps {
  initialData?: {
    title: string
    ingredients: string
    steps: string
    notes: string
  }
  onSave: (data: { title: string; ingredients: string; steps: string; notes: string }) => void
  saving: boolean
  isEdit?: boolean
}

export default function RecipeForm({ initialData, onSave, saving, isEdit }: RecipeFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [ingredients, setIngredients] = useState(initialData?.ingredients || '')
  const [steps, setSteps] = useState(initialData?.steps || '')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, ingredients, steps, notes })
  }

  const isValid = title.trim() && ingredients.trim() && steps.trim()

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Recipe name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ingredients <span className="text-red-500">*</span>
        </label>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter each ingredient on a new line..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none min-h-[150px] resize-y"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Steps <span className="text-red-500">*</span>
        </label>
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="Enter each step on a new line..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none min-h-[200px] resize-y"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tips, variations, etc."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none min-h-[100px] resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || saving}
        className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Recipe'}
      </button>
    </form>
  )
}
