"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark" | "emerald" | "ocean";

const STORAGE_KEY = "cashier-theme";
const DEFAULT_THEME: Theme = "light";
const VALID_THEMES: Theme[] = ["light", "dark", "emerald", "ocean"];

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved && VALID_THEMES.includes(saved)) return saved;
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_THEME;
}

function getServerThemeSnapshot(): Theme {
  return DEFAULT_THEME;
}

function applyThemeToDom(theme: Theme) {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storedTheme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const [overrideTheme, setOverrideTheme] = useState<Theme | null>(null);
  const activeTheme = overrideTheme ?? storedTheme;

  useEffect(() => {
    applyThemeToDom(activeTheme);
  }, [activeTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setOverrideTheme(newTheme);
    applyThemeToDom(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore quota/security errors
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
