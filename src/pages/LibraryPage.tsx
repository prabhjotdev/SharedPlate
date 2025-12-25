import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppDispatch, useAppSelector } from '../store'
import { setLibraryRecipes, setLoading, setSelectedCategory } from '../store/librarySlice'
import type { LibraryRecipe, Category, Difficulty } from '../types'
import CategoryTabs from '../components/library/CategoryTabs'
import RecipeGrid from '../components/library/RecipeGrid'

type TimeFilter = 'all' | 'quick' | 'medium' | 'long'
type SortOption = 'name-asc' | 'name-desc' | 'time-asc' | 'time-desc'

const categories: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'quick-meals', label: 'Quick Meals' },
]

const DIFFICULTY_OPTIONS: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'Any time' },
  { value: 'quick', label: '<15 min' },
  { value: 'medium', label: '15-30 min' },
  { value: 'long', label: '>30 min' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'time-asc', label: 'Quickest first' },
  { value: 'time-desc', label: 'Longest first' },
]

export default function LibraryPage() {
  const dispatch = useAppDispatch()
  const { items, loading, selectedCategory } = useAppSelector((state) => state.library)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')

  useEffect(() => {
    const fetchLibrary = async () => {
      dispatch(setLoading(true))
      try {
        const snapshot = await getDocs(collection(db, 'libraryRecipes'))
        const recipes: LibraryRecipe[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LibraryRecipe[]

        dispatch(setLibraryRecipes(recipes))
      } catch (error) {
        console.error('Error fetching library:', error)
      }
    }

    if (items.length === 0) {
      fetchLibrary()
    }
  }, [dispatch, items.length])

  const handleCategoryChange = (category: Category | 'all') => {
    dispatch(setSelectedCategory(category))
  }

  const hasActiveFilters = difficultyFilter !== 'all' || timeFilter !== 'all'

  const clearFilters = () => {
    setDifficultyFilter('all')
    setTimeFilter('all')
  }

  // Filter and sort recipes
  const filteredRecipes = items
    .filter((recipe) => {
      // Category filter
      if (selectedCategory !== 'all' && recipe.category !== selectedCategory) {
        return false
      }

      // Search filter
      if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Difficulty filter
      if (difficultyFilter !== 'all' && recipe.difficulty !== difficultyFilter) {
        return false
      }

      // Time filter
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
        case 'name-asc':
          return a.title.localeCompare(b.title)
        case 'name-desc':
          return b.title.localeCompare(a.title)
        case 'time-asc':
          return ((a.prepTime || 0) + (a.cookTime || 0)) - ((b.prepTime || 0) + (b.cookTime || 0))
        case 'time-desc':
          return ((b.prepTime || 0) + (b.cookTime || 0)) - ((a.prepTime || 0) + (a.cookTime || 0))
        default:
          return 0
      }
    })

  return (
    <div className="pt-6">
      {/* Header */}
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipe Library</h1>
      </div>

      {/* Search and Filter Toggle */}
      <div className="px-4 mb-4">
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 rounded-xl border transition-colors flex items-center justify-center ${
              hasActiveFilters
                ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters & Sort</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Sort */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                  Difficulty
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDifficultyFilter(option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        difficultyFilter === option.value
                          ? option.value === 'easy'
                            ? 'bg-green-500 text-white'
                            : option.value === 'medium'
                            ? 'bg-yellow-500 text-white'
                            : option.value === 'hard'
                            ? 'bg-red-500 text-white'
                            : 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                  Total Time
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeFilter(option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        timeFilter === option.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Badge */}
        {hasActiveFilters && !showFilters && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
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
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onChange={handleCategoryChange}
      />

      {/* Results Count */}
      {!loading && (
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Recipe Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <RecipeGrid recipes={filteredRecipes} />
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 px-4">
          <p>No recipes match your search</p>
          {(hasActiveFilters || searchQuery) && (
            <button
              onClick={() => {
                clearFilters()
                setSearchQuery('')
              }}
              className="mt-2 text-orange-500 hover:text-orange-600 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
