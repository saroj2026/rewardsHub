import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Mirrors the `User` entity from the TRD §6 data model.
export type User = {
  id: string;
  phone: string | null;
  email: string | null;
  authProvider: "otp" | "google" | "apple" | "guest" | null;
  householdId: string | null;
};

type UserState = {
  current: User | null;
  isAuthenticated: boolean;
};

const initialState: UserState = {
  current: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<User>) {
      state.current = action.payload;
      state.isAuthenticated = true;
    },
    signedOut(state) {
      state.current = null;
      state.isAuthenticated = false;
    },
  },
});

export const { signedIn, signedOut } = userSlice.actions;
export default userSlice.reducer;
