import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAppSelector } from '../store'
import type { MealPlanItem, MealSlot } from '../types'

// Helper to get start of week (Monday)
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper to get array of dates for a week starting from Monday
function getWeekDates(startOfWeek: Date): string[] {
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    dates.push(formatDate(d))
  }
  return dates
}

export function useMealPlanner() {
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const { household } = useAppSelector((state) => state.household)
  const { user } = useAppSelector((state) => state.auth)

  // Memoize week calculations to prevent re-renders from causing Firestore assertion errors
  const { currentWeekDates, nextWeekDates, currentWeekStart, nextWeekStart } = useMemo(() => {
    const today = new Date()
    const cwStart = getStartOfWeek(today)
    const nwStart = new Date(cwStart)
    nwStart.setDate(nwStart.getDate() + 7)

    return {
      currentWeekStart: cwStart,
      nextWeekStart: nwStart,
      currentWeekDates: getWeekDates(cwStart),
      nextWeekDates: getWeekDates(nwStart),
    }
  }, []) // Empty deps - only calculate once per component mount

  // Stable date range for the query
  const startDate = currentWeekDates[0]
  const endDate = nextWeekDates[6]

  // Subscribe to meal plan items for current and next week
  useEffect(() => {
    if (!household?.id) {
      setMealPlanItems([])
      setLoading(false)
      return
    }

    setLoading(true)

    const mealPlanQuery = query(
      collection(db, 'mealPlanItems'),
      where('householdId', '==', household.id),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    )

    const unsubscribe = onSnapshot(
      mealPlanQuery,
      (snapshot) => {
        const items: MealPlanItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as MealPlanItem[]

        setMealPlanItems(items)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching meal plan:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [household?.id, startDate, endDate])

  // Add a recipe to the meal plan
  const addToMealPlan = useCallback(
    async (recipeId: string, recipeTitle: string, date: string, mealSlot: MealSlot) => {
      if (!household?.id || !user?.uid) {
        throw new Error('No household or user')
      }

      await addDoc(collection(db, 'mealPlanItems'), {
        recipeId,
        recipeTitle,
        date,
        mealSlot,
        householdId: household.id,
        addedBy: user.uid,
        createdAt: serverTimestamp(),
      })
    },
    [household?.id, user?.uid]
  )

  // Remove a meal plan item
  const removeFromMealPlan = useCallback(async (itemId: string) => {
    await deleteDoc(doc(db, 'mealPlanItems', itemId))
  }, [])

  // Clear all items for a specific date
  const clearDay = useCallback(
    async (date: string) => {
      const itemsToDelete = mealPlanItems.filter((item) => item.date === date)
      const batch = writeBatch(db)
      itemsToDelete.forEach((item) => {
        batch.delete(doc(db, 'mealPlanItems', item.id))
      })
      await batch.commit()
    },
    [mealPlanItems]
  )

  // Get meal plan items for a specific date and slot
  const getItemsForSlot = useCallback(
    (date: string, mealSlot: MealSlot): MealPlanItem[] => {
      return mealPlanItems.filter(
        (item) => item.date === date && item.mealSlot === mealSlot
      )
    },
    [mealPlanItems]
  )

  // Get all items for a specific date
  const getItemsForDate = useCallback(
    (date: string): MealPlanItem[] => {
      return mealPlanItems.filter((item) => item.date === date)
    },
    [mealPlanItems]
  )

  return {
    mealPlanItems,
    loading,
    currentWeekDates,
    nextWeekDates,
    currentWeekStart,
    nextWeekStart,
    addToMealPlan,
    removeFromMealPlan,
    clearDay,
    getItemsForSlot,
    getItemsForDate,
  }
}

// Meal slot configuration with colors
export const MEAL_SLOTS: { id: MealSlot; label: string; color: string; bgColor: string; borderColor: string }[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: 'lunch',
    label: 'Lunch',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'dinner',
    label: 'Dinner',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'snack',
    label: 'Snack',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
]

// Filter categories for the recipe list
export const MEAL_FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
]
