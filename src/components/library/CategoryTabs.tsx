import { useState } from 'react'

interface CategoryTabsProps {
  categories: { value: string; label: string; isCustom?: boolean }[]
  selected: string
  onChange: (category: string) => void
  onAddCategory?: (name: string) => Promise<void>
  onDeleteCategory?: (categoryId: string) => Promise<void>
  showAddButton?: boolean
}

export default function CategoryTabs({
  categories,
  selected,
  onChange,
  onAddCategory,
  onDeleteCategory,
  showAddButton = false,
}: CategoryTabsProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [saving, setSaving] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !onAddCategory) return

    setSaving(true)
    try {
      await onAddCategory(newCategoryName.trim())
      setNewCategoryName('')
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding category:', error)
      alert(error instanceof Error ? error.message : 'Failed to add category')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!onDeleteCategory) return
    if (!confirm('Delete this category? Recipes using it will no longer show this category.')) return

    try {
      await onDeleteCategory(categoryId)
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }

  const customCategories = categories.filter(c => c.isCustom)

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onChange(category.value)}
            className={`px-4 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-colors min-h-[44px] flex items-center ${
              selected === category.value
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {category.label}
          </button>
        ))}

        {/* Add/Manage Button */}
        {showAddButton && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-colors bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center gap-1 min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Category</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="e.g., Baking, Grilling, Instant Pot"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-base"
                  autoFocus
                />
              </div>

              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || saving}
                className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                {saving ? 'Adding...' : 'Add Category'}
              </button>

              {/* Manage Custom Categories */}
              {customCategories.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setShowManageModal(true)
                    }}
                    className="w-full text-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium py-2"
                  >
                    Manage Custom Categories ({customCategories.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowManageModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Custom Categories</h2>
                <button
                  onClick={() => setShowManageModal(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              {customCategories.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No custom categories yet
                </p>
              ) : (
                <div className="space-y-2">
                  {customCategories.map((category) => (
                    <div
                      key={category.value}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.label}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(category.value)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowManageModal(false)
                  setShowAddModal(true)
                }}
                className="w-full mt-4 bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
