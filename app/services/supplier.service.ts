import { axiosInstance } from "../libs";
import { CreateSupplier, Supplier } from "../libs/types";

export const supplierService = {
  getAll: async () => {
    const response = await axiosInstance.get<Supplier[]>(`/suppliers`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<Supplier>(`/suppliers/${id}`);
    return response;
  },
  create: async (payload: CreateSupplier) => {
    const response = await axiosInstance.post<Supplier>(`/suppliers`, payload);
    return response;
  },
  update: async (id: string, payload: CreateSupplier) => {
    const response = await axiosInstance.put<Supplier>(
      `/suppliers/${id}`,
      payload,
    );
    return response;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete<Supplier>(`/suppliers/${id}`);
    return response;
  },
};
