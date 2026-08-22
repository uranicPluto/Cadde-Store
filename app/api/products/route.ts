import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const categorySlug = searchParams.get("category");
    const sellerSlug = searchParams.get("seller");
    const query = searchParams.get("search");

    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true, seller: true, reviews: { include: { user: true } } },
      });
      if (!product) return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
      return NextResponse.json({ product });
    }

    const where: any = { status: "ACTIVE" };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (sellerSlug) {
      where.seller = { slug: sellerSlug };
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
      include: { category: true, seller: true },
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
    if (!session || (session.role !== "SELLER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Bu işlem için satıcı veya yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const body = await request.json();
    const { name, brand, description, categoryId, price, originalPrice, stock, sku, imageUrl, colors, sizes } = body;

    if (!name || !price || !categoryId || !sku) {
      return NextResponse.json({ error: "Lütfen tüm zorunlu ürün alanlarını doldurun." }, { status: 400 });
    }

    let sellerId = body.sellerId;
    if (session.role === "SELLER") {
      const sellerProfile = await prisma.seller.findUnique({ where: { userId: session.id } });
      if (!sellerProfile) {
        return NextResponse.json({ error: "Satıcı profili bulunamadı." }, { status: 403 });
      }
      sellerId = sellerProfile.id;
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        sellerId,
        categoryId,
        name,
        slug,
        brand: brand || "Cadde Store",
        description: description || name,
        sku,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        stock: Number(stock || 0),
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
        colors: JSON.stringify(colors || []),
        sizes: JSON.stringify(sizes || []),
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("POST Product API Error:", error);
    return NextResponse.json({ error: "Ürün eklenirken bir hata oluştu." }, { status: 500 });
  }
}
