import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import recipesReducer from './recipesSlice';
import libraryReducer from './librarySlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipesReducer,
    library: libraryReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (Firebase timestamps)
        ignoredActions: ['recipes/setRecipes'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
        // Ignore these paths in the state
        ignoredPaths: ['recipes.items'],
      },
    }),
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
