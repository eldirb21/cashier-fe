import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { productService } from "@/app/services/product.service";
import { PaginationRequest, PaginationResponse, Product } from "@/app/libs";
import { RootState } from "..";

export const getProduct = createAsyncThunk(
  "product/getProduct",
  async (params?: PaginationRequest) => {
    const response = await productService.getAll(params);
    return response;
  },
);

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (payload: Product) => {
    const response = await productService.create(payload);
    return response;
  },
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async (payload: Product) => {
    const response = await productService.update(payload.id, payload);
    return response;
  },
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (payload: Product) => {
    const response = await productService.delete(payload.id);
    return response;
  },
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    product: [] as Product[],
    pagination: {} as PaginationResponse,
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.product = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message as string;
      });
  },
});
export const productList = (state: RootState) => state.product.product;

export const productPagination = (state: RootState) => state.product.pagination;

export const selectProduct = (state: RootState) => state.product.product;
export default productSlice.reducer;
