import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { ShoppingItem, CustomCategory } from '../types'

// Default categories (used for display order and names)
export const DEFAULT_CATEGORIES = [
  { id: 'produce', name: 'Produce' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'meat', name: 'Meat & Seafood' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'frozen', name: 'Frozen' },
  { id: 'pantry', name: 'Pantry' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'household', name: 'Household' },
  { id: 'other', name: 'Other' },
]

// Add a shopping item
export async function addShoppingItemToFirestore(
  item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const itemRef = await addDoc(collection(db, 'shoppingItems'), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return itemRef.id
}

// Update a shopping item
export async function updateShoppingItemInFirestore(
  itemId: string,
  updates: Partial<ShoppingItem>
): Promise<void> {
  const itemRef = doc(db, 'shoppingItems', itemId)
  await updateDoc(itemRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

// Delete a shopping item
export async function deleteShoppingItemFromFirestore(itemId: string): Promise<void> {
  const itemRef = doc(db, 'shoppingItems', itemId)
  await deleteDoc(itemRef)
}

// Toggle item checked status
export async function toggleShoppingItemChecked(itemId: string, isChecked: boolean): Promise<void> {
  const itemRef = doc(db, 'shoppingItems', itemId)
  await updateDoc(itemRef, {
    isChecked,
    updatedAt: serverTimestamp(),
  })
}

// Toggle item favorite status
export async function toggleShoppingItemFavorite(itemId: string, isFavorite: boolean): Promise<void> {
  const itemRef = doc(db, 'shoppingItems', itemId)
  await updateDoc(itemRef, {
    isFavorite,
    updatedAt: serverTimestamp(),
  })
}

// Clear all checked items for a household
export async function clearCheckedItemsFromFirestore(householdId: string, items: ShoppingItem[]): Promise<void> {
  const batch = writeBatch(db)
  const checkedItems = items.filter(item => item.isChecked && item.householdId === householdId)

  checkedItems.forEach(item => {
    const itemRef = doc(db, 'shoppingItems', item.id)
    batch.delete(itemRef)
  })

  await batch.commit()
}

// Uncheck all items for a household (reset list)
export async function uncheckAllItemsInFirestore(householdId: string, items: ShoppingItem[]): Promise<void> {
  const batch = writeBatch(db)
  const householdItems = items.filter(item => item.householdId === householdId)

  householdItems.forEach(item => {
    const itemRef = doc(db, 'shoppingItems', item.id)
    batch.update(itemRef, {
      isChecked: false,
      updatedAt: serverTimestamp(),
    })
  })

  await batch.commit()
}

// Add a custom category
export async function addCustomCategoryToFirestore(
  category: Omit<CustomCategory, 'id' | 'createdAt'>
): Promise<string> {
  const categoryRef = await addDoc(collection(db, 'shoppingCategories'), {
    ...category,
    createdAt: serverTimestamp(),
  })
  return categoryRef.id
}

// Delete a custom category
export async function deleteCustomCategoryFromFirestore(categoryId: string): Promise<void> {
  const categoryRef = doc(db, 'shoppingCategories', categoryId)
  await deleteDoc(categoryRef)
}

// Add items from a recipe's ingredients
export async function addRecipeIngredientsToShoppingList(
  ingredients: string[],
  householdId: string,
  addedBy: string,
  addedByName?: string
): Promise<void> {
  const batch = writeBatch(db)

  ingredients.forEach(ingredient => {
    const itemRef = doc(collection(db, 'shoppingItems'))
    batch.set(itemRef, {
      name: ingredient,
      quantity: '',
      category: 'other',
      isChecked: false,
      isFavorite: false,
      addedBy,
      addedByName,
      householdId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })

  await batch.commit()
}

// Query builder for real-time subscription (used in component)
export function getShoppingItemsQuery(householdId: string) {
  return query(
    collection(db, 'shoppingItems'),
    where('householdId', '==', householdId)
  )
}

// Query builder for custom categories
export function getCustomCategoriesQuery(householdId: string) {
  return query(
    collection(db, 'shoppingCategories'),
    where('householdId', '==', householdId)
  )
}
