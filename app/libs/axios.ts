import axios, { AxiosError } from "axios";
import { tokenStorage } from "./token";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - otomatis menyisipkan token jika ada
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - normalisasi pesan error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Terjadi kesalahan saat memproses permintaan";

    if (message === "Access token kedaluwarsa") {
      tokenStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(new Error(message));
  },
);

export { axiosInstance };
