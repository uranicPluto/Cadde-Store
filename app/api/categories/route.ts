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

    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { nameTR: "asc" },
    });

    const mappedCategories = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
    }));

    return NextResponse.json({ categories: mappedCategories });
  } catch (error) {
    console.error("GET Categories API Error:", error);
    return NextResponse.json({ error: "Kategoriler getirilemedi." }, { status: 500 });
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
