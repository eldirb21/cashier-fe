import { axiosInstance } from "@/app/libs/axios";
import {
  CreateTransactionRequest,
  TransactionQueryParams,
  TransactionRecord,
  TransactionSummaryResponse,
} from "../libs";

export const transactionService = {
  async getTransactionList(params?: TransactionQueryParams | string): Promise<{
    success: boolean;
    message: string;
    data: TransactionRecord[];
  }> {
    const query = typeof params === "string" ? { search: params } : params;
    const res = await axiosInstance.get(`/transactions`, {
      params: query,
    });
    return res.data;
  },

  async getTransactionSummary(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: TransactionSummaryResponse;
  }> {
    const res = await axiosInstance.get(`/transactions/summary`, {
      params,
    });
    return res.data;
  },

  async getTransactionDetail(id: string): Promise<{
    success: boolean;
    message: string;
    data: TransactionRecord;
  }> {
    const res = await axiosInstance.get(`/transactions/${id}`);
    return res.data;
  },

  async deleteTransaction(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const res = await axiosInstance.delete(`/transactions/${id}`);
    return res.data;
  },

  async createTransaction(payload: CreateTransactionRequest): Promise<{
    success: boolean;
    message: string;
    data: TransactionRecord;
  }> {
    const res = await axiosInstance.post(`/transactions`, payload);
    return res.data;
  },

  async updateTransactionStatus(
    id: string,
    payload: { status: "pending" | "completed" | "cancelled"; notes?: string } | string,
  ): Promise<{
    success: boolean;
    message: string;
    data: TransactionRecord;
  }> {
    const body =
      typeof payload === "string" ? { status: payload } : payload;
    const res = await axiosInstance.patch(`/transactions/${id}/status`, body);
    return res.data;
  },
};

