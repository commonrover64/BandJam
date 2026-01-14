import { createSlice } from "@reduxjs/toolkit";

const loaderSlice = createSlice({
  name: "isLoading",
  initialState: {
    isLoading: false,
  },

  reducers: {
    showLoading: (state) => {
      state.isLoading = true;
    },

    hideLoading: (state) => {
      state.isLoading = false;
    },
  },
});

export const { showLoading, hideLoading } = loaderSlice.actions;
export default loaderSlice.reducer;
