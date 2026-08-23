import { setCookie, getCookie, removeCookie } from "./cookies-client";

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return getCookie("token") || localStorage.getItem("token");
  },
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return getCookie("refreshToken");
  },
  set: (accessToken: string, refreshToken?: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", accessToken);
    }
    setCookie("token", accessToken);
    if (refreshToken) {
      setCookie("refreshToken", refreshToken);
    }
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    removeCookie("token");
    removeCookie("refreshToken");
  },
};
