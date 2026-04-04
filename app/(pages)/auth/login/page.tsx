"use client";

import { Footer, LoginRedirectGuard } from "@/app/components/atoms";
import { isValidIdentifier, isValidPassword, setCookie } from "@/app/libs";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
type FormError = {
  identifier?: string;
  password?: string;
};
type Props = {};

export default function Login({}: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState<FormError>({});

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { identifier, password } = form;

    let newError: FormError = {};

    if (!isValidIdentifier(identifier)) {
      setError({
        ...error,
        identifier: "Masukkan email atau nomor HP yang valid",
      });
      return;
    }

    if (!isValidPassword(password)) {
      setError({ ...error, password: "Password minimal 6 karakter" });
      return;
    }

    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }

    setError({});

    setCookie("token", identifier);
    router.replace("/dashboard");
  };

  return (
    <LoginRedirectGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-6 text-black">
            Login Kasir
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-black">
                Email / Nomor HP
              </label>
              <input
                type="text"
                name="identifier"
                placeholder="Masukkan email atau nomor HP"
                value={form.identifier}
                onChange={handleChange}
                className={`w-full mt-1 px-4 py-2 border rounded-lg text-black bg-white focus:outline-none focus:ring-2 ${
                  error.identifier
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-blue-500"
                }`}
                required
              />
              {error["identifier"] && (
                <p className="text-red-500 text-sm">
                  {error["identifier"] ?? ""}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-black">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full mt-1 px-4 py-2 border rounded-lg text-black bg-white focus:outline-none focus:ring-2 ${
                    error.password
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                  required
                />
                {error["password"] && (
                  <p className="text-red-500 text-sm">
                    {error["password"] ?? ""}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-sm text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 mb-0  rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </button>

            <button
              type="button"
              className="w-full bg-transparent text-black rounded-lg font-normal hover:text-blue-700 transition"
              onClick={() => redirect("/auth/forgot-password")}
            >
              Forgot Password?
            </button>

            <div className="w-full gap-2 transition flex justify-center items-center">
              <span className="text-black">Do not have account?</span>
              <button
                type="button"
                className="px-2 bg-transparent text-blue-700 py-0 rounded-lg font-semibold hover:text-blue-700 transition"
                onClick={() => redirect("/auth/signup")}
              >
                Signup
              </button>
            </div>
          </form>

          <Footer />
        </div>
      </div>
    </LoginRedirectGuard>
  );
}
