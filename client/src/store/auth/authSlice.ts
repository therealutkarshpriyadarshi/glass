import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { User, SignUpData, SignInData } from "./types";
import { apiCall } from "../../api/server";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (userData: SignUpData) => {
    return await apiCall<{ user: User; token: string }>({
      url: "/users/register",
      method: "POST",
      data: userData,
    });
  }
);

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials: SignInData) => {
    return await apiCall<{ user: User; token: string }>({
      url: "/users/login",
      method: "POST",
      data: credentials,
    });
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message ?? "An error occurred during sign up";
      })
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message ?? "An error occurred during sign in";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
