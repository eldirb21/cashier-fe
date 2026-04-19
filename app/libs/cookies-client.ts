import secureLocalStorage from "react-secure-storage";


// GET
export const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));

  return match ? decodeURIComponent(match[2]) : null;
};

// SET
export const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; expires=${expires.toUTCString()}; path=/`;
};

// REMOVE
export const removeCookie = (name: string) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; Max-Age=0; path=/`;
};

export const getLocalStore = (type: string) => {
  return secureLocalStorage.getItem(type);
};

export const setLocalStore = (type: string, value: string) => {
  secureLocalStorage.setItem(type, value);
};

export const removeLocalStore = (type: string) => {
  secureLocalStorage.removeItem(type);
};
