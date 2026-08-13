"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n, type Locale } from "@/app/i18n";

const FLAGS: Record<Locale, string> = {
  id: "🇮🇩",
  en: "🇬🇧",
  zh: "🇨🇳",
};

const LOCALES: Locale[] = ["id", "en", "zh"];

interface Props {
  /** visual variant – default is "dropdown" */
  variant?: "dropdown" | "pill";
}

export function LanguageSwitcher({ variant = "dropdown" }: Props) {
  const { locale, t, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (variant === "pill") {
    return (
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full">
        {LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            title={t.language[loc]}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 ${
              locale === loc
                ? "bg-white shadow text-brand-primary scale-105"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{FLAGS[loc]}</span>
            <span className="hidden sm:inline">{loc.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  // Default: dropdown variant
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white/80 hover:bg-white hover:border-brand-primary/40 text-[12px] font-semibold text-gray-600 hover:text-brand-primary transition-all duration-200 shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{FLAGS[locale]}</span>
        <span>{locale.toUpperCase()}</span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {t.language.label}
          </p>
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                setOpen(false);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-[12px] font-semibold transition-colors ${
                locale === loc
                  ? "text-brand-primary bg-brand-primary/5"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className="text-base">{FLAGS[loc]}</span>
              <span>{t.language[loc]}</span>
              {locale === loc && (
                <svg
                  className="w-3 h-3 ml-auto text-brand-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
