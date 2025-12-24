import { useParams, useNavigate, Link } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import { useAppSelector, useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'
import { useState } from 'react'

export default function LibraryViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.library)
  const { items: myRecipes } = useAppSelector((state) => state.recipes)
  const { household } = useAppSelector((state) => state.household)
  const [adding, setAdding] = useState(false)

  const recipe = items.find((r) => r.id === id)

  // Check if this recipe has already been added to my recipes
  const alreadyAdded = myRecipes.some((r) => r.copiedFromLibrary === id)

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-gray-500 mb-4">Recipe not found</p>
        <Link to="/library" className="text-orange-500 font-medium">
          Go back
        </Link>
      </div>
    )
  }

  const handleAddToMyRecipes = async () => {
    if (alreadyAdded) {
      dispatch(showToast({ message: 'Recipe already in your list!', type: 'error' }))
      return
    }

    setAdding(true)
    try {
      await addDoc(collection(db, 'sharedRecipes'), {
        title: recipe.title,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        notes: '',
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        copiedFromLibrary: recipe.id,
        householdId: household?.id,
      })
      dispatch(showToast({ message: 'Recipe added to your list!', type: 'success' }))
      navigate('/')
    } catch (error) {
      dispatch(showToast({ message: 'Failed to add recipe', type: 'error' }))
    } finally {
      setAdding(false)
    }
  }

  const categoryLabels: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks',
    desserts: 'Desserts',
    vegetarian: 'Vegetarian',
    'quick-meals': 'Quick Meals',
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-28">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{recipe.title}</h1>

        <span className="inline-block bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
          {categoryLabels[recipe.category] || recipe.category}
        </span>

        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase mb-3">
            Ingredients
          </h2>
          <div className="text-lg leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">{recipe.ingredients}</div>
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase mb-3">
            Steps
          </h2>
          <div className="text-lg leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">{recipe.steps}</div>
        </section>
      </div>

      {/* Sticky Add Button */}
      <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        {alreadyAdded ? (
          <div className="w-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 py-4 rounded-xl font-semibold text-lg text-center flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Already in My Recipes</span>
          </div>
        ) : (
          <button
            onClick={handleAddToMyRecipes}
            disabled={adding}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{adding ? 'Adding...' : '+ Add to My Recipes'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
