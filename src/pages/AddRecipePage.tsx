import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import { useAppDispatch, useAppSelector } from '../store'
import { showToast } from '../store/uiSlice'
import RecipeForm from '../components/recipes/RecipeForm'

export default function AddRecipePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { household } = useAppSelector((state) => state.household)
  const [saving, setSaving] = useState(false)

  const handleSave = async (data: {
    title: string
    ingredients: string
    steps: string
    notes: string
  }) => {
    setSaving(true)
    try {
      await addDoc(collection(db, 'sharedRecipes'), {
        ...data,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        copiedFromLibrary: null,
        householdId: household?.id,
      })
      dispatch(showToast({ message: 'Recipe saved!', type: 'success' }))
      navigate('/')
    } catch (error) {
      dispatch(showToast({ message: 'Failed to save recipe', type: 'error' }))
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
        <h1 className="font-semibold text-gray-900 dark:text-white">Add Recipe</h1>
        <div className="w-14"></div>
      </div>

      {/* Form */}
      <RecipeForm onSave={handleSave} saving={saving} />
    </div>
  )
}
