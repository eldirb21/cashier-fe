import { axiosInstance } from "../libs";
import { Customer } from "../libs/types";

export interface CustomerQueryParams {
  search?: string;
  member_level?: string;
  is_active?: boolean | string;
}

export const customerService = {
  getAll: async (params?: CustomerQueryParams): Promise<Customer[]> => {
    const response = await axiosInstance.get<{ data: Customer[] } | Customer[]>(
      `/customers`,
      { params }
    );
    const result = (response.data as any)?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await axiosInstance.get<{ data: Customer }>(
      `/customers/${id}`
    );
    return (response.data as any)?.data || response.data;
  },

  create: async (payload: Partial<Customer>): Promise<Customer> => {
    const response = await axiosInstance.post<{ data: Customer }>(
      `/customers`,
      payload
    );
    return (response.data as any)?.data || response.data;
  },

  update: async (id: string, payload: Partial<Customer>): Promise<Customer> => {
    const response = await axiosInstance.put<{ data: Customer }>(
      `/customers/${id}`,
      payload
    );
    return (response.data as any)?.data || response.data;
  },

  addPoints: async (id: string, payload: { points: number; spending?: number }): Promise<Customer> => {
    const response = await axiosInstance.patch<{ data: Customer }>(
      `/customers/${id}/points/add`,
      payload
    );
    return (response.data as any)?.data || response.data;
  },

  redeemPoints: async (id: string, payload: { points: number }): Promise<Customer> => {
    const response = await axiosInstance.patch<{ data: Customer }>(
      `/customers/${id}/points/redeem`,
      payload
    );
    return (response.data as any)?.data || response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/customers/${id}`);
    return response.data;
  },
};
