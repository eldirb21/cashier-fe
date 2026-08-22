"use client";

import {
  Footer,
  LoginRedirectGuard,
  LanguageSwitcher,
} from "@/app/components/atoms";
import { useConfirm } from "@/app/components/molecules";
import { isValidIdentifier, isValidPassword } from "@/app/libs";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { loginUser, selectIsAuthLoading } from "@/app/store/slices/authSlice";
import { useI18n } from "@/app/i18n";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormError = {
  identifier?: string;
  password?: string;
};

export default function Login() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsAuthLoading);
  const { showAlert } = useConfirm();
  const router = useRouter();
  const { t } = useI18n();

  const [form, setForm] = useState({
    identifier: "admin@cashier.com",
    password: "admin1234",
  });
  const [errors, setErrors] = useState<FormError>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name as keyof FormError]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { identifier, password } = form;
    const newErrors: FormError = {};

    if (!isValidIdentifier(identifier)) {
      newErrors.identifier = t.login.identifierError;
    }

    if (!isValidPassword(password)) {
      newErrors.password = t.login.passwordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await dispatch(loginUser({ identifier, password })).unwrap();
      console.log("LOGIN SUKSESSS");

      router.replace("/dashboard");
    } catch (err) {
      showAlert(
        `${typeof err === "object" && err !== null && "message" in err ? (err as { message: string }).message : err}`,
        "error",
      );
    }
  };

  return (
    <LoginRedirectGuard>
      {/* Container with rich background gradient & ambient glowing blobs */}
      <div className="relative min-h-screen w-full bg-gradient-to-br from-[#F5F7FA] via-[#E6F4FE]/30 to-[#F9F9FB] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden select-none">
        {/* Ambient Gradient Glowing Blobs */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none animate-pulse"
          style={{ animationDuration: "10s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary-tint/50 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative Grid / Dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#126B57_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        {/* Main Card Container with Glassmorphism */}
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(18,107,87,0.12)] border border-white/80 p-6 sm:p-9 transition-all duration-300">
          {/* Language Switcher — top-right inside card */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
            <LanguageSwitcher />
          </div>

          {/* Header & Branding */}
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-[#0e5444] flex items-center justify-center mb-3 sm:mb-4 text-white shadow-lg shadow-brand-primary/30 transform hover:scale-105 transition-transform duration-200">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 0 0 -8 0v4M5 11h14a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight">
              {t.login.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t.login.subtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Identifier Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-brand-ink mb-1.5">
                {t.login.identifierLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M16 12a4 4 0 1 0 -8 0 4 4 0 0 0 8 0zm0 0v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0 -9 9m4.5 -1.206a8.959 8.959 0 0 1 -4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="identifier"
                  placeholder={t.login.identifierPlaceholder}
                  value={form.identifier}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl text-brand-ink bg-gray-50/50 focus:bg-white text-sm focus:outline-none focus:ring-4 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                    errors.identifier
                      ? "border-brand-error focus:ring-brand-error/20"
                      : "border-gray-200 hover:border-gray-300 focus:border-brand-primary focus:ring-brand-primary/15"
                  }`}
                  required
                />
              </div>
              {errors.identifier && (
                <p className="text-brand-error text-xs mt-1.5 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 1 1 -18 0 9 9 0 0 1 18 0z"
                    />
                  </svg>
                  {errors.identifier}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-brand-ink">
                  {t.login.passwordLabel}
                </label>
                <button
                  type="button"
                  disabled={isLoading}
                  className="text-xs text-brand-primary hover:text-[#0e5444] hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => router.push("/auth/forgot-password")}
                >
                  {t.login.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 15v2m-6 4h12a2 2 0 0 0 2 -2v-6a2 2 0 0 0 -2 -2H6a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2zm10 -10V7a4 4 0 0 0 -8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t.login.passwordPlaceholder}
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-11 py-2.5 sm:py-3 border rounded-xl text-brand-ink bg-gray-50/50 focus:bg-white text-sm focus:outline-none focus:ring-4 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                    errors.password
                      ? "border-brand-error focus:ring-brand-error/20"
                      : "border-gray-200 hover:border-gray-300 focus:border-brand-primary focus:ring-brand-primary/15"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858-5.908a10.016 10.016 0 0 1 3.682-.813c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 0 1-4.132 5.411m-4.692 4.692a3 3 0 0 1-4.243-4.243m4.242 4.242L3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 1 1 -6 0 3 3 0 0 1 6 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-brand-error text-xs mt-1.5 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 1 1 -18 0 9 9 0 0 1 18 0z"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-brand-primary to-[#188069] hover:from-[#0e5444] hover:to-brand-primary text-white py-3 px-4 rounded-xl font-bold hover:shadow-lg hover:shadow-brand-primary/25 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base mt-3 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.login.loading}
                </>
              ) : (
                t.login.submit
              )}
            </button>

            {/* Signup prompt */}
            <div className="pt-2 text-center text-xs sm:text-sm text-gray-600 flex justify-center items-center gap-1.5">
              <span>{t.login.noAccount}</span>
              <button
                type="button"
                disabled={isLoading}
                className="text-brand-primary font-bold hover:text-[#0e5444] hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => router.push("/auth/signup")}
              >
                {t.login.register}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-4 border-t border-gray-100">
            <Footer />
          </div>
        </div>
      </div>
    </LoginRedirectGuard>
  );
}
