"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme, type Theme } from "@/app/theme";

interface ThemeOption {
  id: Theme;
  label: string;
  icon: string;
  colors: string; // Tailwind classes for the swatch
}

const THEMES: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    icon: "☀️",
    colors: "bg-gray-100 border-gray-300",
  },
  {
    id: "dark",
    label: "Dark",
    icon: "🌙",
    colors: "bg-slate-800 border-slate-600",
  },
  {
    id: "emerald",
    label: "Emerald",
    icon: "🌿",
    colors: "bg-green-600 border-green-800",
  },
  {
    id: "ocean",
    label: "Ocean",
    icon: "🌊",
    colors: "bg-blue-600 border-blue-800",
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

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
  console.log(theme);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Switch theme"
        className="flex items-center justify-between gap-2 w-full capitalize px-4 py-2 text-[12px] font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{current.icon}</span>
          {theme}
        </div>
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
        <div
          className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <p
            className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--fg-muted)" }}
          >
            Theme
          </p>
          {THEMES.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setTheme(opt.id);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] font-semibold transition-colors rounded-lg"
              style={{
                color:
                  theme === opt.id ? "var(--theme-primary)" : "var(--fg-muted)",
                background:
                  theme === opt.id
                    ? "var(--theme-primary-tint)"
                    : "transparent",
              }}
            >
              {/* Color swatch */}
              <span
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${opt.colors}`}
              />
              <span>{opt.label}</span>
              {theme === opt.id && (
                <svg
                  className="w-3 h-3 ml-auto flex-shrink-0"
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
