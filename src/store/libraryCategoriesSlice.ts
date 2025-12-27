import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LibraryCategoryState, DietaryFilter } from '../types';

const initialState: LibraryCategoryState = {
  dietaryFilters: [],
  activeDietaryFilterId: null,
  loading: true,
  error: null,
};

const libraryCategoriesSlice = createSlice({
  name: 'libraryCategories',
  initialState,
  reducers: {
    setDietaryFilters: (state, action: PayloadAction<DietaryFilter[]>) => {
      state.dietaryFilters = action.payload;
      state.loading = false;
    },
    addDietaryFilter: (state, action: PayloadAction<DietaryFilter>) => {
      state.dietaryFilters.push(action.payload);
    },
    updateDietaryFilter: (state, action: PayloadAction<DietaryFilter>) => {
      const index = state.dietaryFilters.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.dietaryFilters[index] = action.payload;
      }
    },
    removeDietaryFilter: (state, action: PayloadAction<string>) => {
      state.dietaryFilters = state.dietaryFilters.filter(f => f.id !== action.payload);
      if (state.activeDietaryFilterId === action.payload) {
        state.activeDietaryFilterId = null;
      }
    },
    setActiveDietaryFilter: (state, action: PayloadAction<string | null>) => {
      state.activeDietaryFilterId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setDietaryFilters,
  addDietaryFilter,
  updateDietaryFilter,
  removeDietaryFilter,
  setActiveDietaryFilter,
  setLoading,
  setError,
} = libraryCategoriesSlice.actions;

export default libraryCategoriesSlice.reducer;
