import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";

const PUBLIC_PATHS = ["/login", "/signup"];
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAuthenticated = Boolean(request.auth?.user);
  const role = request.auth?.user?.role;
  const mustChangePassword = Boolean(request.auth?.user?.mustChangePassword);

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin/programs" : "/programs", request.nextUrl));
  }

  if (isAuthenticated && role === "AGENT" && mustChangePassword && pathname !== "/change-password" && !pathname.startsWith("/api/auth/change-password")) {
    return NextResponse.redirect(new URL("/change-password", request.nextUrl));
  }

  if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/programs", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
