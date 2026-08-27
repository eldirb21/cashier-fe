import { axiosInstance } from "@/app/libs/axios";
import { CreateTransactionRequest } from "../libs";

export const transactionService = {
  async getTransactionList(search: string) {
    const res = await axiosInstance.get(`/transactions?search=${search}`);
    return res.data;
  },

  async getTransactionSummary(query?: string) {
    const res = await axiosInstance.get(
      `/transactions/summary?date_from=2026-08-01&date_to=2026-08-31`,
    );
    return res.data;
  },

  async getTransactionDetail(id: string) {
    const res = await axiosInstance.get(`/transactions/${id}`);
    return res.data;
  },

  async deleteTransactionItem(id: string) {
    const res = await axiosInstance.delete(`/transactions/${id}`);
    return res.data;
  },

  async createTransaction(payload: CreateTransactionRequest) {
    const res = await axiosInstance.post(`/transactions`, payload);
    return res.data;
  },

  async updateTransactionStatus(id: string) {
    const res = await axiosInstance.post(`/transactions/${id}/payment`);
    return res.data;
  },
};
