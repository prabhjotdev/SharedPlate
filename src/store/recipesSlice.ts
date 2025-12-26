import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RecipesState, SharedRecipe } from '../types';

const initialState: RecipesState = {
  items: [],
  loading: true,
  error: null,
  searchQuery: '',
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes: (state, action: PayloadAction<SharedRecipe[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    updateRecipe: (state, action: PayloadAction<{ id: string; updates: Partial<SharedRecipe> }>) => {
      const index = state.items.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setRecipes, updateRecipe, setLoading, setError, setSearchQuery } = recipesSlice.actions;
export default recipesSlice.reducer;
