import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");
    const categorySlug = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const sellerSlug = searchParams.get("seller");
    const sellerId = searchParams.get("sellerId");
    const brandParam = searchParams.get("brand");
    const brandId = searchParams.get("brandId");
    const query = searchParams.get("search") || searchParams.get("query");
    const statusParam = searchParams.get("status");

    if (slug) {
      let product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          seller: true,
          brandRef: true,
          reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
        },
      });

      if (!product) {
        product = await prisma.product.findUnique({
          where: { id: slug },
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
    }

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          seller: true,
          brandRef: true,
          reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
        },
      });
      if (!product) {
        return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ product });
    }

    const where: any = {};

    if (statusParam) {
      where.status = statusParam;
    } else if (!sellerId && !sellerSlug) {
      // Default to ACTIVE for public catalog browsing
      where.status = "ACTIVE";
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (sellerSlug) {
      where.seller = { slug: sellerSlug };
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (brandParam) {
      where.OR = [
        { brand: { contains: brandParam } },
        { brandRef: { slug: brandParam } },
      ];
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { brand: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true, seller: true, brandRef: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET Products API Error:", error);
    return NextResponse.json({ error: "Ürünler getirilemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 });
    }
    if (session.role === "ADMIN") {
      const perm = requirePermission(session, "CATALOG", "WRITE");
      if (!perm.authorized) {
        return NextResponse.json({ error: perm.error, code: "FORBIDDEN", resource: "CATALOG", action: "WRITE" }, { status: 403 });
      }
    } else if (session.role !== "SELLER") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz bulunmamaktadır." }, { status: 403 });
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

    if (!name || price === undefined || price === null || !categoryId || !sku) {
      return NextResponse.json(
        { error: "Lütfen tüm zorunlu ürün alanlarını doldurun." },
        { status: 400 }
      );
    }

    let sellerId = body.sellerId;
    if (session.role === "SELLER") {
      const sellerProfile = await prisma.seller.findUnique({ where: { userId: session.id } });
      if (!sellerProfile) {
        return NextResponse.json({ error: "Satıcı profili bulunamadı." }, { status: 403 });
      }
      sellerId = sellerProfile.id;
    } else if (!sellerId) {
      const firstSeller = await prisma.seller.findFirst();
      if (!firstSeller) {
        return NextResponse.json({ error: "Sistemde satıcı bulunamadı." }, { status: 400 });
      }
      sellerId = firstSeller.id;
    }

    const cleanSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "urun";
    const slug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        sellerId,
        categoryId,
        brandId: brandId || null,
        name,
        slug,
        brand: brand || "Cadde Store",
        description: description || name,
        sku,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        stock: Number(stock || 0),
        imageUrl:
          imageUrl ||
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
        images: typeof images === "string" ? images : JSON.stringify(images || []),
        colors: typeof colors === "string" ? colors : JSON.stringify(colors || []),
        sizes: typeof sizes === "string" ? sizes : JSON.stringify(sizes || []),
        badges: typeof badges === "string" ? badges : badges ? JSON.stringify(badges) : null,
        status: status || "ACTIVE",
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "PRODUCT_CREATED",
        entityType: "PRODUCT",
        entityId: product.id,
        metadataJson: JSON.stringify({
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
          sellerId: product.sellerId,
        }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("POST Product API Error:", error);
    return NextResponse.json({ error: "Ürün eklenirken bir hata oluştu." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 });
    }
    if (session.role === "ADMIN") {
      const perm = requirePermission(session, "CATALOG", "WRITE");
      if (!perm.authorized) {
        return NextResponse.json({ error: perm.error, code: "FORBIDDEN", resource: "CATALOG", action: "WRITE" }, { status: 403 });
      }
    } else if (session.role !== "SELLER") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz bulunmamaktadır." }, { status: 403 });
    }

    const body = await request.json();
    const id = body.id || body.productId;

    if (!id) {
      return NextResponse.json({ error: "Ürün ID zorunludur." }, { status: 400 });
    }

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
    console.error("PUT Product API Error:", error);
    return NextResponse.json({ error: "Ürün güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 });
    }
    if (session.role === "ADMIN") {
      const perm = requirePermission(session, "CATALOG", "DELETE");
      if (!perm.authorized) {
        return NextResponse.json({ error: perm.error, code: "FORBIDDEN", resource: "CATALOG", action: "DELETE" }, { status: 403 });
      }
    } else if (session.role !== "SELLER") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz bulunmamaktadır." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id || body.productId;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: "Ürün ID zorunludur." }, { status: 400 });
    }

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
    console.error("DELETE Product API Error:", error);
    return NextResponse.json({ error: "Ürün silinemedi." }, { status: 500 });
  }
}
