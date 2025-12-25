import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppSelector, useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'
import RecipeForm from '../components/recipes/RecipeForm'
import type { Difficulty } from '../types'

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.recipes)
  const [saving, setSaving] = useState(false)

  const recipe = items.find((r) => r.id === id)

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

  const handleSave = async (data: {
    title: string
    ingredients: string
    steps: string
    notes: string
    servings: number
    prepTime: number | null
    cookTime: number | null
    difficulty: Difficulty | null
  }) => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'sharedRecipes', recipe.id), {
        title: data.title,
        ingredients: data.ingredients,
        steps: data.steps,
        notes: data.notes,
        servings: data.servings,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        difficulty: data.difficulty,
        updatedAt: serverTimestamp(),
      })
      dispatch(showToast({ message: 'Recipe updated!', type: 'success' }))
      navigate(`/recipe/${recipe.id}`)
    } catch (error) {
      dispatch(showToast({ message: 'Failed to update recipe', type: 'error' }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 font-medium">
          Cancel
        </button>
        <h1 className="font-semibold text-gray-900 dark:text-white">Edit Recipe</h1>
        <div className="w-14"></div>
      </div>

      {/* Form */}
      <RecipeForm
        initialData={{
          title: recipe.title,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          notes: recipe.notes || '',
          servings: recipe.servings,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          difficulty: recipe.difficulty,
        }}
        onSave={handleSave}
        saving={saving}
        isEdit
      />
    </div>
  )
}
