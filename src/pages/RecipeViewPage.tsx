import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import { useAppSelector, useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'
import { scaleIngredients, DEFAULT_SERVINGS } from '../utils/servingScaler'

export default function RecipeViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.recipes)
  const { household } = useAppSelector((state) => state.household)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [servings, setServings] = useState(DEFAULT_SERVINGS)

  const recipe = items.find((r) => r.id === id)
  const originalServings = recipe?.servings || DEFAULT_SERVINGS

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Recipe not found</p>
        <Link to="/" className="text-orange-500 font-medium">
          Go back
        </Link>
      </div>
    )
  }

  const scaledIngredients = scaleIngredients(recipe.ingredients, originalServings, servings)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'sharedRecipes', recipe.id))
      dispatch(showToast({ message: 'Recipe deleted', type: 'success' }))
      navigate('/', { replace: true })
    } catch (error) {
      dispatch(showToast({ message: 'Failed to delete recipe', type: 'error' }))
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const decreaseServings = () => {
    if (servings > 1) setServings(servings - 1)
  }

  const increaseServings = () => {
    if (servings < 20) setServings(servings + 1)
  }

  const handleDuplicate = async () => {
    if (!recipe || !household?.id) return
    setDuplicating(true)
    try {
      const docRef = await addDoc(collection(db, 'sharedRecipes'), {
        title: `${recipe.title} (Copy)`,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        notes: recipe.notes || '',
        servings: recipe.servings || DEFAULT_SERVINGS,
        prepTime: recipe.prepTime || null,
        cookTime: recipe.cookTime || null,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        copiedFromLibrary: null,
        householdId: household.id,
      })
      dispatch(showToast({ message: 'Recipe duplicated!', type: 'success' }))
      navigate(`/recipe/${docRef.id}`)
    } catch (error) {
      dispatch(showToast({ message: 'Failed to duplicate recipe', type: 'error' }))
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex gap-1">
          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="p-2 disabled:opacity-50"
            title="Duplicate recipe"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <Link to={`/recipe/${recipe.id}/edit`} className="p-2" title="Edit recipe">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
          <button onClick={() => setShowDeleteModal(true)} className="p-2" title="Delete recipe">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{recipe.title}</h1>

        {/* Time Info */}
        {(recipe.prepTime || recipe.cookTime) && (
          <div className="flex gap-4 mb-4">
            {recipe.prepTime && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  <span className="font-medium">Prep:</span> {recipe.prepTime} min
                </span>
              </div>
            )}
            {recipe.cookTime && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                <span className="text-sm">
                  <span className="font-medium">Cook:</span> {recipe.cookTime} min
                </span>
              </div>
            )}
            {recipe.prepTime && recipe.cookTime && (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <span className="text-sm font-medium">
                  Total: {recipe.prepTime + recipe.cookTime} min
                </span>
              </div>
            )}
          </div>
        )}

        {/* Serving Size Selector */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Servings:</span>
          <div className="flex items-center gap-3">
            <button
              onClick={decreaseServings}
              disabled={servings <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-8 text-center text-lg font-semibold text-gray-900 dark:text-white">
              {servings}
            </span>
            <button
              onClick={increaseServings}
              disabled={servings >= 20}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          {servings !== originalServings && (
            <button
              onClick={() => setServings(originalServings)}
              className="text-xs text-orange-600 dark:text-orange-400 underline ml-auto"
            >
              Reset
            </button>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
              Ingredients
            </h2>
            {servings !== originalServings && (
              <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                Scaled for {servings}
              </span>
            )}
          </div>
          <div className="text-lg leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">{scaledIngredients}</div>
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase mb-3">
            Steps
          </h2>
          <div className="text-lg leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">{recipe.steps}</div>
        </section>

        {recipe.notes && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase mb-3">
                Notes
              </h2>
              <div className="text-lg leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">{recipe.notes}</div>
            </section>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Recipe?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{recipe.title}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
