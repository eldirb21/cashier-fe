import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transactionService } from "@/app/services/transaction.service";
import {
  CreateTransactionRequest,
  TransactionQueryParams,
  TransactionRecord,
  TransactionSummaryResponse,
} from "@/app/libs";
import { RootState } from "..";

interface TransactionState {
  list: TransactionRecord[];
  summary: TransactionSummaryResponse | null;
  currentTransaction: TransactionRecord | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  list: [],
  summary: null,
  currentTransaction: null,
  isLoading: false,
  error: null,
};

export const getTransactionList = createAsyncThunk(
  "transaction/list",
  async (payload?: TransactionQueryParams | string) => {
    const res = await transactionService.getTransactionList(payload);
    return res.data;
  },
);

export const getTransactionSummary = createAsyncThunk(
  "transaction/summary",
  async (params?: { date_from?: string; date_to?: string }) => {
    const res = await transactionService.getTransactionSummary(params);
    return res.data;
  },
);

export const getTransactionDetail = createAsyncThunk(
  "transaction/detail",
  async (payload: string) => {
    const res = await transactionService.getTransactionDetail(payload);
    return res.data;
  },
);

export const deleteTransaction = createAsyncThunk(
  "transaction/delete",
  async (payload: string) => {
    await transactionService.deleteTransaction(payload);
    return payload;
  },
);

export const createTransaction = createAsyncThunk(
  "transaction/create",
  async (payload: CreateTransactionRequest) => {
    const res = await transactionService.createTransaction(payload);
    return res.data;
  },
);

export const updateTransactionStatus = createAsyncThunk(
  "transaction/updateStatus",
  async (payload: {
    id: string;
    status: "pending" | "completed" | "cancelled";
    notes?: string;
  }) => {
    const res = await transactionService.updateTransactionStatus(
      payload.id,
      payload,
    );
    return res.data;
  },
);

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    clearTransactionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.unshift(action.payload);
        state.currentTransaction = action.payload;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.error.message as string) ?? "Gagal membuat transaksi";
      })

      // Update Transaction Status
      .addCase(updateTransactionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload;
        const idx = state.list.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.error.message as string) ?? "Gagal update status transaksi";
      })

      // Delete Transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.error.message as string) ?? "Gagal menghapus transaksi";
      })

      // Get Transaction Summary
      .addCase(getTransactionSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(getTransactionSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.error.message as string) ?? "Gagal mengambil rekap transaksi";
      })

      // Get Transaction Detail
      .addCase(getTransactionDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(getTransactionDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.error.message as string) ?? "Gagal mengambil detail transaksi";
      })

      // Get Transaction List
      .addCase(getTransactionList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(getTransactionList.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.error.message as string) ?? "Gagal mengambil daftar transaksi";
      });
  },
});

export const { clearCurrentTransaction, clearTransactionError } =
  transactionSlice.actions;

export const selectTransactions = (state: RootState) =>
  state.transaction?.list ?? [];
export const selectTransactionSummary = (state: RootState) =>
  state.transaction?.summary ?? null;
export const selectCurrentTransaction = (state: RootState) =>
  state.transaction?.currentTransaction ?? null;
export const selectIsTransactionLoading = (state: RootState) =>
  state.transaction?.isLoading ?? false;
export const selectTransactionError = (state: RootState) =>
  state.transaction?.error ?? null;

export default transactionSlice.reducer;

