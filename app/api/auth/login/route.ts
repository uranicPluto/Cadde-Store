import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, createSessionToken } from "@/lib/auth/auth";
import { getSessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { sellerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Geçersiz e-posta veya şifre." }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Geçersiz e-posta veya şifre." }, { status: 401 });
    }

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as "CUSTOMER" | "SELLER" | "ADMIN",
      sellerSlug: user.sellerProfile?.slug,
    };

    const token = await createSessionToken(payload);
    const response = NextResponse.json({ success: true, user: payload });
    const cookieOpts = getSessionCookieOptions();

    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Giriş yapılırken bir hata oluştu." }, { status: 500 });
  }
}
