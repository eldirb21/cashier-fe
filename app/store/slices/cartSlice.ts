// app/store/slices/cartSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/app/store"; // sesuaikan path store type
import { clearSessionId, getOrCreateSessionId } from "@/app/libs/cartSession";
import { axiosInstance } from "@/app/libs";

type CartProduct = {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
};

export type CartItemType = {
  id: number;
  product: CartProduct;
  qty: number;
  price: number;
  subtotal: number;
};

type CartState = {
  cartId: number | null;
  items: CartItemType[];
  loading: boolean;
  error: string | null;
};

const initialState: CartState = {
  cartId: null,
  items: [],
  loading: false,
  error: null,
};

const cartHeaders = () => ({
  headers: { "X-Cart-Session-Id": getOrCreateSessionId() },
});

export const getCart = createAsyncThunk(
  "cart/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/cart", cartHeaders());
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Gagal mengambil cart",
      );
    }
  },
);

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async (
    { product_id, qty = 1 }: { product_id: string; qty?: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await axiosInstance.post(
        "/cart/items",
        { product_id, qty },
        cartHeaders(),
      );
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Gagal menambah item",
      );
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ id, qty }: { id: number; qty: number }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/cart/items/${id}`, { qty });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Gagal update item",
      );
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/cart/items/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Gagal menghapus item",
      );
    }
  },
);

export const mergeCart = createAsyncThunk(
  "cart/mergeCart",
  async (_, { rejectWithValue }) => {
    try {
      const sessionId = getOrCreateSessionId();
      const res = await axiosInstance.post("/cart/merge", {
        session_id: sessionId,
      });
      clearSessionId();
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Gagal menggabungkan cart",
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getCart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartId = action.payload.cart_id;
        state.items = action.payload.items;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // addCartItem
      .addCase(addCartItem.pending, (state) => {
        state.error = null;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.cartId = action.payload.cart_id;
        state.items = action.payload.items;
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // updateCartItem
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // removeCartItem
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // mergeCart
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
      });
  },
});

export const { clearCartError } = cartSlice.actions;

export const cartList = (state: RootState) => state.cart.items;
export const cartLoading = (state: RootState) => state.cart.loading;
export const cartError = (state: RootState) => state.cart.error;

export default cartSlice.reducer;
