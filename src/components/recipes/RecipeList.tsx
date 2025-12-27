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
    e.preventDefault() // Prevent navigation when clicking favorite
    e.stopPropagation()

    try {
      await updateDoc(doc(db, 'sharedRecipes', recipe.id), {
        isFavorite: !recipe.isFavorite
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  return (
    <div className="space-y-3">
      {recipes.map((recipe) => {
        const blockedIngredients = blockedRecipesMap.get(recipe.id)
        const isBlocked = !!blockedIngredients

        return (
          <Link
            key={recipe.id}
            to={`/recipe/${recipe.id}`}
            className={`block bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow relative ${
              isBlocked
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-100 dark:border-gray-700'
            }`}
          >
            {/* Warning Badge */}
            {isBlocked && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{recipe.title}</h3>
                {/* Recipe meta info */}
                <div className="flex items-center gap-3 mt-1">
                  {(recipe.prepTime || recipe.cookTime) && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                    </span>
                  )}
                  {recipe.difficulty && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      recipe.difficulty === 'easy'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : recipe.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  )}
                  {/* Author */}
                  {recipe.createdBy && getMemberName(recipe.createdBy) && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {getMemberName(recipe.createdBy)}
                    </span>
                  )}
                </div>
                {/* Blocked Ingredients Warning */}
                {isBlocked && (
                  <div className="mt-2 pt-2 border-t border-red-100 dark:border-red-900">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Contains: {blockedIngredients.slice(0, 2).join(', ')}
                      {blockedIngredients.length > 2 && ` +${blockedIngredients.length - 2}`}
                    </p>
                  </div>
                )}
              </div>
              {/* Favorite button */}
              <button
                onClick={(e) => toggleFavorite(e, recipe)}
                className="p-2 -mr-2 -mt-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
          </Link>
        )
      })}
    </div>
  )
}
