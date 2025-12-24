import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LibraryState, LibraryRecipe, Category } from '../types';

const initialState: LibraryState = {
  items: [],
  loading: true,
  error: null,
  selectedCategory: 'all',
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setLibraryRecipes: (state, action: PayloadAction<LibraryRecipe[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedCategory: (state, action: PayloadAction<Category | 'all'>) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setLibraryRecipes, setLoading, setError, setSelectedCategory } = librarySlice.actions;
export default librarySlice.reducer;
