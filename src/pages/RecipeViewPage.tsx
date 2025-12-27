import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, deleteDoc, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import { useAppSelector, useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'
import { updateRecipe } from '../store/recipesSlice'
import { scaleIngredients, DEFAULT_SERVINGS } from '../utils/servingScaler'
import { useWakeLock } from '../hooks/useWakeLock'
import { addRecipeIngredientsToShoppingList } from '../services/shoppingService'

export default function RecipeViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.recipes)
  const { household } = useAppSelector((state) => state.household)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [addingToShopping, setAddingToShopping] = useState(false)
  const [servings, setServings] = useState(DEFAULT_SERVINGS)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())

  // Cooking mode state
  const [cookingMode, setCookingMode] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showIngredientsSheet, setShowIngredientsSheet] = useState(false)

  // Wake lock for keeping screen on
  const { isSupported: wakeLockSupported, isActive: wakeLockActive, request: requestWakeLock, release: releaseWakeLock } = useWakeLock()

  // Manage wake lock based on cooking mode
  useEffect(() => {
    if (cookingMode && wakeLockSupported) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }
    return () => {
      releaseWakeLock()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookingMode])

  const recipe = items.find((r) => r.id === id)
  const originalServings = recipe?.servings || DEFAULT_SERVINGS

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

  const scaledIngredients = scaleIngredients(recipe.ingredients, originalServings, servings)

  // Parse ingredients and steps into arrays
  const ingredientsList = useMemo(() =>
    scaledIngredients.split('\n').filter(line => line.trim()),
    [scaledIngredients]
  )

  const stepsList = useMemo(() =>
    recipe.steps.split('\n').filter(line => line.trim()),
    [recipe.steps]
  )

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const clearAllChecks = () => {
    setCheckedIngredients(new Set())
    setCheckedSteps(new Set())
  }

  const allIngredientsChecked = checkedIngredients.size === ingredientsList.length && ingredientsList.length > 0
  const allStepsChecked = checkedSteps.size === stepsList.length && stepsList.length > 0
  const hasAnyChecks = checkedIngredients.size > 0 || checkedSteps.size > 0

  // Cooking mode functions
  const enterCookingMode = () => {
    setCookingMode(true)
    // Start at first unchecked step, or 0 if all checked/none checked
    const firstUnchecked = stepsList.findIndex((_, i) => !checkedSteps.has(i))
    setCurrentStepIndex(firstUnchecked >= 0 ? firstUnchecked : 0)
  }

  const exitCookingMode = () => {
    setCookingMode(false)
  }

  const goToNextStep = () => {
    if (currentStepIndex < stepsList.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const markCurrentStepDone = () => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentStepIndex)) {
        newSet.delete(currentStepIndex)
      } else {
        newSet.add(currentStepIndex)
      }
      return newSet
    })
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

  const decreaseServings = () => {
    if (servings > 1) setServings(servings - 1)
  }

  const increaseServings = () => {
    if (servings < 20) setServings(servings + 1)
  }

  const handleDuplicate = async () => {
    if (!recipe || !household?.id) return
    setDuplicating(true)
    try {
      const docRef = await addDoc(collection(db, 'sharedRecipes'), {
        title: `${recipe.title} (Copy)`,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        notes: recipe.notes || '',
        servings: recipe.servings || DEFAULT_SERVINGS,
        prepTime: recipe.prepTime || null,
        cookTime: recipe.cookTime || null,
        difficulty: recipe.difficulty || null,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        copiedFromLibrary: null,
        householdId: household.id,
      })
      dispatch(showToast({ message: 'Recipe duplicated!', type: 'success' }))
      navigate(`/recipe/${docRef.id}`)
    } catch (error) {
      dispatch(showToast({ message: 'Failed to duplicate recipe', type: 'error' }))
    } finally {
      setDuplicating(false)
    }
  }

  const toggleFavorite = async () => {
    const newFavoriteState = !recipe.isFavorite

    // Optimistic update - update UI immediately
    dispatch(updateRecipe({ id: recipe.id, updates: { isFavorite: newFavoriteState } }))

    try {
      await updateDoc(doc(db, 'sharedRecipes', recipe.id), {
        isFavorite: newFavoriteState
      })
      dispatch(showToast({
        message: newFavoriteState ? 'Added to favorites' : 'Removed from favorites',
        type: 'success'
      }))
    } catch (error) {
      // Revert on error
      dispatch(updateRecipe({ id: recipe.id, updates: { isFavorite: !newFavoriteState } }))
      dispatch(showToast({ message: 'Failed to update favorite', type: 'error' }))
    }
  }

  const copyAsText = async () => {
    // Format recipe as plain text
    let text = `${recipe.title}\n\n`

    if (recipe.prepTime || recipe.cookTime) {
      if (recipe.prepTime) text += `Prep: ${recipe.prepTime} min`
      if (recipe.prepTime && recipe.cookTime) text += ' | '
      if (recipe.cookTime) text += `Cook: ${recipe.cookTime} min`
      text += '\n'
    }
    if (recipe.servings) {
      text += `Servings: ${recipe.servings}\n`
    }
    if (recipe.difficulty) {
      text += `Difficulty: ${recipe.difficulty}\n`
    }

    text += '\n--- INGREDIENTS ---\n'
    text += recipe.ingredients + '\n'

    text += '\n--- STEPS ---\n'
    text += recipe.steps + '\n'

    if (recipe.notes) {
      text += '\n--- NOTES ---\n'
      text += recipe.notes + '\n'
    }

    try {
      await navigator.clipboard.writeText(text)
      dispatch(showToast({ message: 'Recipe copied to clipboard!', type: 'success' }))
    } catch (error) {
      dispatch(showToast({ message: 'Failed to copy recipe', type: 'error' }))
    }
  }

  const addToShoppingList = async () => {
    if (!recipe || !household?.id || !auth.currentUser) return
    setAddingToShopping(true)
    try {
      // Use scaled ingredients if serving size changed
      const ingredientsToAdd = servings !== originalServings
        ? scaledIngredients.split('\n').filter(line => line.trim())
        : ingredientsList

      await addRecipeIngredientsToShoppingList(
        ingredientsToAdd,
        household.id,
        auth.currentUser.uid,
        auth.currentUser.displayName || auth.currentUser.email || undefined
      )
      dispatch(showToast({
        message: `Added ${ingredientsToAdd.length} items to shopping list!`,
        type: 'success'
      }))
    } catch (error) {
      console.error('Failed to add to shopping list:', error)
      dispatch(showToast({ message: 'Failed to add to shopping list', type: 'error' }))
    } finally {
      setAddingToShopping(false)
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
        <div className="flex gap-1">
          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className="p-2"
            title={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {recipe.isFavorite ? (
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
          {/* Copy as text button */}
          <button
            onClick={copyAsText}
            className="p-2"
            title="Copy recipe as text"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
          {/* Add to shopping list button */}
          <button
            onClick={addToShoppingList}
            disabled={addingToShopping}
            className="p-2 disabled:opacity-50"
            title="Add ingredients to shopping list"
          >
            <svg className={`w-6 h-6 ${addingToShopping ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="p-2 disabled:opacity-50"
            title="Duplicate recipe"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <Link to={`/recipe/${recipe.id}/edit`} className="p-2" title="Edit recipe">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
          <button onClick={() => setShowDeleteModal(true)} className="p-2" title="Delete recipe">
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{recipe.title}</h1>

        {/* Recipe Meta Info */}
        {(recipe.prepTime || recipe.cookTime || recipe.difficulty) && (
          <div className="flex flex-wrap gap-4 mb-4">
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

        {/* Serving Size Selector */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Servings:</span>
          <div className="flex items-center gap-3">
            <button
              onClick={decreaseServings}
              disabled={servings <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-8 text-center text-lg font-semibold text-gray-900 dark:text-white">
              {servings}
            </span>
            <button
              onClick={increaseServings}
              disabled={servings >= 20}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          {servings !== originalServings && (
            <button
              onClick={() => setServings(originalServings)}
              className="text-xs text-orange-600 dark:text-orange-400 underline ml-auto"
            >
              Reset
            </button>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                Ingredients
              </h2>
              {allIngredientsChecked && (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-2">
              {servings !== originalServings && (
                <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                  Scaled for {servings}
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {checkedIngredients.size}/{ingredientsList.length}
              </span>
            </div>
          </div>
          <ul className="space-y-2">
            {ingredientsList.map((ingredient, index) => (
              <li key={index}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checkedIngredients.has(index)}
                    onChange={() => toggleIngredient(index)}
                    className="mt-1.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500 dark:bg-gray-700 cursor-pointer"
                  />
                  <span className={`text-lg leading-relaxed transition-all ${
                    checkedIngredients.has(index)
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {ingredient}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                Steps
              </h2>
              {allStepsChecked && (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {checkedSteps.size}/{stepsList.length}
            </span>
          </div>
          <ul className="space-y-3">
            {stepsList.map((step, index) => (
              <li key={index}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checkedSteps.has(index)}
                    onChange={() => toggleStep(index)}
                    className="mt-1.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500 dark:bg-gray-700 cursor-pointer"
                  />
                  <span className={`text-lg leading-relaxed transition-all ${
                    checkedSteps.has(index)
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {step}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        {/* Clear All Checkmarks */}
        {hasAnyChecks && (
          <div className="mb-6">
            <button
              onClick={clearAllChecks}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Clear all checkmarks
            </button>
          </div>
        )}

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

        {/* Spacer for floating button */}
        <div className="h-20"></div>
      </div>

      {/* Floating Start Cooking Button */}
      {stepsList.length > 0 && !cookingMode && (
        <div className="fixed bottom-6 left-0 right-0 px-6 z-40">
          <button
            onClick={enterCookingMode}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            Start Cooking
          </button>
        </div>
      )}

      {/* Cooking Mode Overlay */}
      {cookingMode && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
          {/* Cooking Mode Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={exitCookingMode}
              className="p-2 -ml-2 flex items-center gap-2 text-gray-600 dark:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium">Exit</span>
            </button>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Step {currentStepIndex + 1} of {stepsList.length}
              </p>
              {wakeLockActive && (
                <p className="text-xs text-green-500 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Screen stays on
                </p>
              )}
            </div>
            {/* Ingredients button */}
            <button
              onClick={() => setShowIngredientsSheet(true)}
              className="p-2 flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-xs font-medium">Items</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / stepsList.length) * 100}%` }}
            ></div>
          </div>

          {/* Step Content */}
          <div className="flex-1 flex flex-col justify-center p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full">
              <p className="text-3xl md:text-4xl leading-relaxed text-gray-900 dark:text-white font-medium text-center">
                {stepsList[currentStepIndex]}
              </p>
            </div>
          </div>

          {/* Step Done Checkbox */}
          <div className="px-8 pb-4">
            <label className="flex items-center justify-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedSteps.has(currentStepIndex)}
                onChange={markCurrentStepDone}
                className="w-7 h-7 rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500 dark:bg-gray-700 cursor-pointer"
              />
              <span className={`text-lg ${
                checkedSteps.has(currentStepIndex)
                  ? 'text-green-500 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {checkedSteps.has(currentStepIndex) ? 'Step completed!' : 'Mark as done'}
              </span>
            </label>
          </div>

          {/* Navigation Buttons */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4 max-w-2xl mx-auto">
              <button
                onClick={goToPrevStep}
                disabled={currentStepIndex === 0}
                className="flex-1 py-4 px-6 rounded-2xl font-semibold text-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              {currentStepIndex < stepsList.length - 1 ? (
                <button
                  onClick={goToNextStep}
                  className="flex-1 py-4 px-6 rounded-2xl font-semibold text-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={exitCookingMode}
                  className="flex-1 py-4 px-6 rounded-2xl font-semibold text-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Done!
                </button>
              )}
            </div>

            {/* Step Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {stepsList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStepIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentStepIndex
                      ? 'bg-orange-500 w-6'
                      : checkedSteps.has(index)
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Ingredients Slide-up Sheet */}
          {showIngredientsSheet && (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowIngredientsSheet(false)}
              />
              {/* Sheet */}
              <div className="relative bg-white dark:bg-gray-800 w-full max-h-[70vh] rounded-t-2xl overflow-hidden animate-slide-up">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ingredients
                  </h3>
                  <button
                    onClick={() => setShowIngredientsSheet(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Content */}
                <div className="px-4 py-4 overflow-y-auto max-h-[55vh]">
                  <ul className="space-y-3">
                    {ingredientsList.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                          checkedIngredients.has(index) ? 'bg-green-500' : 'bg-orange-500'
                        }`} />
                        <span className={`text-base ${
                          checkedIngredients.has(index)
                            ? 'text-gray-400 dark:text-gray-500 line-through'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {ingredient}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
