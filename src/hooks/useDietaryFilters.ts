import { useEffect } from 'react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAppDispatch, useAppSelector } from '../store';
import { setDietaryFilters, setLoading, setActiveDietaryFilter } from '../store/libraryCategoriesSlice';
import type { DietaryFilter } from '../types';

export function useDietaryFilters() {
  const dispatch = useAppDispatch();
  const { dietaryFilters, activeDietaryFilterId, loading } = useAppSelector((state) => state.libraryCategories);
  const { household } = useAppSelector((state) => state.household);
  const { user } = useAppSelector((state) => state.auth);

  // Subscribe to dietary filters for the household
  useEffect(() => {
    if (!household?.id) {
      dispatch(setDietaryFilters([]));
      return;
    }

    dispatch(setLoading(true));

    const filtersQuery = query(
      collection(db, 'dietaryFilters'),
      where('householdId', '==', household.id)
    );

    const unsubscribe = onSnapshot(filtersQuery, (snapshot) => {
      const filters: DietaryFilter[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as DietaryFilter[];

      dispatch(setDietaryFilters(filters));
    });

    return () => unsubscribe();
  }, [dispatch, household?.id]);

  // Get the active filter
  const activeFilter = dietaryFilters.find(f => f.id === activeDietaryFilterId) || null;

  // Add a new dietary filter
  const addFilter = async (name: string, blockedIngredients: string[]) => {
    if (!household?.id) {
      throw new Error('No household selected. Please join or create a household first.');
    }
    if (!user?.uid) {
      throw new Error('You must be logged in to create a filter.');
    }

    await addDoc(collection(db, 'dietaryFilters'), {
      name,
      blockedIngredients,
      householdId: household.id,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  // Update a dietary filter
  const updateFilter = async (filterId: string, updates: { name?: string; blockedIngredients?: string[] }) => {
    await updateDoc(doc(db, 'dietaryFilters', filterId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  // Delete a dietary filter
  const deleteFilter = async (filterId: string) => {
    await deleteDoc(doc(db, 'dietaryFilters', filterId));
    if (activeDietaryFilterId === filterId) {
      dispatch(setActiveDietaryFilter(null));
    }
  };

  // Set active filter
  const setActiveFilter = (filterId: string | null) => {
    dispatch(setActiveDietaryFilter(filterId));
  };

  // Check if a recipe contains blocked ingredients
  const hasBlockedIngredients = (recipeIngredients: string): boolean => {
    if (!activeFilter) return false;

    const ingredientsLower = recipeIngredients.toLowerCase();
    return activeFilter.blockedIngredients.some(blocked =>
      ingredientsLower.includes(blocked.toLowerCase())
    );
  };

  // Get which blocked ingredients are in a recipe
  const getBlockedIngredientsInRecipe = (recipeIngredients: string): string[] => {
    if (!activeFilter) return [];

    const ingredientsLower = recipeIngredients.toLowerCase();
    return activeFilter.blockedIngredients.filter(blocked =>
      ingredientsLower.includes(blocked.toLowerCase())
    );
  };

  return {
    dietaryFilters,
    activeFilter,
    activeDietaryFilterId,
    loading,
    addFilter,
    updateFilter,
    deleteFilter,
    setActiveFilter,
    hasBlockedIngredients,
    getBlockedIngredientsInRecipe,
  };
}
