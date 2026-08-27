import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/auth/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("cadde_store_session")?.value;
  let user: { role: string; sellerSlug?: string } | null = null;

  if (token) {
    try {
      const secret = getAuthSecret();
      const { payload } = await jwtVerify(token, secret);
      user = payload as unknown as { role: string; sellerSlug?: string };
    } catch (e) {
      user = null;
    }
  }

  const adminRoles = [
    "ADMIN",
    "SUPER_ADMIN",
    "CONTENT_MANAGER",
    "MERCHANDISING_MANAGER",
    "OPERATIONS_MANAGER",
    "MARKETING_MANAGER",
  ];

  // Allow login page without checks, or redirect to /admin if already authenticated
  if (pathname === "/admin/login") {
    if (user && adminRoles.includes(user.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect Admin Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!user || !adminRoles.includes(user.role)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Seller Dashboard Routes (/seller/dashboard/*)
  if (pathname.startsWith("/seller/dashboard")) {
    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
      const url = request.nextUrl.clone();
      url.pathname = "/seller";
      return NextResponse.redirect(url);
    }
  }

  // Protect Customer Account Routes (/account/*)
  if (pathname.startsWith("/account")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/dashboard/:path*", "/account/:path*"],
};
