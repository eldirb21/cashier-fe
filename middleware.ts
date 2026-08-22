// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { isRouteAllowed } from "@/app/libs/permissions";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  console.log("=== MIDDLEWARE ===");
  console.log("pathname:", pathname);
  console.log("token exists:", !!token);
  console.log("all cookies:", req.cookies.getAll());

  const isPublicRoute =
    pathname.startsWith("/login") || pathname.startsWith("/auth");

  if (!token) {
    console.log("→ no token, isPublicRoute:", isPublicRoute);
    if (isPublicRoute) return NextResponse.next();
    console.log("→ redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("decoded payload:", payload);

    const role = payload.role as string;

    if (isPublicRoute) {
      if (!isRouteAllowed("/dashboard", role as any)) {
        console.log("→ logged in as role without dashboard access, redirect to /unauthorized");
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      console.log("→ already logged in, redirect to /dashboard");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const allowed = isRouteAllowed(pathname, role as any);
    console.log("role:", role, "| allowed for", pathname, ":", allowed);

    if (!allowed) {
      console.log("→ redirecting to /unauthorized");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    console.log("→ access granted");
    return NextResponse.next();
  } catch (err) {
    console.log("JWT verify FAILED:", err);

    // PENTING: kalau sudah di halaman publik (/login), JANGAN redirect lagi
    // cukup bersihkan cookie invalid dan biarkan halaman login tampil normal
    if (isPublicRoute) {
      const res = NextResponse.next();
      res.cookies.delete("token");
      res.cookies.delete("refreshToken");
      return res;
    }

    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    return res;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/categories/:path*",
    "/products/:path*",
    "/supplier/:path*",
    "/customers/:path*",
    "/transactions/:path*",
    "/report/:path*",
    "/login",
  ],
};
