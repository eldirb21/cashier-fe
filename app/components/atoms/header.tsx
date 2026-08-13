"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { logout } from "@/app/store/slices/authSlices";
import { useI18n } from "@/app/i18n";
import { LanguageSwitcher } from "./languageSwitcher";
import { ThemeSwitcher } from "./themeSwitcher";
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineMenu,
  HiOutlineX,
  HiChevronDown,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { RiDashboardLine } from "react-icons/ri";

const ProfileModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header gradient */}
          <div className="relative h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
            >
              <HiOutlineX size={20} />
            </button>
          </div>

          {/* Avatar overlapping header */}
          <div className="flex flex-col items-center -mt-12 px-6 pb-6">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-blue-100">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="mt-3 text-lg font-bold text-gray-800">Admin</h2>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
              <HiOutlineShieldCheck size={12} />
              Super Admin
            </span>

            {/* Info rows */}
            <div className="w-full mt-5 space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                <HiOutlineUser
                  className="text-blue-500 flex-shrink-0"
                  size={18}
                />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {t.profile.username}
                  </p>
                  <p className="text-[13px] font-semibold text-gray-700">
                    admin
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                <HiOutlineMail
                  className="text-blue-500 flex-shrink-0"
                  size={18}
                />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {t.profile.email}
                  </p>
                  <p className="text-[13px] font-semibold text-gray-700">
                    admin@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full mt-5 flex flex-col gap-2">
              <a
                href="/profile"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors"
                onClick={onClose}
              >
                <HiOutlineUser size={16} />
                {t.profile.viewProfile}
              </a>

              <button
                onClick={() => {
                  onClose();
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-[13px] font-bold hover:bg-red-50 transition-colors"
              >
                <HiOutlineLogout size={16} />
                {t.profile.logout}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Dropdown (small, near avatar) ─────────────────────────────
const ProfileDropdown = ({
  isOpen,
  onViewProfile,
  onLogout,
}: {
  isOpen: boolean;
  onViewProfile: () => void;
  onLogout: () => void;
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="px-4 py-2 border-b border-gray-100 mb-1">
        <p className="text-[12px] font-bold text-gray-700">admin</p>
        <p className="text-[10px] text-gray-400">admin@gmail.com</p>
      </div>

      <button
        onClick={onViewProfile}
        className="flex items-center gap-2 w-full px-4 py-2 text-[12px] font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      >
        <HiOutlineUser size={15} />
        {t.profile.viewProfile}
      </button>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 w-full px-4 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
      >
        <HiOutlineLogout size={15} />
        {t.profile.logout}
      </button>
    </div>
  );
};

// ── Main Header ────────────────────────────────────────────────
export const Headers = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [profileDropOpen, setProfileDropOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { t } = useI18n();

  const menuItems = [
    { name: t.nav.home, path: "/dashboard", icon: <HiOutlineHome size={20} /> },
    {
      name: t.nav.master,
      icon: <HiOutlineCube size={20} />,
      hasSub: true,
      sub: [
        { name: t.nav.categories, path: "/categories" },
        { name: t.nav.product, path: "/products" },
        { name: t.nav.supplier, path: "/supplier" },
      ],
    },
    {
      name: t.nav.customers,
      path: "/customers",
      icon: <HiOutlineUserGroup size={20} />,
    },
    {
      name: t.nav.transactions,
      path: "/transactions",
      icon: <HiOutlineShoppingCart size={20} />,
    },
    {
      name: t.nav.report,
      icon: <HiOutlineCube size={20} />,
      hasSub: true,
      sub: [
        { name: t.nav.profit, path: "/report/profit" },
        { name: t.nav.sales, path: "/report/sales" },
        { name: t.nav.shift, path: "/report/shift-Kasir" },
        { name: t.nav.stockMutasi, path: "/report/stock-dan-mutasi" },
        { name: t.nav.voidReturn, path: "/report/void-return" },
        { name: t.nav.supplier, path: "/report/supplier" },
        { name: t.nav.memberPoin, path: "/report/member-poin" },
        { name: t.nav.discountPromo, path: "/report/discont-promo" },
        { name: t.nav.paymentMethod, path: "/report/payment-report" },
      ],
    },
  ];

  const toggleSub = (name: string) =>
    setOpenSub(openSub === name ? null : name);

  const handleViewProfile = () => {
    setProfileDropOpen(false);
    setProfileModalOpen(true);
  };

  const handleLogout = () => {
    setProfileDropOpen(false);
    dispatch(logout());
    router.replace("/auth/login");
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-350 mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* LEFT: Logo + Desktop Nav */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-[#3b82f6] p-1.5 rounded text-white">
                  <RiDashboardLine size={24} />
                </div>
                <span className="font-bold text-[#334155] text-sm tracking-wide hidden sm:block">
                  CASHIER
                </span>
              </div>

              <nav className="hidden lg:flex items-center space-x-1">
                {menuItems.map((item) =>
                  item.hasSub ? (
                    <div key={item.name} className="relative group">
                      <button
                        onClick={() => toggleSub(item.name)}
                        className={`flex items-center gap-1 px-3 py-5 text-[11px] font-bold transition-all ${
                          item.sub?.some((sub) => sub.path === pathname)
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-blue-600"
                        }`}
                      >
                        {item.icon}
                        {item.name}
                        <HiChevronDown
                          size={14}
                          className={`transition-transform ${openSub === item.name ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openSub === item.name && (
                        <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-b-md py-2 animate-in fade-in slide-in-from-top-2">
                          {item.sub?.map((sub) => (
                            <a
                              key={sub.name}
                              href={sub.path}
                              className={`flex items-center gap-1 px-4 py-2 text-[11px] font-bold transition-all ${
                                sub.path === pathname
                                  ? "text-blue-600"
                                  : "text-gray-500 hover:text-blue-600"
                              }`}
                            >
                              {sub.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      key={item.name}
                      href={item.path}
                      className={`flex items-center gap-1 px-3 py-5 text-[11px] font-bold transition-all ${
                        item.path === pathname
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-blue-600"
                      }`}
                    >
                      {item.icon} {item.name}
                    </a>
                  ),
                )}
                <a
                  href="/users"
                  className="flex items-center gap-2 px-3 py-5 text-[11px] font-bold text-gray-500 hover:text-blue-600"
                >
                  <HiOutlineUsers size={20} />
                  {t.nav.users}
                </a>
              </nav>
            </div>

            {/* RIGHT: Theme + Language + Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeSwitcher />
              <LanguageSwitcher />

              {/* Profile Section — now clickable with dropdown */}
              <div
                ref={profileRef}
                className="relative flex items-center gap-3 pl-4 border-l border-gray-200"
              >
                <div className="hidden md:block text-right">
                  <p className="text-[12px] font-bold text-gray-700 leading-none mb-1">
                    admin
                  </p>
                  <p className="text-[10px] text-gray-400">admin@gmail.com</p>
                </div>

                <button
                  onClick={() => setProfileDropOpen((v) => !v)}
                  className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </button>

                <ProfileDropdown
                  isOpen={profileDropOpen}
                  onViewProfile={handleViewProfile}
                  onLogout={handleLogout}
                />
              </div>

              {/* Mobile Toggle */}
              <button
                className="lg:hidden p-1 text-gray-600"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <HiOutlineX size={26} />
                ) : (
                  <HiOutlineMenu size={26} />
                )}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl overflow-y-auto max-h-screen">
            <div className="px-4 py-4 space-y-1">
              {menuItems.map((item) =>
                item.hasSub ? (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleSub(item.name)}
                      className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg w-full justify-between ${
                        item.sub?.some((sub) => sub.path === pathname)
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-blue-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        {item.name}
                      </div>
                      <HiChevronDown
                        className={`transition-transform ${openSub === item.name ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openSub === item.name &&
                      item.sub?.map((sub) => (
                        <a
                          key={sub.name}
                          href={sub.path}
                          className={`block pl-11 py-2 text-xs font-semibold ${
                            sub.path === pathname
                              ? "text-blue-600"
                              : "text-gray-500 hover:text-blue-600"
                          }`}
                        >
                          {sub.name}
                        </a>
                      ))}
                  </div>
                ) : (
                  <a
                    key={item.name}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg ${
                      item.path === pathname
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-blue-600"
                    }`}
                  >
                    {item.icon} {item.name}
                  </a>
                ),
              )}

              {/* Mobile profile actions */}
              <div className="border-t border-gray-100 pt-3 mt-2 space-y-1">
                <button
                  onClick={handleViewProfile}
                  className="flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg w-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <HiOutlineUser size={18} />
                  {t.profile.viewProfile}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg w-full text-red-500 hover:bg-red-50 transition-colors"
                >
                  <HiOutlineLogout size={18} />
                  {t.profile.logout}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};
