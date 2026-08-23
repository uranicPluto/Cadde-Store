import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: { seller: true, category: true, brandRef: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET Admin Products API Error:", error);
    return NextResponse.json({ error: "Ürünler getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const body = await request.json();
    const { productId, status } = body;

    if (!productId || !status) {
      return NextResponse.json({ error: "Ürün ID ve yeni durum zorunludur." }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "PRODUCT_MODERATED",
        entityType: "PRODUCT",
        entityId: product.id,
        metadataJson: JSON.stringify({
          productId: product.id,
          name: product.name,
          status: product.status,
        }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("PUT Admin Product Moderation API Error:", error);
    return NextResponse.json({ error: "Ürün durumu güncellenemedi." }, { status: 500 });
  }
}
