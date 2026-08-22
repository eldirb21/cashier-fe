import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RoleType } from "@/app/libs/roles";
import { axiosInstance, setCookie, removeCookie, getCookie } from "@/app/libs";
import axios from "axios";

export type User = {
  id: string;
  name: string;
  identifier: string;
  role: RoleType;
};

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
  async (
    payload: { identifier: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await axiosInstance.post("/auth/login", payload);
      const data = res.data?.data;
      if (!data) throw new Error("Data login tidak ditemukan");

      const { accessToken, refreshToken, user } = data;

      if (accessToken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", accessToken);
        }
        setCookie("token", accessToken);
      }

      if (refreshToken) {
        setCookie("refreshToken", refreshToken);
      }

      return user as User;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
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

// dipanggil saat app pertama load (root layout) untuk rehydrate Redux
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/me");
      return res.data?.data?.user as User;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    const refreshToken =
      typeof document !== "undefined" ? getCookie("refreshToken") : null;
    if (refreshToken) {
      await axiosInstance.post("/auth/logout", { refreshToken });
    }
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    removeCookie("token");
    removeCookie("refreshToken");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
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
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Terjadi kesalahan";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isInitialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export const selectIsAuthLoading = (state: any) => state.auth.isLoading;
export const selectCurrentUser = (state: any) => state.auth.user;
export const selectUserRole = (state: any): RoleType | undefined =>
  state.auth.user?.role;
export const selectIsInitialized = (state: any) => state.auth.isInitialized;
export const selectAuthError = (state: any) => state.auth.error;

export default authSlice.reducer;
