import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UIState } from '../types';

const initialState: UIState = {
  toastMessage: null,
  toastType: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' }>) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type;
    },
    hideToast: (state) => {
      state.toastMessage = null;
      state.toastType = null;
    },
  },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
