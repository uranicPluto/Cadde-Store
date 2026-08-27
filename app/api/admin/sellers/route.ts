import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    const perm = requirePermission(session, "SELLERS", "READ");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yönetici yetkisi gereklidir.", code: "FORBIDDEN", resource: "SELLERS", action: "READ" },
        { status: perm.status || 403 }
      );
    }

    const sellers = await prisma.seller.findMany({
      include: { user: true, products: true, orderGroups: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sellers });
  } catch (error) {
    console.error("GET Admin Sellers API Error:", error);
    return NextResponse.json({ error: "Satıcılar getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 });
    }
    if (session.role === "ADMIN") {
      const perm = requirePermission(session, "SELLERS", "WRITE");
      if (!perm.authorized) {
        return NextResponse.json(
          { error: perm.error || "Yetkisiz erişim.", code: "FORBIDDEN", resource: "SELLERS", action: "WRITE" },
          { status: 403 }
        );
      }
    } else if (session.role !== "SELLER") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const body = await request.json();
    const {
      sellerId,
      verified,
      status,
      commissionRate,
      storeName,
      description,
      logo,
      banner,
      shippingPolicy,
      returnPolicy,
    } = body;

    if (!sellerId) {
      return NextResponse.json({ error: "Satıcı ID gereklidir." }, { status: 400 });
    }

    const existing = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!existing) {
      return NextResponse.json({ error: "Satıcı bulunamadı." }, { status: 404 });
    }

    // If SELLER, ensure they only edit their own profile
    if (session.role === "SELLER") {
      if (existing.userId !== session.id) {
        return NextResponse.json({ error: "Bu satıcı profilini düzenleme yetkiniz yok." }, { status: 403 });
      }
    }

    const seller = await prisma.seller.update({
      where: { id: sellerId },
      data: {
        ...(verified !== undefined && session.role === "ADMIN" ? { verified: Boolean(verified) } : {}),
        ...(status && session.role === "ADMIN" ? { status } : {}),
        ...(commissionRate !== undefined && session.role === "ADMIN" ? { commissionRate: Number(commissionRate) } : {}),
        ...(storeName ? { storeName } : {}),
        ...(description ? { description } : {}),
        ...(logo ? { logo } : {}),
        ...(banner ? { banner } : {}),
        ...(shippingPolicy !== undefined ? { shippingPolicy } : {}),
        ...(returnPolicy !== undefined ? { returnPolicy } : {}),
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: status && status !== existing.status ? "SELLER_STATUS_CHANGED" : "SELLER_UPDATED",
        entityType: "SELLER",
        entityId: seller.id,
        metadataJson: JSON.stringify({
          storeName: seller.storeName,
          verified: seller.verified,
          status: seller.status,
          commissionRate: seller.commissionRate,
        }),
      },
    });

    return NextResponse.json({ success: true, seller });
  } catch (error) {
    console.error("PUT Admin Seller Status API Error:", error);
    return NextResponse.json({ error: "Satıcı durumu güncellenemedi." }, { status: 500 });
  }
}
