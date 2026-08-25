import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supplierService } from "@/app/services/supplier.service";
import { Supplier } from "@/app/libs";
import { RootState } from "..";

export const getSupplier = createAsyncThunk(
  "supplier/getSupplier",
  async () => {
    const response = await supplierService.getAll();
    return response;
  },
);

export const createSupplier = createAsyncThunk(
  "supplier/createSupplier",
  async (payload: Supplier) => {
    const response = await supplierService.create(payload);
    return response;
  },
);

export const updateSupplier = createAsyncThunk(
  "supplier/updateSupplier",
  async (payload: Supplier) => {
    const response = await supplierService.update(payload.id, payload);
    return response;
  },
);

export const deleteSupplier = createAsyncThunk(
  "supplier/deleteSupplier",
  async (id: string) => {
    const response = await supplierService.delete(id);
    return response;
  },
);

const supplierSlice = createSlice({
  name: "supplier",
  initialState: {
    supplier: [] as Supplier[],
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSupplier.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.supplier = action.payload;
      })
      .addCase(getSupplier.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message as string;
      });
  },
});

export const selectSupplier = (state: RootState) => state.supplier.supplier;
export default supplierSlice.reducer;
