import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ShoppingListState, ShoppingItem, CustomCategory } from '../types';

const initialState: ShoppingListState = {
  items: [],
  customCategories: [],
  loading: true,
  error: null,
};

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    setShoppingItems: (state, action: PayloadAction<ShoppingItem[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    addShoppingItem: (state, action: PayloadAction<ShoppingItem>) => {
      state.items.push(action.payload);
    },
    updateShoppingItem: (state, action: PayloadAction<{ id: string; updates: Partial<ShoppingItem> }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    removeShoppingItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleItemChecked: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        state.items[index].isChecked = !state.items[index].isChecked;
      }
    },
    toggleItemFavorite: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        state.items[index].isFavorite = !state.items[index].isFavorite;
      }
    },
    clearCheckedItems: (state) => {
      state.items = state.items.filter(item => !item.isChecked);
    },
    uncheckAllItems: (state) => {
      state.items.forEach(item => {
        item.isChecked = false;
      });
    },
    setCustomCategories: (state, action: PayloadAction<CustomCategory[]>) => {
      state.customCategories = action.payload;
    },
    addCustomCategory: (state, action: PayloadAction<CustomCategory>) => {
      state.customCategories.push(action.payload);
    },
    removeCustomCategory: (state, action: PayloadAction<string>) => {
      state.customCategories = state.customCategories.filter(cat => cat.id !== action.payload);
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
  setShoppingItems,
  addShoppingItem,
  updateShoppingItem,
  removeShoppingItem,
  toggleItemChecked,
  toggleItemFavorite,
  clearCheckedItems,
  uncheckAllItems,
  setCustomCategories,
  addCustomCategory,
  removeCustomCategory,
  setLoading,
  setError,
} = shoppingSlice.actions;

export default shoppingSlice.reducer;
