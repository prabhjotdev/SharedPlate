import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppSelector, useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'

export default function RecipeViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.recipes)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const recipe = items.find((r) => r.id === id)

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex gap-2">
          <Link to={`/recipe/${recipe.id}/edit`} className="p-2">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
          <button onClick={() => setShowDeleteModal(true)} className="p-2">
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{recipe.title}</h1>

        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase mb-3">
            Ingredients
          </h2>
          <div className="text-lg leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">{recipe.ingredients}</div>
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
