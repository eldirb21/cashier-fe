import { axiosInstance } from "../libs";
import {
  CreateProduct,
  PaginationRequest,
  Product,
  ProductListResponse,
} from "../libs/types";

export const productService = {
  getAll: async (params?: PaginationRequest): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>("/products", {
      params,
    });

    return response.data;
  },
  getSearch: async (search: string) => {
    const response = await axiosInstance.get<{ data: Product[] }>(
      `/products?search=${search}`,
    );
    return response;
  },
  getById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get<{ data: Product } | Product>(`/products/${id}`);
    return (response.data as any)?.data || response.data;
  },
  create: async (payload: CreateProduct): Promise<Product> => {
    const response = await axiosInstance.post<{ data: Product } | Product>(`/products`, payload);
    return (response.data as any)?.data || response.data;
  },
  update: async (id: string, payload: Partial<Product>): Promise<Product> => {
    const response = await axiosInstance.put<{ data: Product } | Product>(
      `/products/${id}`,
      payload,
    );
    return (response.data as any)?.data || response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },
};
