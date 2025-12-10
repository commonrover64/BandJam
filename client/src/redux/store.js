import { configureStore } from "@reduxjs/toolkit";
import usersReducers from "./userSlice";
import loaderReducer from "./loaderSlice";

const store = configureStore({
  reducer: {
    user: usersReducers,
    loader: loaderReducer,
  },
});

export default store;
