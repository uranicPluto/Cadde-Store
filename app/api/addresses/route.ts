import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("GET Addresses API Error:", error);
    return NextResponse.json({ error: "Adresler getirilemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Lütfen önce giriş yapın." }, { status: 401 });
    }

    const body = await request.json();
    const { title, firstName, lastName, phone, email, city, district, addressLine, country, isDefault } = body;

    if (!title || !firstName || !lastName || !city || !district || !addressLine) {
      return NextResponse.json({ error: "Lütfen tüm zorunlu adres alanlarını doldurun." }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.id,
        title,
        firstName,
        lastName,
        phone,
        email: email || session.email,
        city,
        district,
        addressLine,
        country: country || "Türkiye",
        isDefault: !!isDefault,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("POST Address API Error:", error);
    return NextResponse.json({ error: "Adres kaydedilirken bir hata oluştu." }, { status: 500 });
  }
}
