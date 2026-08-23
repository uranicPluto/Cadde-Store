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
