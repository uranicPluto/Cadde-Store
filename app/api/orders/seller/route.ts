import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SELLER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Satıcı yetkisi gereklidir." }, { status: 403 });
    }

    let sellerId: string | undefined;
    if (session.role === "SELLER") {
      const seller = await prisma.seller.findUnique({ where: { userId: session.id } });
      if (!seller) return NextResponse.json({ error: "Satıcı profili bulunamadı." }, { status: 403 });
      sellerId = seller.id;
    }

    const orderGroups = await prisma.orderGroup.findMany({
      where: sellerId ? { sellerId } : {},
      include: {
        order: { include: { customer: true } },
        items: { include: { product: true } },
        seller: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orderGroups });
  } catch (error) {
    console.error("GET Seller Orders API Error:", error);
    return NextResponse.json({ error: "Satıcı siparişleri getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SELLER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Satıcı yetkisi gereklidir." }, { status: 403 });
    }

    const body = await request.json();
    const { orderGroupId, status, note } = body;

    if (!orderGroupId || !status) {
      return NextResponse.json({ error: "Sipariş grubu ID ve yeni durum gereklidir." }, { status: 400 });
    }

    const group = await prisma.orderGroup.findUnique({
      where: { id: orderGroupId },
      include: { seller: true, order: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Sipariş grubu bulunamadı." }, { status: 404 });
    }

    // Ownership Check: Seller can only update their own order group
    if (session.role === "SELLER") {
      const seller = await prisma.seller.findUnique({ where: { userId: session.id } });
      if (!seller || group.sellerId !== seller.id) {
        return NextResponse.json({ error: "Bu sipariş grubunu güncelleme yetkiniz yok." }, { status: 403 });
      }
    }

    const updatedGroup = await prisma.orderGroup.update({
      where: { id: orderGroupId },
      data: { status },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: group.orderId,
        status,
        note: note || `Satıcı (${group.seller.storeName}) tarafından durum "${status}" olarak güncellendi.`,
      },
    });

    return NextResponse.json({ success: true, orderGroup: updatedGroup });
  } catch (error) {
    console.error("PUT Seller Order Status API Error:", error);
    return NextResponse.json({ error: "Sipariş durumu güncellenirken bir hata oluştu." }, { status: 500 });
  }
}
