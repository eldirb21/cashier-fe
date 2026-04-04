export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!document.cookie.split("; ").find((c) => c.startsWith("token="));
}
