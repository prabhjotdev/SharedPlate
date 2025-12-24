import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppSelector, useAppDispatch } from '../store'
import { showToast } from '../store/uiSlice'
import RecipeForm from '../components/recipes/RecipeForm'

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.recipes)
  const [saving, setSaving] = useState(false)

  const recipe = items.find((r) => r.id === id)

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-gray-500 mb-4">Recipe not found</p>
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
  }) => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'sharedRecipes', recipe.id), {
        ...data,
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={() => navigate(-1)} className="text-gray-600 font-medium">
          Cancel
        </button>
        <h1 className="font-semibold">Edit Recipe</h1>
        <div className="w-14"></div>
      </div>

      {/* Form */}
      <RecipeForm
        initialData={{
          title: recipe.title,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          notes: recipe.notes || '',
        }}
        onSave={handleSave}
        saving={saving}
        isEdit
      />
    </div>
  )
}
