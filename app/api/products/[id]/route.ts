import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, context: RouteParams) {
  try {
    const params = await context.params;
    const { id } = params;

    let product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: true,
        brandRef: true,
        reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
      },
    });

    if (!product) {
      // Fallback search by slug
      product = await prisma.product.findUnique({
        where: { slug: id },
        include: {
          category: true,
          seller: true,
          brandRef: true,
          reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
        },
      });
    }

    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET Product [id] API Error:", error);
    return NextResponse.json({ error: "Ürün getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SELLER" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const params = await context.params;
    const { id } = params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    if (session.role === "SELLER") {
      const sellerProfile = await prisma.seller.findUnique({ where: { userId: session.id } });
      if (!sellerProfile || existing.sellerId !== sellerProfile.id) {
        return NextResponse.json(
          { error: "Bu ürünü güncelleme yetkiniz bulunmamaktadır." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      name,
      brand,
      brandId,
      description,
      categoryId,
      price,
      originalPrice,
      stock,
      sku,
      imageUrl,
      images,
      colors,
      sizes,
      badges,
      status,
    } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(brand !== undefined ? { brand } : {}),
        ...(brandId !== undefined ? { brandId } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(originalPrice !== undefined
          ? { originalPrice: originalPrice ? Number(originalPrice) : null }
          : {}),
        ...(stock !== undefined ? { stock: Number(stock) } : {}),
        ...(sku ? { sku } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        ...(images !== undefined
          ? { images: typeof images === "string" ? images : JSON.stringify(images) }
          : {}),
        ...(colors !== undefined
          ? { colors: typeof colors === "string" ? colors : JSON.stringify(colors) }
          : {}),
        ...(sizes !== undefined
          ? { sizes: typeof sizes === "string" ? sizes : JSON.stringify(sizes) }
          : {}),
        ...(badges !== undefined
          ? { badges: typeof badges === "string" ? badges : JSON.stringify(badges) }
          : {}),
        ...(status ? { status } : {}),
      },
    });

    const diff = {
      price: { before: existing.price, after: updated.price },
      stock: { before: existing.stock, after: updated.stock },
      status: { before: existing.status, after: updated.status },
    };

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "PRODUCT_UPDATED",
        entityType: "PRODUCT",
        entityId: updated.id,
        metadataJson: JSON.stringify({
          name: updated.name,
          diff,
          price: updated.price,
          stock: updated.stock,
          status: updated.status,
        }),
      },
    });

    return NextResponse.json({ success: true, product: updated, diff });
  } catch (error) {
    console.error("PUT Product [id] API Error:", error);
    return NextResponse.json({ error: "Ürün güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SELLER" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const params = await context.params;
    const { id } = params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    if (session.role === "SELLER") {
      const sellerProfile = await prisma.seller.findUnique({ where: { userId: session.id } });
      if (!sellerProfile || existing.sellerId !== sellerProfile.id) {
        return NextResponse.json(
          { error: "Bu ürünü silme yetkiniz bulunmamaktadır." },
          { status: 403 }
        );
      }
    }

    await prisma.product.delete({ where: { id } });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "PRODUCT_DELETED",
        entityType: "PRODUCT",
        entityId: id,
        metadataJson: JSON.stringify({
          name: existing.name,
          sku: existing.sku,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Product [id] API Error:", error);
    return NextResponse.json({ error: "Ürün silinemedi." }, { status: 500 });
  }
}
