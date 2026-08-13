"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import id, { type Translations } from "./translations/id";
import en from "./translations/en";
import zh from "./translations/zh";

export type Locale = "id" | "en" | "zh";

const STORAGE_KEY = "cashier-locale";

const localeMap: Record<Locale, Translations> = { id, en, zh };

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "id",
  t: id,
  setLocale: () => {},
});

function applyLangToDom(locale: Locale) {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.setAttribute("lang", locale);
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in localeMap) {
      setLocaleState(saved);
      applyLangToDom(saved);
    } else {
      applyLangToDom("id");
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    applyLangToDom(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{ locale, t: localeMap[locale], setLocale }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  return useContext(LanguageContext);
}
