const SESSION_KEY = "cart_session_id";

export const getOrCreateSessionId = (): string => {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const clearSessionId = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
};
