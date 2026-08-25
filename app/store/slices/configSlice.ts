import { configService } from "@/app/services/config.service";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";

type ConfCategories = {
  label: string;
  value: string;
};
interface ConfigState {
  data: {
    categories: ConfCategories[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  data: {
    categories: [],
  },
  loading: false,
  error: null,
};

export const fetchConfig = createAsyncThunk("config/fetchConfig", async () => {
  const response = await configService.getConfig();
  return response;
});

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Gagal mengambil data konfigurasi";
      });
  },
});
export const configList = (state: RootState) => state.config.data;
export default configSlice.reducer;
