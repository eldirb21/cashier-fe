// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { isRouteAllowed } from "@/app/libs/permissions";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isPublicRoute =
    pathname.startsWith("/login") || pathname.startsWith("/auth");

  if (!token) {
    if (isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const role = payload.role as string;

    if (isPublicRoute) {
      if (role === "CUSTOMER") {
        return NextResponse.redirect(new URL("/transactions", req.url));
      }
      if (!isRouteAllowed("/dashboard", role as any)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const allowed = isRouteAllowed(pathname, role as any);

    if (!allowed) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch (err) {
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
