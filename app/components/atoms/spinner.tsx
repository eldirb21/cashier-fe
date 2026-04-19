"use client";

export function Spinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo / Icon */}
        <div className="relative w-16 h-16">
          {/* Outer spinning ring */}
          <span className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          {/* Inner pulsing dot */}
          <span className="absolute inset-3 rounded-full bg-blue-600 animate-pulse" />
        </div>

        {/* App name */}
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
          Kasir
        </h1>

        {/* Animated dots */}
        <div className="flex gap-2">
          <span
            className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        {/* Loading text */}
        <p className="text-sm text-gray-500">Memuat, harap tunggu...</p>
      </div>
    </div>
  );
}
