import { useState, useMemo } from 'react'
import { DEFAULT_SERVINGS } from '../../utils/servingScaler'
import { useDietaryFilters } from '../../hooks/useDietaryFilters'
import type { Difficulty } from '../../types'

interface RecipeFormProps {
  initialData?: {
    title: string
    ingredients: string
    steps: string
    notes: string
    servings?: number
    prepTime?: number
    cookTime?: number
    difficulty?: Difficulty
  }
  onSave: (data: {
    title: string
    ingredients: string
    steps: string
    notes: string
    servings: number
    prepTime: number | null
    cookTime: number | null
    difficulty: Difficulty | null
  }) => void
  saving: boolean
  isEdit?: boolean
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700' },
]

export default function RecipeForm({ initialData, onSave, saving, isEdit }: RecipeFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [ingredients, setIngredients] = useState(initialData?.ingredients || '')
  const [steps, setSteps] = useState(initialData?.steps || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [servings, setServings] = useState(initialData?.servings || DEFAULT_SERVINGS)
  const [prepTime, setPrepTime] = useState<string>(initialData?.prepTime?.toString() || '')
  const [cookTime, setCookTime] = useState<string>(initialData?.cookTime?.toString() || '')
  const [difficulty, setDifficulty] = useState<Difficulty | null>(initialData?.difficulty || null)

  // Get dietary filter info
  const { activeFilter, getBlockedIngredientsInRecipe } = useDietaryFilters()

  // Check for blocked ingredients in real-time
  const blockedIngredientsFound = useMemo(() => {
    if (!activeFilter || !ingredients.trim()) return []
    return getBlockedIngredientsInRecipe(ingredients)
  }, [activeFilter, ingredients, getBlockedIngredientsInRecipe])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      ingredients,
      steps,
      notes,
      servings,
      prepTime: prepTime ? parseInt(prepTime) : null,
      cookTime: cookTime ? parseInt(cookTime) : null,
      difficulty,
    })
  }

  const isValid = title.trim() && ingredients.trim() && steps.trim() && servings > 0

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Recipe name"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Servings <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setServings(Math.max(1, servings - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            -
          </button>
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            min="1"
            max="20"
            className="w-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-lg font-semibold"
            required
          />
          <button
            type="button"
            onClick={() => setServings(Math.min(20, servings + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            +
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">people</span>
        </div>
      </div>

      {/* Prep & Cook Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prep Time <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full p-3 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
              mins
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cook Time <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full p-3 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
              mins
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Difficulty <span className="text-gray-400">(optional)</span>
        </label>
        <div className="flex gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDifficulty(difficulty === option.value ? null : option.value)}
              className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                difficulty === option.value
                  ? option.color
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ingredients <span className="text-red-500">*</span>
        </label>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter each ingredient on a new line..."
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none min-h-[150px] resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
            blockedIngredientsFound.length > 0
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          required
        />
        {/* Dietary Filter Warning */}
        {blockedIngredientsFound.length > 0 && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Dietary Filter Warning ({activeFilter?.name})
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Contains restricted ingredients: <span className="font-medium">{blockedIngredientsFound.join(', ')}</span>
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Active Filter Indicator */}
        {activeFilter && blockedIngredientsFound.length === 0 && ingredients.trim() && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No restricted ingredients detected
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Steps <span className="text-red-500">*</span>
        </label>
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="Enter each step on a new line..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none min-h-[200px] resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tips, variations, etc."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none min-h-[100px] resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
