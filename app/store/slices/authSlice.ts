import {
  ApiErrorResponse,
  AuthResponse,
  AuthState,
  axiosInstance,
  LoginCredentials,
  setCookie,
  removeCookie,
  User,
} from "@/app/libs";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../index";

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  token: null,
};

export const loginUser = createAsyncThunk<
  { user: User; token: string; refreshToken: string },
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      credentials,
    );

    const responseData = res.data;

    const token = responseData?.data?.accessToken;
    const refreshToken = responseData?.data?.refreshToken;
    const user = responseData?.data?.user;

    if (token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }
      setCookie("token", token);
    }
    if (refreshToken) {
      setCookie("refreshToken", refreshToken);
    }

    return { user, token, refreshToken };
  } catch (err) {
    console.error("Login Thunk Error:", err);
    if (axios.isAxiosError<ApiErrorResponse>(err)) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login gagal. Periksa email dan password Anda.";
      return rejectWithValue(message);
    }
    return rejectWithValue(
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat memproses login",
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      removeCookie("token");
      removeCookie("refreshToken");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Terjadi kesalahan";
      });
  },
});

export const { logout, clearError } = authSlice.actions;

// Encapsulated Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;
