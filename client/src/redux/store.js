import { configureStore } from "@reduxjs/toolkit";
import userReducers from "./userSlice";
import loaderReducer from "./loaderSlice"

const store = configureStore({
  reducer: {
    user: userReducers,
    loader: loaderReducer,
  },
});

export default store;
