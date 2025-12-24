import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppDispatch, useAppSelector } from '../store'
import { setRecipes, setLoading } from '../store/recipesSlice'
import type { SharedRecipe } from '../types'
import SearchBar from '../components/recipes/SearchBar'
import RecipeList from '../components/recipes/RecipeList'

export default function MyRecipesPage() {
  const dispatch = useAppDispatch()
  const { items, loading, searchQuery } = useAppSelector((state) => state.recipes)

  useEffect(() => {
    dispatch(setLoading(true))

    const recipesQuery = query(
      collection(db, 'sharedRecipes'),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(recipesQuery, (snapshot) => {
      const recipes: SharedRecipe[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as SharedRecipe[]

      dispatch(setRecipes(recipes))
    })

    return () => unsubscribe()
  }, [dispatch])

  // Filter recipes by search query
  const filteredRecipes = items.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SharedPlate</h1>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Recipe List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <RecipeList recipes={filteredRecipes} />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No recipes match your search
        </div>
      )}

      {/* Floating Add Button */}
      <Link
        to="/new"
        className="fixed bottom-24 right-4 w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📖</div>
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recipes yet!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Create your first recipe or browse the library to get started.
      </p>
      <Link
        to="/library"
        className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
      >
        Browse Library →
      </Link>
    </div>
  )
}
