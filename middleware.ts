import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";

const PUBLIC_PATHS = ["/login", "/signup"];
const { auth } = NextAuth(authConfig);

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAuthenticated = Boolean(request.auth?.user);
  const role = request.auth?.user?.role;
  const mustChangePassword = Boolean(request.auth?.user?.mustChangePassword);

  if (pathname.startsWith("/api/auth")) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (!isAuthenticated && !isPublicPath) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/login", request.nextUrl)));
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return withSecurityHeaders(NextResponse.redirect(new URL(role === "ADMIN" ? "/admin/programs" : "/programs", request.nextUrl)));
  }

  if (isAuthenticated && role === "AGENT" && mustChangePassword && pathname !== "/change-password" && !pathname.startsWith("/api/auth/change-password")) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/change-password", request.nextUrl)));
  }

  if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && role !== "ADMIN") {
    return withSecurityHeaders(NextResponse.redirect(new URL("/programs", request.nextUrl)));
  }

  return withSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
