import { useState, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'
import { useMealPlanner, MEAL_SLOTS, MEAL_FILTER_CATEGORIES } from '../hooks/useMealPlanner'
import { MealPlannerSkeleton } from '../components/ui/Skeleton'
import type { MealSlot, SharedRecipe } from '../types'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
  const [activeWeek, setActiveWeek] = useState<'current' | 'next'>('current')
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [showRecipePicker, setShowRecipePicker] = useState(false)
  const [targetSlot, setTargetSlot] = useState<{ date: string; slot: MealSlot } | null>(null)

  // Filter recipes based on category and search
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

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

  // Find today's index
  const todayStr = new Date().toISOString().split('T')[0]
  const todayIndex = weekDates.findIndex(d => d === todayStr)

  // Auto-expand today on load
  useState(() => {
    if (todayIndex >= 0) {
      setExpandedDay(todayIndex)
    }
  })

  // Handle adding recipe to a slot
  const handleAddRecipe = async (recipe: SharedRecipe) => {
    if (!targetSlot) return

    try {
      await addToMealPlan(recipe.id, recipe.title, targetSlot.date, targetSlot.slot)
      dispatch(showToast({ message: `Added ${recipe.title}`, type: 'success' }))
      setShowRecipePicker(false)
      setTargetSlot(null)
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

  // Open recipe picker for a slot
  const openRecipePicker = (date: string, slot: MealSlot) => {
    setTargetSlot({ date, slot })
    setShowRecipePicker(true)
  }

  // Toggle day expansion
  const toggleDay = (index: number) => {
    setExpandedDay(expandedDay === index ? null : index)
  }

  // Count meals for a day
  const getMealCountForDay = (date: string) => {
    return MEAL_SLOTS.reduce((count, slot) => count + getItemsForSlot(date, slot.id).length, 0)
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pb-20">
      {/* Week Toggle - Sticky */}
      <div className="sticky top-14 z-30 bg-warm-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveWeek('current')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all min-h-[48px] ${
              activeWeek === 'current'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            This Week
            <span className="block text-xs opacity-80 mt-0.5">{formatWeekRange(currentWeekDates)}</span>
          </button>
          <button
            onClick={() => setActiveWeek('next')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all min-h-[48px] ${
              activeWeek === 'next'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Next Week
            <span className="block text-xs opacity-80 mt-0.5">{formatWeekRange(nextWeekDates)}</span>
          </button>
        </div>
      </div>

      {/* Day Cards - Vertical Scroll */}
      <div className="p-4 space-y-3">
        {loading ? (
          <MealPlannerSkeleton count={7} />
        ) : (
          weekDates.map((date, index) => {
            const isToday = date === todayStr
            const isExpanded = expandedDay === index
            const mealCount = getMealCountForDay(date)

            return (
              <div
                key={date}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden transition-all ${
                  isToday
                    ? 'border-primary-300 dark:border-primary-700 ring-2 ring-primary-100 dark:ring-primary-900/50'
                    : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                {/* Day Header - Clickable */}
                <button
                  onClick={() => toggleDay(index)}
                  className="w-full flex items-center justify-between p-4 min-h-[60px] text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Day Circle */}
                    <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${
                      isToday
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      <span className="text-xs font-medium">{DAY_NAMES_SHORT[index]}</span>
                      <span className="text-sm font-bold">{new Date(date + 'T00:00:00').getDate()}</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {isToday ? 'Today' : DAY_NAMES[index]}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mealCount === 0 ? 'No meals planned' : `${mealCount} meal${mealCount > 1 ? 's' : ''} planned`}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded Content - Meal Slots */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {MEAL_SLOTS.map((slot) => {
                      const items = getItemsForSlot(date, slot.id)

                      return (
                        <div
                          key={slot.id}
                          className={`rounded-xl p-3 ${slot.bgColor} border ${slot.borderColor}`}
                        >
                          {/* Slot Header */}
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium text-sm ${slot.color}`}>
                              {slot.label}
                            </span>
                            <button
                              onClick={() => openRecipePicker(date, slot.id)}
                              className={`p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${slot.color} hover:bg-white/50 dark:hover:bg-gray-800/50`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          {/* Meal Items */}
                          {items.length > 0 ? (
                            <div className="space-y-2">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                                >
                                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate mr-2">
                                    {item.recipeTitle}
                                  </span>
                                  <button
                                    onClick={() => handleRemove(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                              No {slot.label.toLowerCase()} planned
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Recipe Picker Modal */}
      {showRecipePicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowRecipePicker(false)
              setTargetSlot(null)
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Recipe</h2>
                  {targetSlot && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {MEAL_SLOTS.find(s => s.id === targetSlot.slot)?.label} • {formatDateShort(targetSlot.date)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowRecipePicker(false)
                    setTargetSlot(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-base focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                {MEAL_FILTER_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedFilter(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] ${
                      selectedFilter === cat.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p>No recipes found</p>
                  <p className="text-sm mt-1">Try a different search or filter</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleAddRecipe(recipe)}
                      className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-[0.99] min-h-[60px]"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {recipe.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {recipe.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 capitalize">
                            {recipe.category}
                          </span>
                        )}
                        {(recipe.prepTime || recipe.cookTime) && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
