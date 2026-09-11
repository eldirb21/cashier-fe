import { axiosInstance } from "../libs";
import { CreateSupplier, Supplier } from "../libs/types";

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await axiosInstance.get<{ data: Supplier[] } | Supplier[]>(
      `/supplier`,
    );
    const result = (response.data as any)?.data || response.data;
    return Array.isArray(result) ? result : [];
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<{ data: Supplier & { products?: any[] } }>(
      `/supplier/${id}`,
    );
    return (response.data as any)?.data || response.data;
  },
  create: async (payload: CreateSupplier) => {
    const response = await axiosInstance.post<{ data: Supplier }>(
      `/supplier`,
      payload,
    );
    return (response.data as any)?.data || response.data;
  },
  update: async (id: string, payload: CreateSupplier) => {
    const response = await axiosInstance.put<{ data: Supplier }>(
      `/supplier/${id}`,
      payload,
    );
    return (response.data as any)?.data || response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/supplier/${id}`);
    return response.data;
  },
};
