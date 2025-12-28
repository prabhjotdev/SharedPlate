import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import recipesReducer from './recipesSlice';
import libraryReducer from './librarySlice';
import uiReducer from './uiSlice';
import settingsReducer from './settingsSlice';
import householdReducer from './householdSlice';
import shoppingReducer from './shoppingSlice';
import libraryCategoriesReducer from './libraryCategoriesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipesReducer,
    library: libraryReducer,
    ui: uiReducer,
    settings: settingsReducer,
    household: householdReducer,
    shopping: shoppingReducer,
    libraryCategories: libraryCategoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (Firebase timestamps)
        ignoredActions: ['recipes/setRecipes', 'household/setHousehold', 'household/setInviteCodes', 'household/addInviteCode', 'shopping/setShoppingItems', 'shopping/setCustomCategories', 'libraryCategories/setDietaryFilters'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'payload.joinedAt', 'payload.expiresAt', 'payload.members'],
        // Ignore these paths in the state
        ignoredPaths: ['recipes.items', 'household.household', 'household.inviteCodes', 'shopping.items', 'shopping.customCategories', 'libraryCategories.dietaryFilters'],
      },
    }),
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
