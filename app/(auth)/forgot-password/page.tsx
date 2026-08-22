"use client";

import { Footer, LoginRedirectGuard } from "@/app/components/atoms";
import { isValidIdentifier } from "@/app/libs";
import { useRouter } from "next/navigation";
import { useState } from "react";
type FormError = {
  identifier?: string;
};
type Props = {};

export default function ForgotPass({}: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "",
  });
  const [error, setError] = useState<FormError>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { identifier } = form;

    let newError: FormError = {};

    if (!isValidIdentifier(identifier)) {
      setError({
        ...error,
        identifier: "Masukkan email atau nomor HP yang valid",
      });
      return;
    }

    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }

    setError({});
  };

  return (
    <LoginRedirectGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-6 text-black">
            Lupa Password
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Phone */}
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

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 mt-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Reset
            </button>

            <div className="w-full gap-2 transition flex justify-center items-center">
              <button
                type="button"
                className="px-2 bg-transparent text-blue-700 py-2 rounded-lg font-semibold hover:text-blue-700 transition"
                onClick={() => router.replace("/auth/login")}
              >
                Back
              </button>
            </div>
          </form>

          <Footer />
        </div>
      </div>
    </LoginRedirectGuard>
  );
}
