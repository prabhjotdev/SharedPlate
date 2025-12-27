import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'
import { useDietaryFilters } from '../hooks/useDietaryFilters'
import type { DietaryFilter } from '../types'

export default function DietaryFiltersPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    dietaryFilters,
    activeFilter,
    activeDietaryFilterId,
    loading,
    addFilter,
    updateFilter,
    deleteFilter,
    setActiveFilter,
  } = useDietaryFilters()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFilter, setEditingFilter] = useState<DietaryFilter | null>(null)
  const [filterName, setFilterName] = useState('')
  const [ingredientInput, setIngredientInput] = useState('')
  const [blockedIngredients, setBlockedIngredients] = useState<string[]>([])

  const handleOpenAdd = () => {
    setFilterName('')
    setBlockedIngredients([])
    setIngredientInput('')
    setEditingFilter(null)
    setShowAddModal(true)
  }

  const handleOpenEdit = (filter: DietaryFilter) => {
    setFilterName(filter.name)
    setBlockedIngredients([...filter.blockedIngredients])
    setIngredientInput('')
    setEditingFilter(filter)
    setShowAddModal(true)
  }

  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim().toLowerCase()
    if (trimmed && !blockedIngredients.includes(trimmed)) {
      setBlockedIngredients([...blockedIngredients, trimmed])
      setIngredientInput('')
    }
  }

  const handleRemoveIngredient = (ingredient: string) => {
    setBlockedIngredients(blockedIngredients.filter(i => i !== ingredient))
  }

  const handleSave = async () => {
    if (!filterName.trim()) {
      dispatch(showToast({ message: 'Please enter a filter name', type: 'error' }))
      return
    }

    try {
      if (editingFilter) {
        await updateFilter(editingFilter.id, {
          name: filterName.trim(),
          blockedIngredients,
        })
        dispatch(showToast({ message: 'Filter updated!', type: 'success' }))
      } else {
        await addFilter(filterName.trim(), blockedIngredients)
        dispatch(showToast({ message: 'Filter created!', type: 'success' }))
      }
      setShowAddModal(false)
    } catch (error) {
      dispatch(showToast({ message: 'Failed to save filter', type: 'error' }))
    }
  }

  const handleDelete = async (filter: DietaryFilter) => {
    if (!confirm(`Delete "${filter.name}" filter?`)) return

    try {
      await deleteFilter(filter.id)
      dispatch(showToast({ message: 'Filter deleted', type: 'success' }))
    } catch (error) {
      dispatch(showToast({ message: 'Failed to delete filter', type: 'error' }))
    }
  }

  const handleToggleActive = (filterId: string) => {
    if (activeDietaryFilterId === filterId) {
      setActiveFilter(null)
    } else {
      setActiveFilter(filterId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dietary Filters</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage ingredients to avoid</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Card */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-orange-800 dark:text-orange-200">
              <p className="font-medium mb-1">How it works</p>
              <p>Create filters with ingredients to avoid (e.g., from your dietitian). When a filter is active, recipes containing those ingredients will be flagged in the Library and My Recipes.</p>
            </div>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {activeFilter && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Active: {activeFilter.name}
                </span>
              </div>
              <button
                onClick={() => setActiveFilter(null)}
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Deactivate
              </button>
            </div>
          </div>
        )}

        {/* Filters List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : dietaryFilters.length > 0 ? (
          <div className="space-y-3">
            {dietaryFilters.map((filter) => (
              <div
                key={filter.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-colors ${
                  activeDietaryFilterId === filter.id
                    ? 'border-green-500 dark:border-green-600'
                    : 'border-transparent shadow-sm'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{filter.name}</h3>
                        {activeDietaryFilterId === filter.id && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {filter.blockedIngredients.length} blocked ingredient{filter.blockedIngredients.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeDietaryFilterId === filter.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {activeDietaryFilterId === filter.id ? 'Active' : 'Activate'}
                    </button>
                  </div>

                  {/* Blocked Ingredients Preview */}
                  {filter.blockedIngredients.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {filter.blockedIngredients.slice(0, 5).map((ingredient) => (
                        <span
                          key={ingredient}
                          className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {filter.blockedIngredients.length > 5 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          +{filter.blockedIngredients.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(filter)}
                      className="flex-1 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(filter)}
                      className="flex-1 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No dietary filters yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Create a filter to avoid specific ingredients in recipes
            </p>
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={handleOpenAdd}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Filter
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingFilter ? 'Edit Filter' : 'New Dietary Filter'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Filter Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter Name
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="e.g., Dietitian Approved, Low Sodium"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* Add Ingredient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ingredients to Avoid
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                    placeholder="Type an ingredient..."
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    onClick={handleAddIngredient}
                    disabled={!ingredientInput.trim()}
                    className="px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Blocked Ingredients List */}
              {blockedIngredients.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {blockedIngredients.length} ingredient{blockedIngredients.length !== 1 ? 's' : ''} to avoid:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {blockedIngredients.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm"
                      >
                        {ingredient}
                        <button
                          onClick={() => handleRemoveIngredient(ingredient)}
                          className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors mt-4"
              >
                {editingFilter ? 'Save Changes' : 'Create Filter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
