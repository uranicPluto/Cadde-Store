import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, createSessionToken } from "@/lib/auth/auth";
import { getSessionCookieOptions } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Lütfen gerekli alanları doldurun." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role: "CUSTOMER",
      },
    });

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as "CUSTOMER" | "SELLER" | "ADMIN",
    };

    const token = await createSessionToken(payload);
    const response = NextResponse.json({ success: true, user: payload });
    const cookieOpts = getSessionCookieOptions();

    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json({ error: "Kayıt oluşturulurken bir hata oluştu." }, { status: 500 });
  }
}
