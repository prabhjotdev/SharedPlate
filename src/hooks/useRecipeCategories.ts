import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppSelector } from '../store'
import type { RecipeCategory } from '../types'

// Default categories that are always available
export const DEFAULT_RECIPE_CATEGORIES = [
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'dinner', name: 'Dinner' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'quick-meals', name: 'Quick Meals' },
]

export function useRecipeCategories() {
  const [customCategories, setCustomCategories] = useState<RecipeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { household } = useAppSelector((state) => state.household)
  const { user } = useAppSelector((state) => state.auth)

  // Subscribe to custom categories for the household
  useEffect(() => {
    if (!household?.id) {
      setCustomCategories([])
      setLoading(false)
      return
    }

    setLoading(true)

    const categoriesQuery = query(
      collection(db, 'recipeCategories'),
      where('householdId', '==', household.id)
    )

    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const categories: RecipeCategory[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as RecipeCategory[]

        // Sort alphabetically
        categories.sort((a, b) => a.name.localeCompare(b.name))
        setCustomCategories(categories)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching recipe categories:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [household?.id])

  // All categories (default + custom)
  const allCategories = [
    ...DEFAULT_RECIPE_CATEGORIES,
    ...customCategories.map(c => ({ id: c.id, name: c.name })),
  ]

  // Add a new custom category
  const addCategory = async (name: string) => {
    if (!household?.id) {
      throw new Error('No household selected. Please join or create a household first.')
    }
    if (!user?.uid) {
      throw new Error('You must be logged in to create a category.')
    }

    // Check if name already exists (case insensitive)
    const normalizedName = name.trim().toLowerCase()
    const exists = allCategories.some(c => c.name.toLowerCase() === normalizedName)
    if (exists) {
      throw new Error('A category with this name already exists.')
    }

    await addDoc(collection(db, 'recipeCategories'), {
      name: name.trim(),
      householdId: household.id,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    })
  }

  // Delete a custom category
  const deleteCategory = async (categoryId: string) => {
    // Only allow deleting custom categories (not default ones)
    const isDefault = DEFAULT_RECIPE_CATEGORIES.some(c => c.id === categoryId)
    if (isDefault) {
      throw new Error('Cannot delete default categories.')
    }

    await deleteDoc(doc(db, 'recipeCategories', categoryId))
  }

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = allCategories.find(c => c.id === categoryId)
    return category?.name || categoryId
  }

  // Check if category is custom (can be deleted)
  const isCustomCategory = (categoryId: string): boolean => {
    return !DEFAULT_RECIPE_CATEGORIES.some(c => c.id === categoryId)
  }

  return {
    customCategories,
    allCategories,
    loading,
    addCategory,
    deleteCategory,
    getCategoryName,
    isCustomCategory,
  }
}
