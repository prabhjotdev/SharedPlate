import { useEffect } from 'react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
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

    const unsubscribe = onSnapshot(
      filtersQuery,
      (snapshot) => {
        const filters: DietaryFilter[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as DietaryFilter[];

        dispatch(setDietaryFilters(filters));
        dispatch(setLoading(false));
      },
      (error) => {
        console.error('Error fetching dietary filters:', error);
        dispatch(setLoading(false));
      }
    );

    return () => unsubscribe();
  }, [dispatch, household?.id]);

  // Load and subscribe to user's active filter preference from Firestore
  // This syncs the active filter across all devices
  useEffect(() => {
    if (!household?.id || !user?.uid) return;

    const userPrefsDocId = `${household.id}_${user.uid}`;
    const userPrefsRef = doc(db, 'userDietaryPreferences', userPrefsDocId);

    // Subscribe to changes (so if user changes on another device, it updates here)
    const unsubscribe = onSnapshot(
      userPrefsRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const savedFilterId = data.activeDietaryFilterId || null;
          dispatch(setActiveDietaryFilter(savedFilterId));
        }
      },
      (error) => {
        console.error('Error fetching user dietary preferences:', error);
      }
    );

    return () => unsubscribe();
  }, [dispatch, household?.id, user?.uid]);

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
      await setActiveFilter(null);
    }
  };

  // Set active filter and persist to Firestore for cross-device sync
  const setActiveFilter = async (filterId: string | null) => {
    // Persist to Firestore for cross-device sync
    if (!household?.id || !user?.uid) {
      // Just update local state if not logged in
      dispatch(setActiveDietaryFilter(filterId));
      return;
    }

    const userPrefsDocId = `${household.id}_${user.uid}`;
    const userPrefsRef = doc(db, 'userDietaryPreferences', userPrefsDocId);

    try {
      // Save to Firestore first - the onSnapshot listener will update Redux
      await setDoc(userPrefsRef, {
        activeDietaryFilterId: filterId,
        householdId: household.id,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      // If onSnapshot doesn't fire quickly enough, update local state
      dispatch(setActiveDietaryFilter(filterId));
    } catch (error) {
      console.error('Error saving active filter preference:', error);
      // Still update local state even if Firestore fails
      dispatch(setActiveDietaryFilter(filterId));
    }
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
