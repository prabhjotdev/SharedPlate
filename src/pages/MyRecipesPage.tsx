import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppDispatch, useAppSelector } from '../store'
import { setRecipes, setLoading } from '../store/recipesSlice'
import type { SharedRecipe } from '../types'
import SearchBar from '../components/recipes/SearchBar'
import RecipeList from '../components/recipes/RecipeList'
import PullToRefresh from '../components/ui/PullToRefresh'

export default function MyRecipesPage() {
  const dispatch = useAppDispatch()
  const { items, loading, searchQuery } = useAppSelector((state) => state.recipes)
  const { household } = useAppSelector((state) => state.household)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!household?.id) {
      dispatch(setRecipes([]))
      return
    }

    dispatch(setLoading(true))

    const recipesQuery = query(
      collection(db, 'sharedRecipes'),
      where('householdId', '==', household.id),
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
  }, [dispatch, household?.id])

  // Filter recipes by search query
  const filteredRecipes = items.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefresh = useCallback(async () => {
    if (!household?.id) return
    setRefreshing(true)
    try {
      const recipesQuery = query(
        collection(db, 'sharedRecipes'),
        where('householdId', '==', household.id),
        orderBy('updatedAt', 'desc')
      )
      const snapshot = await getDocs(recipesQuery)
      const recipes: SharedRecipe[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as SharedRecipe[]
      dispatch(setRecipes(recipes))
    } finally {
      setRefreshing(false)
    }
  }, [dispatch, household?.id])

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SharedPlate</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 disabled:opacity-50"
            title="Refresh"
          >
            <svg
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
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
    </PullToRefresh>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No recipes yet</h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-xs">
        Start building your family cookbook! Add your own recipes or find inspiration in the library.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/new"
          className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Recipe
        </Link>
        <Link
          to="/library"
          className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Browse Library
        </Link>
      </div>
    </div>
  )
}
