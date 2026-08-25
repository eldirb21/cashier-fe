import { axiosInstance } from "../libs";
import { Category, CreateCategory } from "../libs/types";

export const categoryService = {
  getAll: async () => {
    const response = await axiosInstance.get<{ data: Category[] }>(
      `/categories`,
    );

    return response.data.data;
  },
  getByIdCategory: async (id: string) => {
    const response = await axiosInstance.get<Category>(`/categories/${id}`);
    return response;
  },
  createCategory: async (payload: CreateCategory) => {
    const response = await axiosInstance.post<Category>(`/categories`, payload);
    return response;
  },
  updateCategory: async (id: string, payload: Category) => {
    const response = await axiosInstance.put<Category>(
      `/categories/${id}`,
      payload,
    );
    return response;
  },
  deleteCategory: async (id: string) => {
    const response = await axiosInstance.delete<Category>(`/categories/${id}`);
    return response;
  },
};
