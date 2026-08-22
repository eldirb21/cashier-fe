"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { HiChevronDown, HiChevronRight } from "react-icons/hi";

interface SidebarItemProps {
  item: {
    key: string;
    name: string;
    path?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    hasSub?: boolean;
    sub?: { name: string; path?: string; key: string }[];
  };
  pathname: string;
  isCollapsed: boolean;
}

export default function SidebarItem({
  item,
  pathname,
  isCollapsed,
}: SidebarItemProps) {
  const isSubActive = Boolean(
    item.sub?.some((s) => s.path && pathname.startsWith(s.path)),
  );
  const isDirectActive = Boolean(item.path && pathname.startsWith(item.path));
  const isActive = isDirectActive || isSubActive;

  const [open, setOpen] = useState(isSubActive || false);
  const [showFlyout, setShowFlyout] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const Icon = item.icon;

  useEffect(() => {
    if (isSubActive) {
      setOpen(true);
    }
  }, [pathname, isSubActive]);

  // ── COLLAPSED MODE ──────────────────────────────────────────
  if (isCollapsed) {
    if (item.hasSub) {
      return (
        <div
          className="relative group flex justify-center py-1"
          onMouseEnter={() => setShowFlyout(true)}
          onMouseLeave={() => setShowFlyout(false)}
          ref={flyoutRef}
        >
          <button
            onClick={() => setShowFlyout((v) => !v)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-gradient-to-r from-[#2E2882] to-[#4338CA] text-white shadow-lg shadow-indigo-950/60 border border-indigo-400/30 scale-105"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon size={20} />
          </button>

          {/* Collapsed Flyout / Tooltip for Submenu */}
          {showFlyout && (
            <div className="absolute left-full ml-3.5 top-0 z-50 min-w-48 bg-[#12132D] border border-indigo-500/30 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              {/* Arrow pointer */}
              <div className="absolute -left-1.5 top-4 w-3 h-3 bg-[#12132D] rotate-45 border-l border-b border-indigo-500/30" />

              <div className="px-3 py-1.5 border-b border-white/10 mb-1.5 flex items-center gap-2 text-white font-bold text-xs">
                <Icon size={14} className="text-indigo-400" />
                <span>{item.name}</span>
              </div>

              <div className="space-y-1">
                {item.sub?.map((s) => {
                  const isCurrent = Boolean(s.path && pathname.startsWith(s.path));
                  return (
                    <Link
                      key={s.path || s.key}
                      href={s.path || "#"}
                      className={`block px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isCurrent
                          ? "bg-indigo-600 text-white font-semibold shadow-md"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {s.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Direct link in collapsed mode
    return (
      <div className="relative group flex justify-center py-1">
        <Link
          href={item.path || "#"}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isActive
              ? "bg-gradient-to-r from-[#2E2882] to-[#4338CA] text-white shadow-lg shadow-indigo-950/60 border border-indigo-400/30 scale-105"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Icon size={20} />
        </Link>

        {/* Floating Tooltip matching the screenshot with left-pointing arrow */}
        <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1B194B] text-white text-xs font-semibold rounded-lg shadow-2xl border border-indigo-400/30 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 flex items-center">
          <div className="absolute -left-1 w-2 h-2 bg-[#1B194B] rotate-45 border-l border-b border-indigo-400/30" />
          {item.name}
        </div>
      </div>
    );
  }

  // ── EXPANDED MODE ───────────────────────────────────────────
  if (item.hasSub) {
    return (
      <div className="py-0.5">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-gradient-to-r from-[#2E2882] to-[#4338CA] text-white shadow-md shadow-indigo-950/40 border border-indigo-400/20 font-semibold"
              : "text-gray-300 hover:text-white hover:bg-white/5 font-medium"
          }`}
        >
          <span className="flex items-center gap-3">
            <Icon size={19} className={isActive ? "text-white" : "text-gray-400"} />
            <span className="truncate">{item.name}</span>
          </span>
          <span className="text-gray-400 transition-transform duration-200">
            {open ? <HiChevronDown size={16} /> : <HiChevronRight size={16} />}
          </span>
        </button>

        {/* Sub-menu accordion */}
        {open && (
          <div className="ml-4 pl-3 mt-1 space-y-1 border-l border-white/10 animate-in slide-in-from-top-2 duration-150">
            {item.sub?.map((s) => {
              const isCurrent = Boolean(s.path && pathname.startsWith(s.path));
              return (
                <Link
                  key={s.path || s.key}
                  href={s.path || "#"}
                  className={`block px-3 py-1.5 rounded-lg text-xs transition-all ${
                    isCurrent
                      ? "bg-indigo-600/80 text-white font-semibold shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-white/5 font-medium"
                  }`}
                >
                  {s.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-0.5">
      <Link
        href={item.path || "#"}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-[#2E2882] to-[#4338CA] text-white shadow-md shadow-indigo-950/40 border border-indigo-400/20 font-semibold"
            : "text-gray-300 hover:text-white hover:bg-white/5 font-medium"
        }`}
      >
        <Icon size={19} className={isActive ? "text-white" : "text-gray-400"} />
        <span className="truncate">{item.name}</span>
      </Link>
    </div>
  );
}
