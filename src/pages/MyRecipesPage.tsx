import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppDispatch, useAppSelector } from '../store'
import { setRecipes, setLoading } from '../store/recipesSlice'
import { useDietaryFilters } from '../hooks/useDietaryFilters'
import { useRecipeCategories, DEFAULT_RECIPE_CATEGORIES } from '../hooks/useRecipeCategories'
import type { SharedRecipe, Difficulty } from '../types'
import SearchBar from '../components/recipes/SearchBar'
import RecipeList from '../components/recipes/RecipeList'
import PullToRefresh from '../components/ui/PullToRefresh'
import RecipeFilters, { type TimeFilter, type SortOption } from '../components/recipes/RecipeFilters'
import CategoryTabs from '../components/library/CategoryTabs'

export default function MyRecipesPage() {
  const dispatch = useAppDispatch()
  const { items, loading, searchQuery } = useAppSelector((state) => state.recipes)
  const { household } = useAppSelector((state) => state.household)
  const { activeFilter, getBlockedIngredientsInRecipe } = useDietaryFilters()
  const { customCategories, addCategory, deleteCategory } = useRecipeCategories()
  const [refreshing, setRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Build categories list with custom categories
  const categoriesList = useMemo(() => {
    const list: { value: string; label: string; isCustom?: boolean }[] = [
      { value: 'all', label: 'All' },
      ...DEFAULT_RECIPE_CATEGORIES.map(c => ({ value: c.id, label: c.name })),
      ...customCategories.map(c => ({ value: c.id, label: c.name, isCustom: true })),
    ]
    return list
  }, [customCategories])

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

  // Filter recipes by search query, category, difficulty, time, and favorites
  const filteredRecipes = items
    .filter((recipe) => {
      // Search filter
      if (!recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (selectedCategory !== 'all' && recipe.category !== selectedCategory) {
        return false
      }

      // Favorites filter
      if (favoritesOnly && !recipe.isFavorite) {
        return false
      }

      // Difficulty filter
      if (difficultyFilter !== 'all' && recipe.difficulty !== difficultyFilter) {
        return false
      }

      // Time filter (total time = prepTime + cookTime)
      if (timeFilter !== 'all') {
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
        if (timeFilter === 'quick' && totalTime >= 15) return false
        if (timeFilter === 'medium' && (totalTime < 15 || totalTime > 30)) return false
        if (timeFilter === 'long' && totalTime <= 30) return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
        case 'oldest':
          return (a.updatedAt?.getTime() || 0) - (b.updatedAt?.getTime() || 0)
        case 'name-asc':
          return a.title.localeCompare(b.title)
        case 'name-desc':
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

  const hasActiveFilters = difficultyFilter !== 'all' || timeFilter !== 'all' || favoritesOnly || selectedCategory !== 'all'

  const clearFilters = () => {
    setDifficultyFilter('all')
    setTimeFilter('all')
    setFavoritesOnly(false)
    setSelectedCategory('all')
  }

  // Count favorites
  const favoritesCount = items.filter(r => r.isFavorite).length

  // Count blocked recipes for dietary filter
  const blockedRecipesCount = useMemo(() => {
    if (!activeFilter) return 0
    return items.filter(recipe => {
      const blocked = getBlockedIngredientsInRecipe(recipe.ingredients)
      return blocked.length > 0
    }).length
  }, [activeFilter, items, getBlockedIngredientsInRecipe])

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

      {/* Active Dietary Filter Banner */}
      {activeFilter && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full text-red-700 dark:text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{activeFilter.name}</span>
            {blockedRecipesCount > 0 && (
              <span className="text-red-500 dark:text-red-500">({blockedRecipesCount} flagged)</span>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categoriesList}
        selected={selectedCategory}
        onChange={setSelectedCategory}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
        showAddButton={true}
      />

      <div className="px-4">
      {/* Favorites Quick Filter */}
      {favoritesCount > 0 && (
        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`mb-4 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
            favoritesOnly
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <svg className={`w-4 h-4 ${favoritesOnly ? 'text-red-500' : ''}`} fill={favoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Favorites ({favoritesCount})
        </button>
      )}

      {/* Search and Filter Toggle */}
      <div className="flex items-stretch gap-2 mb-4">
        <div className="flex-1">
          <SearchBar />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 rounded-xl border transition-colors flex items-center justify-center ${
            hasActiveFilters && !favoritesOnly
              ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400'
              : 'bg-gray-100 dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                Clear all
              </button>
            )}
          </div>
          <RecipeFilters
            difficulty={difficultyFilter}
            timeFilter={timeFilter}
            sortBy={sortBy}
            onDifficultyChange={setDifficultyFilter}
            onTimeFilterChange={setTimeFilter}
            onSortChange={setSortBy}
          />
        </div>
      )}

      {/* Active Filters Badge */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Filtering by:</span>
          {difficultyFilter !== 'all' && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              difficultyFilter === 'easy'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : difficultyFilter === 'medium'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {difficultyFilter}
            </span>
          )}
          {timeFilter !== 'all' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              {timeFilter === 'quick' ? '<15 min' : timeFilter === 'medium' ? '15-30 min' : '>30 min'}
            </span>
          )}
          <button onClick={clearFilters} className="text-orange-500 hover:text-orange-600 ml-1">
            &times;
          </button>
        </div>
      )}

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
          <p>No recipes match your {hasActiveFilters ? 'filters' : 'search'}</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-orange-500 hover:text-orange-600 font-medium"
            >
              Clear filters
            </button>
          )}
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
