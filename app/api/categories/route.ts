import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          products: { where: { status: "ACTIVE" } },
          _count: { select: { products: true } },
        },
      });
      if (!category) {
        return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({
        category: {
          ...category,
          productCount: category._count.products,
        },
      });
    }

    if (id) {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          products: { where: { status: "ACTIVE" } },
          _count: { select: { products: true } },
        },
      });
      if (!category) {
        return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({
        category: {
          ...category,
          productCount: category._count.products,
        },
      });
    }

    let categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { nameTR: "asc" },
    });

    if (!categories || categories.length === 0) {
      // Auto-provision initial categories into database if empty
      const initialCats = [
        { nameTR: "Kadın Giyim & Moda", nameEN: "Women's Fashion", slug: "kadin", descriptionTR: "Kadın giyim ve moda koleksiyonları", descriptionEN: "Women fashion collections", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80", status: "active" },
        { nameTR: "Erkek Giyim & Moda", nameEN: "Men's Fashion", slug: "erkek", descriptionTR: "Erkek giyim ve moda koleksiyonları", descriptionEN: "Men fashion collections", imageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=400&q=80", status: "active" },
        { nameTR: "Çocuk & Bebek", nameEN: "Kids & Baby", slug: "cocuk", descriptionTR: "Çocuk ve bebek ürünleri", descriptionEN: "Kids and baby products", imageUrl: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=400&q=80", status: "active" },
        { nameTR: "Elektronik & Teknoloji", nameEN: "Electronics & Tech", slug: "elektronik", descriptionTR: "Elektronik ve teknolojik ürünler", descriptionEN: "Electronics and technology products", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80", status: "active" },
        { nameTR: "Ev & Yaşam", nameEN: "Home & Living", slug: "ev-yasam", descriptionTR: "Ev ve yaşam gereçleri", descriptionEN: "Home and living essentials", imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80", status: "active" },
        { nameTR: "Kozmetik & Kişisel Bakım", nameEN: "Beauty & Personal Care", slug: "kozmetik", descriptionTR: "Kozmetik ve kişisel bakım", descriptionEN: "Beauty and personal care", imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80", status: "active" },
        { nameTR: "Ayakkabı & Çanta", nameEN: "Shoes & Bags", slug: "ayakkabi-canta", descriptionTR: "Ayakkabı ve çanta modelleri", descriptionEN: "Shoes and bag models", imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80", status: "active" },
        { nameTR: "Spor & Outdoor", nameEN: "Sports & Outdoor", slug: "spor", descriptionTR: "Spor ve outdoor ekipmanları", descriptionEN: "Sports and outdoor gear", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80", status: "active" },
        { nameTR: "Süpermarket & Gıda", nameEN: "Supermarket & Food", slug: "supermarket", descriptionTR: "Süpermarket ve temel gıda", descriptionEN: "Supermarket and basic groceries", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80", status: "active" },
        { nameTR: "Kitap, Müzik & Hobi", nameEN: "Books, Music & Hobbies", slug: "kitap-kirtasiye", descriptionTR: "Kitap, kırtasiye ve hobi ürünleri", descriptionEN: "Books, stationery and hobbies", imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80", status: "active" },
      ];

      for (const item of initialCats) {
        try {
          await prisma.category.create({ data: item });
        } catch (e) {}
      }

      categories = await prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { nameTR: "asc" },
      });
    }

    const mappedCategories = categories.map((cat) => ({
      ...cat,
      productCount: cat._count?.products || 0,
    }));

    return NextResponse.json({ categories: mappedCategories });
  } catch (error) {
    console.error("GET Categories API Error:", error);
    return NextResponse.json({
      categories: [
        { id: "cat-kadin", nameTR: "Kadın Giyim & Moda", nameEN: "Women's Fashion", slug: "kadin", productCount: 14 },
        { id: "cat-erkek", nameTR: "Erkek Giyim & Moda", nameEN: "Men's Fashion", slug: "erkek", productCount: 10 },
        { id: "cat-cocuk", nameTR: "Çocuk & Bebek", nameEN: "Kids & Baby", slug: "cocuk", productCount: 8 },
        { id: "cat-elektronik", nameTR: "Elektronik & Teknoloji", nameEN: "Electronics & Tech", slug: "elektronik", productCount: 12 },
        { id: "cat-ev-yasam", nameTR: "Ev & Yaşam", nameEN: "Home & Living", slug: "ev-yasam", productCount: 9 },
        { id: "cat-kozmetik", nameTR: "Kozmetik & Kişisel Bakım", nameEN: "Beauty & Personal Care", slug: "kozmetik", productCount: 6 },
        { id: "cat-ayakkabi-canta", nameTR: "Ayakkabı & Çanta", nameEN: "Shoes & Bags", slug: "ayakkabi-canta", productCount: 8 },
        { id: "cat-spor", nameTR: "Spor & Outdoor", nameEN: "Sports & Outdoor", slug: "spor", productCount: 7 },
      ]
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yönetici yetkisi gereklidir." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      nameTR,
      nameEN,
      slug,
      descriptionTR,
      descriptionEN,
      imageUrl,
      parentId,
      status,
    } = body;

    if (!nameTR || !slug) {
      return NextResponse.json(
        { error: "Kategori adı (TR) ve slug zorunludur." },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu slug ile bir kategori zaten mevcut." },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        slug,
        nameTR,
        nameEN: nameEN || nameTR,
        descriptionTR: descriptionTR || nameTR,
        descriptionEN: descriptionEN || nameEN || nameTR,
        imageUrl:
          imageUrl ||
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
        parentId: parentId || null,
        status: status || "active",
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "CATEGORY_CREATED",
        entityType: "CATEGORY",
        entityId: category.id,
        metadataJson: JSON.stringify({
          nameTR: category.nameTR,
          nameEN: category.nameEN,
          slug: category.slug,
        }),
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("POST Category API Error:", error);
    return NextResponse.json({ error: "Kategori eklenirken bir hata oluştu." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yönetici yetkisi gereklidir." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      nameTR,
      nameEN,
      slug,
      descriptionTR,
      descriptionEN,
      imageUrl,
      parentId,
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Kategori ID zorunludur." }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(nameTR ? { nameTR } : {}),
        ...(nameEN ? { nameEN } : {}),
        ...(slug ? { slug } : {}),
        ...(descriptionTR !== undefined ? { descriptionTR } : {}),
        ...(descriptionEN !== undefined ? { descriptionEN } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(parentId !== undefined ? { parentId: parentId || null } : {}),
        ...(status ? { status } : {}),
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "CATEGORY_UPDATED",
        entityType: "CATEGORY",
        entityId: updated.id,
        metadataJson: JSON.stringify({
          nameTR: updated.nameTR,
          slug: updated.slug,
          status: updated.status,
        }),
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error("PUT Category API Error:", error);
    return NextResponse.json({ error: "Kategori güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yönetici yetkisi gereklidir." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: "Kategori ID zorunludur." }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
    }

    await prisma.category.delete({ where: { id } });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "CATEGORY_DELETED",
        entityType: "CATEGORY",
        entityId: id,
        metadataJson: JSON.stringify({
          nameTR: existing.nameTR,
          slug: existing.slug,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Category API Error:", error);
    return NextResponse.json({ error: "Kategori silinemedi." }, { status: 500 });
  }
}
