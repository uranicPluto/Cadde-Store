import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const returnId = resolvedParams?.id;

    if (!returnId) {
      return NextResponse.json({ error: "İade talebi ID gereklidir." }, { status: 400 });
    }

    const body = await request.json();
    const { status, sellerNote, adminNote } = body;

    const returnReq = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        seller: true,
        order: true,
      },
    });

    if (!returnReq) {
      return NextResponse.json({ error: "İade talebi bulunamadı." }, { status: 404 });
    }

    const isSellerOwner = user.role === "SELLER" && returnReq.seller?.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isSellerOwner && !isAdmin) {
      return NextResponse.json({ error: "Bu işlemi yapma yetkiniz yok." }, { status: 403 });
    }

    const newStatus = status || returnReq.status;

    const updated = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        ...(status ? { status } : {}),
        ...(sellerNote !== undefined ? { sellerNote } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
    });

    // Create AuditLog record
    try {
      await prisma.auditLog.create({
        data: {
          action: "RETURN_REQUEST_MODERATED",
          entityType: "ORDER",
          entityId: returnReq.id,
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          metadataJson: JSON.stringify({
            returnRequestId: returnReq.id,
            orderId: returnReq.orderId,
            orderNumber: returnReq.order.orderNumber,
            previousStatus: returnReq.status,
            newStatus,
            sellerNote: sellerNote || null,
            adminNote: adminNote || null,
            moderatedAt: new Date().toISOString(),
          }),
        },
      });
    } catch (auditErr) {
      console.warn("AuditLog creation error for return moderation:", auditErr);
    }

    // Notify customer
    try {
      await prisma.notification.create({
        data: {
          userId: returnReq.userId,
          titleTR: `İade Talebi Güncellendi: ${newStatus}`,
          titleEN: `Return Request Updated: ${newStatus}`,
          messageTR: `#${returnReq.order.orderNumber} siparişinize ait iade talebinizin durumu güncellendi (${newStatus}).`,
          messageEN: `Your return request for order #${returnReq.order.orderNumber} has been updated (${newStatus}).`,
          type: "ORDER",
          linkUrl: `/account/orders/${returnReq.orderId}`,
        },
      });
    } catch (e) {
      console.warn("Notification error for customer:", e);
    }

    return NextResponse.json({ returnRequest: updated, success: true });
  } catch (error) {
    console.error("[API Return PUT Error]:", error);
    return NextResponse.json({ error: "İade durumu güncellenemedi." }, { status: 500 });
  }
}
