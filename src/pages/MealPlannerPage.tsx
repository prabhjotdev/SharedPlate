import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'
import { useMealPlanner, MEAL_SLOTS, MEAL_FILTER_CATEGORIES } from '../hooks/useMealPlanner'
import type { MealSlot, SharedRecipe } from '../types'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatWeekRange(dates: string[]): string {
  const start = new Date(dates[0] + 'T00:00:00')
  const end = new Date(dates[6] + 'T00:00:00')
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}`
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`
}

export default function MealPlannerPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: recipes } = useAppSelector((state) => state.recipes)
  const {
    loading,
    currentWeekDates,
    nextWeekDates,
    addToMealPlan,
    removeFromMealPlan,
    getItemsForSlot,
  } = useMealPlanner()

  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<SharedRecipe | null>(null)
  const [activeWeek, setActiveWeek] = useState<'current' | 'next'>('current')

  // Filter recipes based on category and search
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Search filter
      if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter - map recipe categories to meal slots
      if (selectedFilter !== 'all') {
        const recipeCategory = recipe.category?.toLowerCase() || ''
        if (selectedFilter === 'breakfast' && recipeCategory !== 'breakfast') return false
        if (selectedFilter === 'lunch' && recipeCategory !== 'lunch') return false
        if (selectedFilter === 'dinner' && recipeCategory !== 'dinner') return false
        if (selectedFilter === 'snack' && !['snacks', 'snack'].includes(recipeCategory)) return false
      }

      return true
    })
  }, [recipes, searchQuery, selectedFilter])

  const weekDates = activeWeek === 'current' ? currentWeekDates : nextWeekDates

  // Handle dropping recipe onto a meal slot
  const handleDrop = async (date: string, mealSlot: MealSlot) => {
    if (!selectedRecipe) return

    try {
      await addToMealPlan(selectedRecipe.id, selectedRecipe.title, date, mealSlot)
      dispatch(showToast({ message: `Added ${selectedRecipe.title} to ${mealSlot}`, type: 'success' }))
      setSelectedRecipe(null)
    } catch (error) {
      dispatch(showToast({ message: 'Failed to add to meal plan', type: 'error' }))
    }
  }

  // Handle removing a meal plan item
  const handleRemove = async (itemId: string) => {
    try {
      await removeFromMealPlan(itemId)
      dispatch(showToast({ message: 'Removed from meal plan', type: 'success' }))
    } catch (error) {
      dispatch(showToast({ message: 'Failed to remove', type: 'error' }))
    }
  }

  // Handle selecting a recipe (for mobile tap-to-add flow)
  const handleSelectRecipe = (recipe: SharedRecipe) => {
    if (selectedRecipe?.id === recipe.id) {
      setSelectedRecipe(null)
    } else {
      setSelectedRecipe(recipe)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Meal Planner</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Plan your weekly meals</p>
          </div>
        </div>
      </div>

      {/* Selected Recipe Indicator */}
      {selectedRecipe && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-orange-800 dark:text-orange-200">
                Selected: <strong>{selectedRecipe.title}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedRecipe(null)}
              className="text-sm text-orange-600 dark:text-orange-400 font-medium"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Tap a meal slot below to add this recipe
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Left Side - Recipe List */}
        <div className="lg:w-80 lg:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {MEAL_FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Recipe List */}
          <div className="h-64 lg:h-[calc(100vh-280px)] overflow-y-auto p-2">
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No recipes found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedRecipe?.id === recipe.id
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {recipe.title}
                    </p>
                    {recipe.category && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                        {recipe.category}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Week Calendar */}
        <div className="flex-1 p-4">
          {/* Week Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveWeek('current')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeWeek === 'current'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              This Week
              <span className="block text-xs opacity-75">{formatWeekRange(currentWeekDates)}</span>
            </button>
            <button
              onClick={() => setActiveWeek('next')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeWeek === 'next'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              Next Week
              <span className="block text-xs opacity-75">{formatWeekRange(nextWeekDates)}</span>
            </button>
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDates.map((date, index) => {
                    const isToday = date === new Date().toISOString().split('T')[0]
                    return (
                      <div
                        key={date}
                        className={`text-center p-2 rounded-t-lg ${
                          isToday
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="text-xs font-medium">{DAY_NAMES[index]}</div>
                        <div className="text-sm font-bold">{formatDateShort(date)}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Meal Slots */}
                {MEAL_SLOTS.map((slot) => (
                  <div key={slot.id} className="grid grid-cols-7 gap-1 mb-1">
                    {weekDates.map((date) => {
                      const items = getItemsForSlot(date, slot.id)
                      const isSelected = !!selectedRecipe

                      return (
                        <div
                          key={`${date}-${slot.id}`}
                          onClick={() => isSelected && handleDrop(date, slot.id)}
                          className={`min-h-[80px] p-2 rounded-lg border-2 transition-all ${slot.bgColor} ${slot.borderColor} ${
                            isSelected
                              ? 'cursor-pointer hover:border-orange-500 hover:shadow-md'
                              : ''
                          }`}
                        >
                          {/* Slot Label */}
                          <div className={`text-xs font-medium mb-1 ${slot.color}`}>
                            {slot.label}
                          </div>

                          {/* Meal Items */}
                          <div className="space-y-1">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="group relative bg-white dark:bg-gray-800 rounded p-1.5 shadow-sm text-xs"
                              >
                                <p className="text-gray-900 dark:text-white truncate pr-4">
                                  {item.recipeTitle}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemove(item.id)
                                  }}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-opacity"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Empty State / Drop Target */}
                          {items.length === 0 && isSelected && (
                            <div className="flex items-center justify-center h-12 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded text-orange-500 text-xs">
                              + Add here
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {MEAL_SLOTS.map((slot) => (
              <div key={slot.id} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${slot.bgColor} ${slot.borderColor} border`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{slot.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
