"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import id, { type Translations } from "./translations/id";
import en from "./translations/en";
import zh from "./translations/zh";

export type Locale = "id" | "en" | "zh";

const STORAGE_KEY = "cashier-locale";
const DEFAULT_LOCALE: Locale = "id";

const localeMap: Record<Locale, Translations> = { id, en, zh };

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in localeMap) return saved;
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_LOCALE;
}

function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function applyLangToDom(locale: Locale) {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.setAttribute("lang", locale);
  }
}

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  t: id,
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const storedLocale = useSyncExternalStore(
    subscribe,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  const [overrideLocale, setOverrideLocale] = useState<Locale | null>(null);
  const activeLocale = overrideLocale ?? storedLocale;

  useEffect(() => {
    applyLangToDom(activeLocale);
  }, [activeLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setOverrideLocale(newLocale);
    applyLangToDom(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        locale: activeLocale,
        t: localeMap[activeLocale],
        setLocale,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  return useContext(LanguageContext);
}
