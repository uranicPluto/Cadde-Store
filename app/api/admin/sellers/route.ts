import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const sellers = await prisma.seller.findMany({
      include: { user: true, products: true, orderGroups: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sellers });
  } catch (error) {
    console.error("GET Admin Sellers API Error:", error);
    return NextResponse.json({ error: "Satıcılar getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const body = await request.json();
    const { sellerId, verified, status } = body;

    if (!sellerId) {
      return NextResponse.json({ error: "Satıcı ID gereklidir." }, { status: 400 });
    }

    const seller = await prisma.seller.update({
      where: { id: sellerId },
      data: {
        ...(verified !== undefined ? { verified } : {}),
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({ success: true, seller });
  } catch (error) {
    console.error("PUT Admin Seller Status API Error:", error);
    return NextResponse.json({ error: "Satıcı durumu güncellenemedi." }, { status: 500 });
  }
}
