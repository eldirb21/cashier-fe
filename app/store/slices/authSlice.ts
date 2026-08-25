import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService, User, LoginPayload } from "@/app/services/auth.service";
import { tokenStorage } from "@/app/libs/token";
import { RoleType } from "@/app/libs/roles";
import type { RootState } from "@/app/store";

export type { User };

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await authService.login(payload);
    } catch (err: any) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses login",
      );
    }
  },
);

// Dipanggil saat app pertama load untuk rehydrate Redux store
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.getCurrentUser();
      return result;
    } catch (err: any) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : "Sesi tidak ditemukan atau kedaluwarsa",
      );
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      tokenStorage.clear();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Terjadi kesalahan";
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isInitialized = true;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectUserRole = (state: RootState): RoleType | undefined =>
  state.auth.user?.role;
export const selectIsInitialized = (state: RootState) =>
  state.auth.isInitialized;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
