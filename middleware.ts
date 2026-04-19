import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/auth/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const isHome = pathname === "/";

  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isHome) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/login"],
};
