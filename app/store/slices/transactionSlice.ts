import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transactionService } from "@/app/services/transaction.service";
import { CreateTransactionRequest, RoleType } from "@/app/libs";
import { RootState } from "..";

interface TransactionState {
  transaction: CreateTransactionRequest | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transaction: null,
  isLoading: false,
  error: null,
};

export const getTransactionList = createAsyncThunk(
  "transaction/list",
  async (payload: string) => {
    return await transactionService.getTransactionList(payload);
  },
);

export const getTransactionSummary = createAsyncThunk(
  "transaction/summary",
  async (query?: string) => {
    return await transactionService.getTransactionSummary(query);
  },
);

export const getTransactionDetail = createAsyncThunk(
  "transaction/detail",
  async (payload: string) => {
    return await transactionService.getTransactionDetail(payload);
  },
);

export const deleteTransactionItem = createAsyncThunk(
  "transaction/deleteItem",
  async (payload: string) => {
    return await transactionService.deleteTransactionItem(payload);
  },
);

export const createTransaction = createAsyncThunk(
  "transaction/create",
  async (payload: CreateTransactionRequest) => {
    return await transactionService.createTransaction(payload);
  },
);

export const updateTransactionStatus = createAsyncThunk(
  "transaction/updateStatus",
  async (payload: string) => {
    return await transactionService.updateTransactionStatus(payload);
  },
);

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transaction = action.payload;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Terjadi kesalahan";
      })

      // Update Transaction Status
      .addCase(updateTransactionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transaction = action.payload;
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Terjadi kesalahan";
      })

      // Delete Transaction Item
      .addCase(deleteTransactionItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransactionItem.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteTransactionItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Terjadi kesalahan";
      })

      // Get Transaction Summary
      .addCase(getTransactionSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transaction = action.payload;
      })
      .addCase(getTransactionSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Terjadi kesalahan";
      })

      // Get Transaction Detail
      .addCase(getTransactionDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transaction = action.payload;
      })
      .addCase(getTransactionDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Terjadi kesalahan";
      })

      // Get Transaction List
      .addCase(getTransactionList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transaction = action.payload;
      })
      .addCase(getTransactionList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Terjadi kesalahan";
      });
  },
});

export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectUserRole = (state: RootState): RoleType | undefined =>
  state.auth.user?.role;
export const selectIsInitialized = (state: RootState) =>
  state.auth.isInitialized;
export const selectAuthError = (state: RootState) => state.auth.error;

export default transactionSlice.reducer;
