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

  // Protect Admin Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!user || user.role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
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
