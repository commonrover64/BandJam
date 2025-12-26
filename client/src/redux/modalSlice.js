import { createSlice } from "@reduxjs/toolkit";

const modalSlice = createSlice({
  name: "isModalOpen",
  initialState: {
    isModalOpen: false,
  },

  reducers: {
    showModal: (state) => {
      state.isModalOpen = true;
    },

    hideModal: (state) => {
      state.isModalOpen = false;
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;
export default modalSlice.reducer;
