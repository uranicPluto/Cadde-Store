import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();

    let orders;
    if (session?.role === "ADMIN") {
      orders = await prisma.order.findMany({
        include: { orderItems: { include: { product: true } }, orderGroups: true, statusHistory: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (session?.id) {
      orders = await prisma.order.findMany({
        where: { customerId: session.id },
        include: { orderItems: { include: { product: true } }, orderGroups: true, statusHistory: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json({ orders: [] });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET Orders API Error:", error);
    return NextResponse.json({ error: "Siparişler getirilemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { items, calculation, shippingAddress, paymentInfo, customerInfo } = body;

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Geçersiz sipariş verileri." }, { status: 400 });
    }

    const orderNumber = `CS-${Date.now().toString().slice(-6)}`;

    // Create customer if guest or use logged in customer ID
    let customerId = session?.id;
    if (!customerId) {
      const guestEmail = customerInfo?.email || `guest-${Date.now()}@cadde.store`;
      const guestUser = await prisma.user.upsert({
        where: { email: guestEmail },
        update: {},
        create: {
          email: guestEmail,
          passwordHash: "guest",
          firstName: customerInfo?.firstName || "Misafir",
          lastName: customerInfo?.lastName || "Kullanıcı",
          phone: customerInfo?.phone || null,
        },
      });
      customerId = guestUser.id;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        status: "CONFIRMED",
        subtotal: calculation.subtotal,
        productDiscount: calculation.productDiscount || 0,
        couponDiscount: calculation.couponDiscount || 0,
        shippingFee: calculation.shippingFee || 0,
        grandTotal: calculation.grandTotal,
        currency: calculation.currency || "TRY",
        shippingAddressSnapshot: JSON.stringify(shippingAddress),
        statusHistory: {
          create: {
            status: "CONFIRMED",
            note: "Sipariş alındı ve onaylandı.",
          },
        },
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("POST Order API Error:", error);
    return NextResponse.json({ error: "Sipariş oluşturulurken bir hata oluştu." }, { status: 500 });
  }
}
