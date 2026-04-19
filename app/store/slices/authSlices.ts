import {
  ApiErrorResponse,
  AuthResponse,
  AuthState,
  axiosInstance,
  LoginCredentials,
} from "@/app/libs";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

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
      const { data } = await axiosInstance.post<AuthResponse>(
        "/auth/login",
        credentials,
      );

      const token = data?.data?.accessToken;
      const refreshToken = data?.data?.refreshToken;
      const user = data.data.user;

      localStorage.setItem("token", data?.data?.accessToken);

      return { user, token, refreshToken };
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
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
