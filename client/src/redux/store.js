import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./userSlice";
import modalReducer from "./modalSlice";

const store = configureStore({
  reducer: {
    user: usersReducer,
    modal: modalReducer,
  },
});

export default store;
