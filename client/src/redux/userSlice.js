import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "users",
  initialState: {
    // user: "test",
    user: {
      _id: null,
      name: null,
      password: null,
      role: null,
    } 
    // need to implement redux-persist or use localStore. 
    // if set null then profile loads for 1st time only and gets null after refresh
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
