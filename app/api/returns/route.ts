import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let whereClause: any = {};

    if (user.role === "ADMIN") {
      if (status) whereClause.status = status;
    } else if (user.role === "SELLER") {
      const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
      if (!seller) {
        return NextResponse.json({ error: "Satıcı profili bulunamadı." }, { status: 404 });
      }
      whereClause.sellerId = seller.id;
      if (status) whereClause.status = status;
    } else {
      whereClause.userId = user.id;
      if (status) whereClause.status = status;
    }

    const returns = await prisma.returnRequest.findMany({
      where: whereClause,
      include: {
        order: { select: { orderNumber: true, createdAt: true } },
        orderItem: {
          include: {
            product: { select: { name: true, imageUrl: true, price: true } },
          },
        },
        user: { select: { firstName: true, lastName: true, email: true } },
        seller: { select: { storeName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ returns });
  } catch (error) {
    console.error("[API Returns GET Error]:", error);
    return NextResponse.json({ error: "İadeler yüklenirken hata oluştu." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, orderItemId, reason, evidenceImages } = body;

    if (!orderId || !orderItemId || !reason) {
      return NextResponse.json({ error: "Sipariş, ürün ve iade gerekçesi zorunludur." }, { status: 400 });
    }

    // Verify order item ownership
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
        product: { select: { sellerId: true } },
      },
    });

    if (!orderItem || orderItem.order.customerId !== user.id) {
      return NextResponse.json({ error: "Bu sipariş ürünü için iade talebi oluşturamazsınız." }, { status: 403 });
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        orderItemId,
        userId: user.id,
        sellerId: orderItem.product.sellerId,
        reason,
        status: "PENDING",
        refundAmount: orderItem.price * orderItem.quantity,
        evidenceImages: JSON.stringify(evidenceImages || []),
      },
    });

    // Notify seller
    try {
      const seller = await prisma.seller.findUnique({ where: { id: orderItem.product.sellerId } });
      if (seller) {
        await prisma.notification.create({
          data: {
            userId: seller.userId,
            titleTR: "Yeni İade Talebi Alındı",
            titleEN: "New Return Request Received",
            messageTR: `#${orderItem.order.orderNumber} numaralı siparişteki ürün için iade talebi oluşturuldu.`,
            messageEN: `A return request was submitted for order #${orderItem.order.orderNumber}.`,
            type: "SELLER",
            linkUrl: `/seller/dashboard/orders`,
          },
        });
      }
    } catch (e) {
      console.warn("Notification error:", e);
    }

    return NextResponse.json({ returnRequest, success: true }, { status: 201 });
  } catch (error) {
    console.error("[API Returns POST Error]:", error);
    return NextResponse.json({ error: "İade talebi oluşturulamadı." }, { status: 500 });
  }
}
