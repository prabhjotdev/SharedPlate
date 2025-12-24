import { useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppDispatch, useAppSelector } from '../store'
import { setLibraryRecipes, setLoading, setSelectedCategory } from '../store/librarySlice'
import type { LibraryRecipe, Category } from '../types'
import CategoryTabs from '../components/library/CategoryTabs'
import RecipeGrid from '../components/library/RecipeGrid'

const categories: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'quick-meals', label: 'Quick Meals' },
]

export default function LibraryPage() {
  const dispatch = useAppDispatch()
  const { items, loading, selectedCategory } = useAppSelector((state) => state.library)

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

  // Filter recipes by category
  const filteredRecipes =
    selectedCategory === 'all'
      ? items
      : items.filter((recipe) => recipe.category === selectedCategory)

  return (
    <div className="pt-6">
      {/* Header */}
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipe Library</h1>
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onChange={handleCategoryChange}
      />

      {/* Recipe Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <RecipeGrid recipes={filteredRecipes} />
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 px-4">
          No recipes in this category yet
        </div>
      )}
    </div>
  )
}
