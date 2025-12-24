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
  const [adding, setAdding] = useState(false)

  const recipe = items.find((r) => r.id === id)

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
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{recipe.title}</h1>

        <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
          {categoryLabels[recipe.category] || recipe.category}
        </span>

        <div className="border-t border-gray-200 my-6"></div>

        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-3">
            Ingredients
          </h2>
          <div className="text-lg leading-relaxed whitespace-pre-line">{recipe.ingredients}</div>
        </section>

        <div className="border-t border-gray-200 my-6"></div>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-3">
            Steps
          </h2>
          <div className="text-lg leading-relaxed whitespace-pre-line">{recipe.steps}</div>
        </section>
      </div>

      {/* Sticky Add Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-4 border-t border-gray-700">
        <button
          onClick={handleAddToMyRecipes}
          disabled={adding}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>{adding ? 'Adding...' : '+ Add to My Recipes'}</span>
        </button>
      </div>
    </div>
  )
}
