import { useParams, useNavigate, Link } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import { useAppSelector, useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'
import { useState } from 'react'
import { DEFAULT_SERVINGS } from '../utils/servingScaler'

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
        servings: recipe.servings || DEFAULT_SERVINGS,
        prepTime: recipe.prepTime || null,
        cookTime: recipe.cookTime || null,
        difficulty: recipe.difficulty || null,
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

        {/* Recipe Meta Info */}
        {(recipe.prepTime || recipe.cookTime || recipe.difficulty) && (
          <div className="flex flex-wrap gap-4 mt-4">
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
            {recipe.difficulty && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  recipe.difficulty === 'easy'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : recipe.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </span>
            )}
          </div>
        )}

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
