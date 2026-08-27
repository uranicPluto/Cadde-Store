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
    const demoAccounts: Record<string, { role: "ADMIN" | "SELLER" | "CUSTOMER"; adminRole?: string; firstName: string; lastName: string }> = {
      "admin@cadde-store.com": { role: "ADMIN", adminRole: "SUPER_ADMIN", firstName: "Super", lastName: "Admin" },
      "content@cadde-store.com": { role: "ADMIN", adminRole: "CONTENT_MANAGER", firstName: "Content", lastName: "Manager" },
      "merchandiser@cadde-store.com": { role: "ADMIN", adminRole: "MERCHANDISING_MANAGER", firstName: "Merchandising", lastName: "Manager" },
      "marketing@cadde-store.com": { role: "ADMIN", adminRole: "MARKETING_MANAGER", firstName: "Marketing", lastName: "Manager" },
      "operations@cadde-store.com": { role: "ADMIN", adminRole: "OPERATIONS_MANAGER", firstName: "Operations", lastName: "Manager" },
      "seller@cadde-store.com": { role: "SELLER", firstName: "Trendy", lastName: "Fashion" },
      "customer@cadde-store.com": { role: "CUSTOMER", firstName: "Ahmet", lastName: "Yılmaz" },
    };

    if (!user && demoAccounts[cleanEmail]) {
      if (password === "Password123!") {
        const demo = demoAccounts[cleanEmail];
        const passwordHash = await hashPassword("Password123!");
        try {
          user = await prisma.user.create({
            data: {
              email: cleanEmail,
              passwordHash,
              firstName: demo.firstName,
              lastName: demo.lastName,
              role: demo.role,
              adminRole: demo.adminRole,
            },
            include: { sellerProfile: true },
          });

          if (demo.role === "SELLER") {
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
          user = {
            id: `demo-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`,
            email: cleanEmail,
            firstName: demo.firstName,
            lastName: demo.lastName,
            passwordHash,
            role: demo.role,
            adminRole: demo.adminRole,
            sellerProfile: demo.role === "SELLER" ? { slug: "trend-fashion-magazasi" } : null,
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
      adminRole: user.adminRole || (user.role === "ADMIN" ? "SUPER_ADMIN" : undefined),
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
