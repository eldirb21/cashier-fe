import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { categoryService } from "@/app/services/category.service";
import { Category } from "@/app/libs";
import { RootState } from "..";

export const getCategoryProduct = createAsyncThunk(
  "categories/categoryProduct",
  async () => {
    const response = await categoryService.getAll();
    return response;
  },
);

export const createCategoryProduct = createAsyncThunk(
  "category/createCategoryProduct",
  async (payload: Category) => {
    const response = await categoryService.createCategory(payload);
    return response;
  },
);

export const updateCategoryProduct = createAsyncThunk(
  "category/updateCategoryProduct",
  async (payload: Category) => {
    const response = await categoryService.updateCategory(payload.id, payload);
    return response;
  },
);

export const deleteCategoryProduct = createAsyncThunk(
  "category/deleteCategoryProduct",
  async (payload: Category) => {
    const response = await categoryService.deleteCategory(payload.id);
    return response;
  },
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    category: [] as Category[],
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategoryProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.category = action.payload;
      })
      .addCase(getCategoryProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message as string;
      });
  },
});

export const categoryList = (state: RootState) => state.category.category;
export default categorySlice.reducer;
