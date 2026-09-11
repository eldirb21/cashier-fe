import { axiosInstance } from "../libs";
import { Category, CreateCategory } from "../libs/types";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await axiosInstance.get<{ data: Category[] } | Category[]>(
      `/categories`
    );
    const result = (response.data as any)?.data || response.data;
    return Array.isArray(result) ? result : [];
  },
  getByIdCategory: async (id: string): Promise<Category> => {
    const response = await axiosInstance.get<{ data: Category } | Category>(
      `/categories/${id}`
    );
    return (response.data as any)?.data || response.data;
  },
  createCategory: async (payload: CreateCategory) => {
    const response = await axiosInstance.post<{ data: Category } | Category>(
      `/categories`,
      payload
    );
    return (response.data as any)?.data || response.data;
  },
  updateCategory: async (id: string, payload: Partial<Category>) => {
    const response = await axiosInstance.put<{ data: Category } | Category>(
      `/categories/${id}`,
      payload
    );
    return (response.data as any)?.data || response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },
};
