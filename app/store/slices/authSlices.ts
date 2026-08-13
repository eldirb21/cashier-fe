import {
  ApiErrorResponse,
  AuthResponse,
  AuthState,
  axiosInstance,
  LoginCredentials,
  setCookie,
  removeCookie,
} from "@/app/libs";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  token: null,
};

// Async thunk - untuk API call
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const [res] = await Promise.all([
        axiosInstance.post<AuthResponse>("/auth/login", credentials),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      const responseData = res.data;

      const token = responseData?.data?.accessToken;
      const refreshToken = responseData?.data?.refreshToken;
      const user = responseData?.data?.user;

      if (token) {
        localStorage.setItem("token", token);
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
  },
);

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
  // Menangani status async thunk
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
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
