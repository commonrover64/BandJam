import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./userSlice";
import modalReducer from "./modalSlice";
import loaderSlice from "./loaderSlice";

const store = configureStore({
  reducer: {
    user: usersReducer,
    modal: modalReducer,
    loader: loaderSlice,
  },
});

export default store;
