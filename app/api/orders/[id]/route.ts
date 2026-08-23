import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams?.id;

    if (!orderId) {
      return NextResponse.json({ error: "Sipariş ID veya Sipariş Numarası gereklidir." }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
        ...(session?.role !== "ADMIN" && session?.id ? { customerId: session.id } : {}),
      },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
        orderGroups: {
          include: {
            seller: true,
            items: { include: { product: true } },
          },
        },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!order) {
      // Guest / unauthenticated fallback lookup if matching ID or orderNumber directly
      const guestOrder = await prisma.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderNumber: orderId }],
        },
        include: {
          customer: true,
          orderItems: { include: { product: true } },
          orderGroups: {
            include: {
              seller: true,
              items: { include: { product: true } },
            },
          },
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
      });

      if (!guestOrder) {
        return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
      }

      return NextResponse.json({ order: guestOrder });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("GET Order by ID error:", error);
    return NextResponse.json({ error: "Sipariş bilgisi getirilemedi." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SELLER")) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams?.id;

    if (!orderId) {
      return NextResponse.json({ error: "Sipariş ID gereklidir." }, { status: 400 });
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        orderGroups: true,
        customer: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const body = await request.json();
    const {
      status,
      carrierName,
      trackingNumber,
      estimatedDelivery,
      note,
      orderGroupId,
    } = body;

    // Update the Order record
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        ...(status ? { status } : {}),
        ...(carrierName !== undefined ? { carrierName } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        ...(estimatedDelivery !== undefined ? { estimatedDelivery } : {}),
      },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
        orderGroups: {
          include: {
            seller: true,
            items: { include: { product: true } },
          },
        },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    // Update child OrderGroup records
    if (orderGroupId) {
      await prisma.orderGroup.update({
        where: { id: orderGroupId },
        data: {
          ...(status ? { status } : {}),
          ...(carrierName !== undefined ? { carrierName } : {}),
          ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        },
      });
    } else {
      await prisma.orderGroup.updateMany({
        where: { orderId: existingOrder.id },
        data: {
          ...(status ? { status } : {}),
          ...(carrierName !== undefined ? { carrierName } : {}),
          ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        },
      });
    }

    // Append to OrderStatusHistory
    if (status || trackingNumber) {
      const historyNote =
        note ||
        (trackingNumber
          ? `Kargo bilgisi güncellendi: ${carrierName || existingOrder.carrierName || "Kargo"} - ${trackingNumber}`
          : `Sipariş durumu ${status || existingOrder.status} olarak güncellendi.`);

      await prisma.orderStatusHistory.create({
        data: {
          orderId: existingOrder.id,
          status: status || existingOrder.status,
          note: historyNote,
        },
      });
    }

    // Create Notification if status changed
    if (status && status !== existingOrder.status && existingOrder.customerId) {
      try {
        await prisma.notification.create({
          data: {
            userId: existingOrder.customerId,
            titleTR: `Sipariş Durumu: ${status}`,
            titleEN: `Order Status: ${status}`,
            messageTR: `Siparişinizin (#${existingOrder.orderNumber}) yeni durumu: ${status}.`,
            messageEN: `Your order (#${existingOrder.orderNumber}) status is now: ${status}.`,
            type: "ORDER",
            linkUrl: `/account/orders/${existingOrder.id}`,
          },
        });
      } catch (notifErr) {
        console.error("Failed to create customer notification:", notifErr);
      }
    }

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "ORDER_UPDATED",
        entityType: "ORDER",
        entityId: existingOrder.id,
        metadataJson: JSON.stringify({
          orderNumber: existingOrder.orderNumber,
          oldStatus: existingOrder.status,
          newStatus: status || existingOrder.status,
          carrierName: carrierName || existingOrder.carrierName,
          trackingNumber: trackingNumber || existingOrder.trackingNumber,
        }),
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("PUT Order [id] API Error:", error);
    return NextResponse.json({ error: "Sipariş güncellenemedi." }, { status: 500 });
  }
}
