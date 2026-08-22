import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const body = await request.json();
    const { status, sellerNote, adminNote } = body;

    const returnReq = await prisma.returnRequest.findUnique({
      where: { id: params.id },
      include: {
        seller: true,
        order: true,
      },
    });

    if (!returnReq) {
      return NextResponse.json({ error: "İade talebi bulunamadı." }, { status: 404 });
    }

    const isSellerOwner = user.role === "SELLER" && returnReq.seller.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isSellerOwner && !isAdmin) {
      return NextResponse.json({ error: "Bu işlemi yapma yetkiniz yok." }, { status: 403 });
    }

    const updated = await prisma.returnRequest.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(sellerNote !== undefined && { sellerNote }),
        ...(adminNote !== undefined && { adminNote }),
      },
    });

    // Notify customer
    try {
      await prisma.notification.create({
        data: {
          userId: returnReq.userId,
          titleTR: `İade Talebi Güncellendi: ${status}`,
          titleEN: `Return Request Updated: ${status}`,
          messageTR: `#${returnReq.order.orderNumber} siparişinize ait iade talebinizin durumu güncellendi.`,
          messageEN: `Your return request for order #${returnReq.order.orderNumber} has been updated.`,
          type: "ORDER",
          linkUrl: `/account/orders/${returnReq.orderId}`,
        },
      });
    } catch (e) {
      console.warn("Notification error:", e);
    }

    return NextResponse.json({ returnRequest: updated, success: true });
  } catch (error) {
    console.error("[API Return PUT Error]:", error);
    return NextResponse.json({ error: "İade durumu güncellenemedi." }, { status: 500 });
  }
}
