import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, hashPassword, createSessionToken } from "@/lib/auth/auth";
import { getSessionCookieOptions } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunludur.", code: "INVALID_CREDENTIALS" }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: { sellerProfile: true },
      });
    } catch (dbErr) {
      console.warn("DB user query warning:", dbErr);
    }

    // Auto-provision demo accounts if unseeded or running in isolated serverless DB
    if (!user && (cleanEmail === "admin@cadde-store.com" || cleanEmail === "seller@cadde-store.com" || cleanEmail === "customer@cadde-store.com")) {
      if (password === "Password123!") {
        const passwordHash = await hashPassword("Password123!");
        const role = cleanEmail === "admin@cadde-store.com" ? "ADMIN" : cleanEmail === "seller@cadde-store.com" ? "SELLER" : "CUSTOMER";
        try {
          user = await prisma.user.create({
            data: {
              email: cleanEmail,
              passwordHash,
              firstName: cleanEmail === "admin@cadde-store.com" ? "Sistem" : cleanEmail === "seller@cadde-store.com" ? "Trendy" : "Ahmet",
              lastName: cleanEmail === "admin@cadde-store.com" ? "Yöneticisi" : cleanEmail === "seller@cadde-store.com" ? "Fashion" : "Yılmaz",
              role,
            },
            include: { sellerProfile: true },
          });

          if (role === "SELLER") {
            await prisma.seller.create({
              data: {
                userId: user.id,
                storeName: "Trend Fashion Mağazası",
                slug: "trend-fashion-magazasi",
                description: "Kadın ve erkek giyim mağazası",
                logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
              },
            });
            user = await prisma.user.findUnique({
              where: { id: user.id },
              include: { sellerProfile: true },
            });
          }
        } catch (createErr) {
          // Fallback user object if DB is read-only
          user = {
            id: `demo-${role.toLowerCase()}`,
            email: cleanEmail,
            firstName: cleanEmail === "admin@cadde-store.com" ? "Sistem" : cleanEmail === "seller@cadde-store.com" ? "Trendy" : "Ahmet",
            lastName: cleanEmail === "admin@cadde-store.com" ? "Yöneticisi" : cleanEmail === "seller@cadde-store.com" ? "Fashion" : "Yılmaz",
            passwordHash,
            role,
            sellerProfile: role === "SELLER" ? { slug: "trend-fashion-magazasi" } : null,
          };
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Geçersiz e-posta veya şifre.", code: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Geçersiz e-posta veya şifre.", code: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as "CUSTOMER" | "SELLER" | "ADMIN",
      sellerSlug: user.sellerProfile?.slug || (user.role === "SELLER" ? "trend-fashion-magazasi" : undefined),
    };

    const token = await createSessionToken(payload);
    const response = NextResponse.json({ success: true, user: payload });
    const cookieOpts = getSessionCookieOptions();

    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error: unknown) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Giriş yapılırken bir hata oluştu.", code: "LOGIN_ERROR" }, { status: 500 });
  }
}
