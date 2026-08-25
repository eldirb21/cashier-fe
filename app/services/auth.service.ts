import { axiosInstance } from "@/app/libs/axios";
import { tokenStorage } from "@/app/libs/token";
import { RoleType } from "@/app/libs/roles";

export type User = {
  id: string;
  name: string;
  identifier?: string;
  email?: string;
  username?: string;
  role: RoleType;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export interface LoginResponseData {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export const authService = {
  /**
   * Login user dan simpan access token & refresh token
   */
  async login(payload: LoginPayload): Promise<User> {
    const res = await axiosInstance.post<LoginResponseData>(
      "/auth/login",
      payload,
    );
    const data = res.data;

    if (!data || !data.user) {
      throw new Error("Data login tidak ditemukan");
    }

    const { accessToken, refreshToken, user } = data;
    tokenStorage.set(accessToken, refreshToken);

    return user;
  },

  /**
   * Mengambil data user yang sedang aktif
   */
  async getCurrentUser(): Promise<User> {
    const res = await axiosInstance.get<{
      user: User;
      success: boolean;
      message: string;
    }>("/auth/me");
    const user = res.data?.user;

    if (!user) {
      throw new Error("Data pengguna tidak valid");
    }

    return user;
  },

  /**
   * Logout user ke server dan membersihkan token lokal
   */
  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await axiosInstance.post("/auth/logout", { refreshToken });
      }
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      tokenStorage.clear();
    }
  },
};
