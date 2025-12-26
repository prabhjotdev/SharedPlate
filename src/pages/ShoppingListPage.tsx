import { useEffect, useState, useCallback } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { useAppDispatch, useAppSelector } from '../store'
import {
  setShoppingItems,
  setCustomCategories,
  setLoading,
  toggleItemChecked,
  toggleItemFavorite,
  removeShoppingItem,
  addShoppingItem,
} from '../store/shoppingSlice'
import type { ShoppingItem, CustomCategory } from '../types'
import {
  DEFAULT_CATEGORIES,
  getShoppingItemsQuery,
  getCustomCategoriesQuery,
  addShoppingItemToFirestore,
  updateShoppingItemInFirestore,
  deleteShoppingItemFromFirestore,
  toggleShoppingItemChecked,
  toggleShoppingItemFavorite,
  uncheckAllItemsInFirestore,
  clearCheckedItemsFromFirestore,
  addCustomCategoryToFirestore,
} from '../services/shoppingService'
import PullToRefresh from '../components/ui/PullToRefresh'

export default function ShoppingListPage() {
  const dispatch = useAppDispatch()
  const { items, customCategories, loading } = useAppSelector((state) => state.shopping)
  const { household } = useAppSelector((state) => state.household)
  const { user } = useAppSelector((state) => state.auth)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Form state
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [itemCategory, setItemCategory] = useState('other')
  const [itemNote, setItemNote] = useState('')

  // Subscribe to shopping items
  useEffect(() => {
    if (!household?.id) {
      dispatch(setShoppingItems([]))
      dispatch(setCustomCategories([]))
      return
    }

    dispatch(setLoading(true))

    // Subscribe to shopping items
    const itemsQuery = getShoppingItemsQuery(household.id)
    const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => {
      const shoppingItems: ShoppingItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ShoppingItem[]

      dispatch(setShoppingItems(shoppingItems))
    })

    // Subscribe to custom categories
    const categoriesQuery = getCustomCategoriesQuery(household.id)
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const categories: CustomCategory[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as CustomCategory[]

      dispatch(setCustomCategories(categories))
    })

    return () => {
      unsubscribeItems()
      unsubscribeCategories()
    }
  }, [dispatch, household?.id])

  // Get all categories (default + custom)
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map((c) => ({ id: c.id, name: c.name })),
  ]

  // Group items by category, with checked items at bottom
  const groupedItems = allCategories.reduce(
    (acc, category) => {
      const categoryItems = items.filter((item) => item.category === category.id)
      const unchecked = categoryItems.filter((item) => !item.isChecked)
      const checked = categoryItems.filter((item) => item.isChecked)
      acc[category.id] = { name: category.name, items: [...unchecked, ...checked] }
      return acc
    },
    {} as Record<string, { name: string; items: ShoppingItem[] }>
  )

  // Get favorite items for quick add
  const favoriteItems = items.filter((item) => item.isFavorite)

  // Count stats
  const totalItems = items.length
  const checkedItems = items.filter((item) => item.isChecked).length

  const handleRefresh = useCallback(async () => {
    // The onSnapshot handles real-time updates, but we can trigger a refresh if needed
  }, [])

  const resetForm = () => {
    setItemName('')
    setItemQuantity('')
    setItemCategory('other')
    setItemNote('')
    setEditingItem(null)
  }

  const handleAddItem = async () => {
    if (!itemName.trim() || !household?.id || !user) return

    try {
      const newItem: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'> = {
        name: itemName.trim(),
        quantity: itemQuantity.trim(),
        category: itemCategory,
        isChecked: false,
        isFavorite: false,
        note: itemNote.trim() || undefined,
        addedBy: user.uid,
        addedByName: user.displayName || user.email,
        householdId: household.id,
      }

      const id = await addShoppingItemToFirestore(newItem)
      dispatch(addShoppingItem({ ...newItem, id, createdAt: new Date(), updatedAt: new Date() }))
      resetForm()
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem || !itemName.trim()) return

    try {
      const updates = {
        name: itemName.trim(),
        quantity: itemQuantity.trim(),
        category: itemCategory,
        note: itemNote.trim() || undefined,
      }

      await updateShoppingItemInFirestore(editingItem.id, updates)
      resetForm()
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to update item:', error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      dispatch(removeShoppingItem(itemId))
      await deleteShoppingItemFromFirestore(itemId)
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const handleToggleChecked = async (item: ShoppingItem) => {
    try {
      dispatch(toggleItemChecked(item.id))
      await toggleShoppingItemChecked(item.id, !item.isChecked)
    } catch (error) {
      console.error('Failed to toggle item:', error)
    }
  }

  const handleToggleFavorite = async (item: ShoppingItem, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      dispatch(toggleItemFavorite(item.id))
      await toggleShoppingItemFavorite(item.id, !item.isFavorite)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleResetList = async () => {
    if (!household?.id || items.length === 0) return
    try {
      await uncheckAllItemsInFirestore(household.id, items)
    } catch (error) {
      console.error('Failed to reset list:', error)
    }
  }

  const handleClearChecked = async () => {
    if (!household?.id) return
    try {
      await clearCheckedItemsFromFirestore(household.id, items)
    } catch (error) {
      console.error('Failed to clear checked items:', error)
    }
  }

  const handleQuickAddFavorite = async (favoriteItem: ShoppingItem) => {
    if (!household?.id || !user) return

    try {
      const newItem: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'> = {
        name: favoriteItem.name,
        quantity: favoriteItem.quantity,
        category: favoriteItem.category,
        isChecked: false,
        isFavorite: false,
        note: favoriteItem.note,
        addedBy: user.uid,
        addedByName: user.displayName || user.email,
        householdId: household.id,
      }

      await addShoppingItemToFirestore(newItem)
    } catch (error) {
      console.error('Failed to quick add item:', error)
    }
  }

  const handleAddCustomCategory = async () => {
    if (!newCategoryName.trim() || !household?.id || !user) return

    try {
      await addCustomCategoryToFirestore({
        name: newCategoryName.trim(),
        householdId: household.id,
        createdBy: user.uid,
      })
      setNewCategoryName('')
      setShowCategoryModal(false)
    } catch (error) {
      console.error('Failed to add category:', error)
    }
  }

  const openEditModal = (item: ShoppingItem) => {
    setEditingItem(item)
    setItemName(item.name)
    setItemQuantity(item.quantity)
    setItemCategory(item.category)
    setItemNote(item.note || '')
    setShowAddModal(true)
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping List</h1>
            {totalItems > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {checkedItems} of {totalItems} items
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {checkedItems > 0 && (
              <button
                onClick={handleClearChecked}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                title="Clear checked items"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {totalItems > 0 && (
              <button
                onClick={handleResetList}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
                title="Reset list (uncheck all)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Favorites Quick Add */}
        {favoriteItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Add Favorites</h2>
            <div className="flex flex-wrap gap-2">
              {favoriteItems.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickAddFavorite(item)}
                  className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                >
                  + {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalItems === 0 ? (
          <EmptyState onAddClick={openAddModal} />
        ) : (
          /* Category Sections */
          <div className="space-y-6">
            {allCategories.map((category) => {
              const categoryData = groupedItems[category.id]
              if (!categoryData || categoryData.items.length === 0) return null

              return (
                <div key={category.id}>
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                    {categoryData.name}
                  </h2>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {categoryData.items.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          index !== categoryData.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                        } ${item.isChecked ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleChecked(item)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            item.isChecked
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                          }`}
                        >
                          {item.isChecked && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        {/* Item Details */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => openEditModal(item)}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                item.isChecked
                                  ? 'text-gray-400 dark:text-gray-500 line-through'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.quantity && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({item.quantity})
                              </span>
                            )}
                          </div>
                          {item.note && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.note}</p>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => handleToggleFavorite(item, e)}
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {item.isFavorite ? (
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Floating Add Button */}
        <button
          onClick={openAddModal}
          className="fixed bottom-24 right-4 w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Add/Edit Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-xl rounded-t-xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Item' : 'Add Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Milk, Eggs, Bread..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    placeholder="e.g., 2 lbs, 1 gallon, 6 pack..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <button
                      onClick={() => setShowCategoryModal(true)}
                      className="text-xs text-orange-500 hover:text-orange-600"
                    >
                      + Add Custom
                    </button>
                  </div>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {allCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Note
                  </label>
                  <input
                    type="text"
                    value={itemNote}
                    onChange={(e) => setItemNote(e.target.value)}
                    placeholder="e.g., Brand preference, store location..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                  disabled={!itemName.trim()}
                  className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingItem ? 'Update Item' : 'Add to List'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm mx-4 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Custom Category
              </h3>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCategoryModal(false)
                    setNewCategoryName('')
                  }}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomCategory}
                  disabled={!newCategoryName.trim()}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  )
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Your cart is empty!
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-xs">
        Time to stock up! Add items to your shopping list and never forget the essentials again.
      </p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add First Item
      </button>
    </div>
  )
}
