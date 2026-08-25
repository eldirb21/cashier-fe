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
  getById: async (id: string) => {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response;
  },
  create: async (payload: CreateProduct) => {
    const response = await axiosInstance.post<Product>(`/products`, payload);
    return response;
  },
  update: async (id: string, payload: Product) => {
    const response = await axiosInstance.put<Product>(
      `/products/${id}`,
      payload,
    );
    return response;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete<Product>(`/products/${id}`);
    return response;
  },
};
