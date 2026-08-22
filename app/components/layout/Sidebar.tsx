// app/components/layout/Sidebar.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  logoutUser,
  selectCurrentUser,
  selectUserRole,
} from "@/app/store/slices/authSlice";
import { ICONS } from "@/app/libs/menu-config";
import { getMenuForRole } from "@/app/libs/permissions";
import { useI18n } from "@/app/i18n";
import SidebarItem from "./SidebarItem";
import {
  HiOutlineSearch,
  HiOutlineLogout,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineSparkles,
} from "react-icons/hi";

export default function Sidebar() {
  const role = useAppSelector(selectUserRole);
  const user = useAppSelector(selectCurrentUser);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useI18n();

  // Collapsible state with initial hydration safety
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace("/login");
  };

  const rawMenuItems = useMemo(() => {
    if (!role) return [];
    return getMenuForRole(role).map((item) => ({
      ...item,
      name: t.nav[item.key as keyof typeof t.nav] || item.key,
      icon: ICONS[item.icon] || ICONS.cube,
      sub: item.sub?.map((s) => ({
        ...s,
        name: t.nav[s.key as keyof typeof t.nav] || s.key,
      })),
    }));
  }, [role, t]);

  // Filter items if user types in search box
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return rawMenuItems;
    const query = searchQuery.toLowerCase();
    return rawMenuItems.filter((item) => {
      const matchParent = item.name.toLowerCase().includes(query);
      const matchSub = item.sub?.some((s) =>
        s.name.toLowerCase().includes(query),
      );
      return matchParent || matchSub;
    });
  }, [rawMenuItems, searchQuery]);

  // Group items by section
  const sections = useMemo(() => {
    const map = new Map<string, typeof filteredMenuItems>();
    filteredMenuItems.forEach((item) => {
      const sec = item.section || "Main";
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(item);
    });
    return Array.from(map.entries());
  }, [filteredMenuItems]);

  if (!role) return null;

  return (
    <aside
      className={`relative h-full bg-[#090A1A] border-r border-[#1B1C38] flex flex-col justify-between select-none transition-all duration-300 ease-in-out z-30 ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* ── TOGGLE BUTTON (Protruding tab matching the screenshot) ── */}
      <button
        onClick={toggleCollapse}
        title={isCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
        className="absolute -right-3 top-5 w-6 h-6 rounded-md bg-[#252262] hover:bg-[#3730A3] text-indigo-200 hover:text-white flex items-center justify-center shadow-lg border border-indigo-400/40 cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95 z-40"
      >
        {isCollapsed ? (
          <HiOutlineChevronDoubleRight size={13} />
        ) : (
          <HiOutlineChevronDoubleLeft size={13} />
        )}
      </button>

      {/* ── TOP SECTION: BRAND & SEARCH ── */}
      <div className="flex-shrink-0">
        {/* Brand Header */}
        <div
          className={`p-4 flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          {/* Golden Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-amber-400/25 to-amber-600/10 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10 flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12v7a3 3 0 003 3h14a3 3 0 003-3v-7c0-5.52-4.48-10-10-10zm-1 4a1 1 0 012 0v1.07A6.002 6.002 0 0117 12h-2a4 4 0 00-8 0H5a6.002 6.002 0 014-4.93V6zm-5 8h12v5a1 1 0 01-1 1H7a1 1 0 01-1-1v-5z" />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1 animate-in fade-in duration-200">
              <h1 className="font-extrabold text-white text-base tracking-tight truncate flex items-center gap-1.5">
                <span>My Website</span>
              </h1>
              <p className="text-[10px] text-indigo-300/60 font-medium tracking-wide uppercase truncate">
                {role} Panel
              </p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-11 h-10 mx-auto flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5"
              title="Search"
            >
              <HiOutlineSearch size={18} />
            </button>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <HiOutlineSearch size={16} />
              </div>
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#12132A] hover:bg-[#161836] focus:bg-[#161836] border border-white/10 focus:border-indigo-500/50 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── MIDDLE: NAVIGATION MENU (SCROLLABLE) ── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {sections.map(([sectionTitle, items]) => (
          <div key={sectionTitle} className="space-y-1">
            {/* Section Header */}
            {!isCollapsed ? (
              <p className="text-[11px] font-semibold tracking-wider text-gray-400/70 px-3 pt-2 pb-1 uppercase">
                {sectionTitle}
              </p>
            ) : (
              <div className="border-t border-white/10 my-2" />
            )}

            {/* Section Items */}
            {items.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                pathname={pathname}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── BOTTOM: USER PROFILE & LOGOUT ── */}
      <div className="flex-shrink-0 p-3 border-t border-[#181938] bg-[#0C0D22]/80">
        {isCollapsed ? (
          /* Collapsed User Avatar */
          <div className="relative group flex justify-center">
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-gray-900 flex items-center justify-center font-bold text-xs shadow-md border-2 border-amber-300/30 hover:scale-105 transition-all cursor-pointer"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </button>

            {/* Collapsed Tooltip with quick logout */}
            <div className="absolute left-full ml-3.5 bottom-0 px-3 py-2 bg-[#1B194B] text-white rounded-xl shadow-2xl border border-indigo-400/30 whitespace-nowrap z-50 pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0">
              <div className="absolute -left-1 bottom-3 w-2 h-2 bg-[#1B194B] rotate-45 border-l border-b border-indigo-400/30" />
              <p className="text-xs font-bold">{user?.name || "User"}</p>
              <p className="text-[10px] text-gray-400">{user?.identifier || ""}</p>
              <button
                onClick={handleLogout}
                className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                <HiOutlineLogout size={12} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          /* Expanded User Profile Card matching the screenshot */
          <div className="flex items-center justify-between gap-2 p-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-gray-900 flex items-center justify-center font-bold text-xs shadow-md border border-amber-300/40 flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || "Irfan Nurhidayat"}
                </p>
                <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                  {user?.identifier || "user@gmail.com"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              <HiOutlineLogout size={17} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
