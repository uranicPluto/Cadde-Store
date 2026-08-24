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
    const { orderGroupId, status, carrierName, trackingNumber, note } = body;

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

    // 1. Update OrderGroup
    const updatedGroup = await prisma.orderGroup.update({
      where: { id: orderGroupId },
      data: {
        status,
        ...(carrierName ? { carrierName } : {}),
        ...(trackingNumber ? { trackingNumber } : {}),
      },
    });

    // 2. Synchronize parent Order status and tracking
    const allGroups = await prisma.orderGroup.findMany({
      where: { orderId: group.orderId },
    });

    let newOrderStatus = group.order.status;
    const allDelivered = allGroups.every((g) => g.id === orderGroupId ? status === "DELIVERED" : g.status === "DELIVERED");
    const allShippedOrDelivered = allGroups.every((g) => {
      const gStatus = g.id === orderGroupId ? status : g.status;
      return gStatus === "SHIPPED" || gStatus === "DELIVERED";
    });
    const anyProcessingOrAbove = allGroups.some((g) => {
      const gStatus = g.id === orderGroupId ? status : g.status;
      return ["PROCESSING", "SHIPPED", "DELIVERED"].includes(gStatus);
    });

    if (allDelivered) {
      newOrderStatus = "DELIVERED";
    } else if (allShippedOrDelivered) {
      newOrderStatus = "SHIPPED";
    } else if (anyProcessingOrAbove && group.order.status === "CONFIRMED") {
      newOrderStatus = "PROCESSING";
    }

    await prisma.order.update({
      where: { id: group.orderId },
      data: {
        status: newOrderStatus,
        ...(carrierName ? { carrierName } : {}),
        ...(trackingNumber ? { trackingNumber } : {}),
      },
    });

    // 3. Create OrderStatusHistory record
    const sellerStoreName = group.seller?.storeName || "Satıcı";
    const statusNote =
      note ||
      (carrierName && trackingNumber
        ? `Satıcı (${sellerStoreName}) tarafından kargo bilgisi güncellendi: ${carrierName} (${trackingNumber}) - Durum: ${status}`
        : `Satıcı (${sellerStoreName}) tarafından durum "${status}" olarak güncellendi.`);

    await prisma.orderStatusHistory.create({
      data: {
        orderId: group.orderId,
        status,
        note: statusNote,
      },
    });

    // 4. Create Notification for customer
    if (group.order.customerId) {
      try {
        await prisma.notification.create({
          data: {
            userId: group.order.customerId,
            titleTR: `Sipariş Durumu: ${status}`,
            titleEN: `Order Status: ${status}`,
            messageTR: `#${group.order.orderNumber} numaralı siparişinizin durumu "${status}" olarak güncellendi.${
              trackingNumber ? ` Kargo Takip No: ${trackingNumber}` : ""
            }`,
            messageEN: `Your order #${group.order.orderNumber} status has been updated to "${status}".${
              trackingNumber ? ` Tracking: ${trackingNumber}` : ""
            }`,
            type: "ORDER",
            linkUrl: `/account/orders/${group.orderId}`,
          },
        });
      } catch (notifErr) {
        console.warn("Customer notification creation error:", notifErr);
      }
    }

    return NextResponse.json({ success: true, orderGroup: updatedGroup });
  } catch (error) {
    console.error("PUT Seller Order Status API Error:", error);
    return NextResponse.json({ error: "Sipariş durumu güncellenirken bir hata oluştu." }, { status: 500 });
  }
}
