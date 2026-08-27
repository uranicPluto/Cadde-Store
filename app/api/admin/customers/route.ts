import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: { orders: true, addresses: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phone || "",
      ordersCount: c.orders.length,
      totalSpent: c.orders.reduce((sum, o) => sum + o.grandTotal, 0),
      lastOrderDate: c.orders[0]?.createdAt.toISOString().split("T")[0] || c.createdAt.toISOString().split("T")[0],
      status: c.status,
      joinedDate: c.createdAt.toISOString().split("T")[0],
      savedAddressesCount: c.addresses.length,
    }));

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    console.error("GET Admin Customers API Error:", error);
    return NextResponse.json({ error: "Müşteriler getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const body = await request.json();
    const { customerId, status } = body;

    if (!customerId || !status) {
      return NextResponse.json({ error: "Müşteri ID ve yeni durum zorunludur." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: customerId },
      data: { status },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "CUSTOMER_STATUS_CHANGED",
        entityType: "USER",
        entityId: user.id,
        metadataJson: JSON.stringify({
          email: user.email,
          status: user.status,
        }),
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("PUT Admin Customer Status API Error:", error);
    return NextResponse.json({ error: "Müşteri durumu güncellenemedi." }, { status: 500 });
  }
}
