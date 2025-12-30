import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAppSelector } from '../../store'
import { useDietaryFilters } from '../../hooks/useDietaryFilters'
import type { SharedRecipe } from '../../types'

interface RecipeListProps {
  recipes: SharedRecipe[]
}

export default function RecipeList({ recipes }: RecipeListProps) {
  const { household } = useAppSelector((state) => state.household)
  const { activeFilter, getBlockedIngredientsInRecipe } = useDietaryFilters()

  // Build a map of recipe IDs to their blocked ingredients
  const blockedRecipesMap = useMemo(() => {
    if (!activeFilter) return new Map<string, string[]>()
    const map = new Map<string, string[]>()
    recipes.forEach((recipe) => {
      const blocked = getBlockedIngredientsInRecipe(recipe.ingredients)
      if (blocked.length > 0) {
        map.set(recipe.id, blocked)
      }
    })
    return map
  }, [activeFilter, recipes, getBlockedIngredientsInRecipe])

  // Helper to get member name from uid
  const getMemberName = (uid: string): string | null => {
    if (!household?.members) return null
    const member = household.members.find(m => m.uid === uid)
    return member?.displayName || member?.email?.split('@')[0] || null
  }

  const toggleFavorite = async (e: React.MouseEvent, recipe: SharedRecipe) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await updateDoc(doc(db, 'sharedRecipes', recipe.id), {
        isFavorite: !recipe.isFavorite
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  // Get category icon based on recipe category
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'breakfast':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      case 'lunch':
      case 'dinner':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'desserts':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-3" role="list" aria-label="Recipe list">
      {recipes.map((recipe, index) => {
        const blockedIngredients = blockedRecipesMap.get(recipe.id)
        const isBlocked = !!blockedIngredients
        // Apply stagger animation to first 7 items
        const staggerClass = index < 7 ? `animate-stagger-${index + 1}` : ''

        return (
          <Link
            key={recipe.id}
            to={`/recipe/${recipe.id}`}
            role="listitem"
            aria-label={`${recipe.title}${isBlocked ? ', contains dietary restrictions' : ''}`}
            className={`block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border hover:shadow-md transition-all active:scale-[0.99] ${staggerClass} ${
              isBlocked
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-100 dark:border-gray-700'
            }`}
          >
            <div className="flex min-h-[100px]">
              {/* Image Placeholder */}
              <div className={`w-24 flex-shrink-0 rounded-l-2xl flex items-center justify-center ${
                isBlocked
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-400'
                  : 'bg-primary-50 dark:bg-primary-900/30 text-primary-400 dark:text-primary-500'
              }`}>
                {getCategoryIcon(recipe.category)}
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-2 leading-tight">
                      {recipe.title}
                    </h3>
                    {/* Favorite button */}
                    <button
                      onClick={(e) => toggleFavorite(e, recipe)}
                      className="p-2 -mr-2 -mt-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {recipe.isFavorite ? (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Blocked warning inline */}
                  {isBlocked && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                      </svg>
                      Contains: {blockedIngredients.slice(0, 2).join(', ')}
                      {blockedIngredients.length > 2 && ` +${blockedIngredients.length - 2}`}
                    </p>
                  )}
                </div>

                {/* Meta info row */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {(recipe.prepTime || recipe.cookTime) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                    </span>
                  )}
                  {recipe.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      recipe.difficulty === 'easy'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : recipe.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  )}
                  {recipe.createdBy && getMemberName(recipe.createdBy) && (
                    <span className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {getMemberName(recipe.createdBy)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
