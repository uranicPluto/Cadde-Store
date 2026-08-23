import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getMockNavigationCategories, getMockTopUtilityLinks } from "@/lib/navigation-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const active = searchParams.get("active") || searchParams.get("isActive");
    const parentId = searchParams.get("parentId");
    const rootOnly = searchParams.get("rootOnly") === "true";
    const lang = searchParams.get("lang") === "en" ? "en" : "tr";
    const isEn = lang === "en";

    const where: any = {};

    if (section) {
      where.section = section;
    }
    if (active !== null && active !== undefined) {
      where.isActive = active === "true" || active === "1";
    }
    if (parentId !== null && parentId !== undefined) {
      where.parentId = parentId === "null" || parentId === "" ? null : parentId;
    } else if (rootOnly) {
      where.parentId = null;
    }

    // Fetch navigation items from NavigationItem table
    const items = await prisma.navigationItem.findMany({
      where,
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Also build rich category navigation tree for mega-menu and storefront navigation
    let dbCategories: any[] = [];
    try {
      dbCategories = await prisma.category.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "asc" },
      });
    } catch (e) {}

    const mockCategories = getMockNavigationCategories(lang);
    const utilityLinks = getMockTopUtilityLinks(lang);

    let finalCategories = mockCategories;
    if (dbCategories && dbCategories.length > 0) {
      const categoryMap = new Map(mockCategories.map((c) => [c.slug, c]));
      finalCategories = dbCategories.map((dbCat) => {
        const mockMatch = categoryMap.get(dbCat.slug) || categoryMap.get(dbCat.slug.toLowerCase());
        return {
          id: dbCat.id,
          name: isEn ? dbCat.nameEN || dbCat.nameTR : dbCat.nameTR || dbCat.nameEN,
          slug: dbCat.slug,
          icon: mockMatch?.icon || "Tag",
          isHot: mockMatch?.isHot || dbCat.slug === "kadin" || dbCat.slug === "women" || dbCat.slug === "elektronik",
          badgeTR: mockMatch?.isHot ? "YENİ" : undefined,
          badgeEN: mockMatch?.isHot ? "NEW" : undefined,
          subcategories: mockMatch?.subcategories || [
            {
              name: isEn ? "All Products" : "Tüm Ürünler",
              items: isEn ? ["Bestsellers", "New Arrivals", "Discounted"] : ["Çok Satanlar", "Yeni Gelenler", "İndirimli Ürünler"],
            },
          ],
          popularBrands: mockMatch?.popularBrands || ["Nike", "Zara", "Apple", "Samsung", "Karaca"],
          promotionalBanner: mockMatch?.promotionalBanner || {
            title: isEn ? `${dbCat.nameEN} Collection` : `${dbCat.nameTR} Koleksiyonu`,
            subtitle: isEn ? "Explore top curated trends" : "En trend modelleri keşfet",
            imageUrl: dbCat.imageUrl || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
            ctaText: isEn ? "Explore" : "İncele",
            bgGradient: "from-orange-500 to-rose-600",
          },
        };
      });
    }

    return NextResponse.json({
      success: true,
      items,
      navigation: items,
      categories: finalCategories,
      utilityLinks,
      source: "database",
    });
  } catch (error) {
    console.error("GET Navigation API Error:", error);
    return NextResponse.json({ error: "Navigasyon menüsü getirilemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const body = await request.json();
    const {
      titleTr,
      titleEn,
      url,
      section,
      parentId,
      sortOrder,
      badgeTr,
      badgeEn,
      isActive,
    } = body;

    if (!titleTr || !url) {
      return NextResponse.json(
        { error: "Başlık (TR) ve hedef URL zorunludur." },
        { status: 400 }
      );
    }

    const item = await prisma.navigationItem.create({
      data: {
        titleTr,
        titleEn: titleEn || titleTr,
        url,
        section: section || "HEADER",
        parentId: parentId || null,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        badgeTr: badgeTr || null,
        badgeEn: badgeEn || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
        children: true,
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "NAVIGATION_CREATED",
        entityType: "NAVIGATION",
        entityId: item.id,
        metadataJson: JSON.stringify({
          titleTr: item.titleTr,
          titleEn: item.titleEn,
          url: item.url,
          section: item.section,
        }),
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("POST Navigation Item API Error:", error);
    return NextResponse.json({ error: "Navigasyon öğesi oluşturulamadı." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const body = await request.json();

    // Support bulk reordering or multiple item updates
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        if (item.id) {
          await prisma.navigationItem.update({
            where: { id: item.id },
            data: {
              ...(item.sortOrder !== undefined ? { sortOrder: Number(item.sortOrder) } : {}),
              ...(item.isActive !== undefined ? { isActive: Boolean(item.isActive) } : {}),
              ...(item.section ? { section: item.section } : {}),
              ...(item.parentId !== undefined ? { parentId: item.parentId || null } : {}),
            },
          });
        }
      }

      await prisma.auditLog.create({
        data: {
          actorId: session.id,
          actorEmail: session.email,
          actorRole: session.role,
          action: "NAVIGATION_UPDATED",
          entityType: "NAVIGATION",
          metadataJson: JSON.stringify({ count: body.items.length }),
        },
      });

      return NextResponse.json({ success: true });
    }

    const {
      id,
      titleTr,
      titleEn,
      url,
      section,
      parentId,
      sortOrder,
      badgeTr,
      badgeEn,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Navigasyon ID gereklidir." }, { status: 400 });
    }

    const updated = await prisma.navigationItem.update({
      where: { id },
      data: {
        ...(titleTr ? { titleTr } : {}),
        ...(titleEn ? { titleEn } : {}),
        ...(url ? { url } : {}),
        ...(section ? { section } : {}),
        ...(parentId !== undefined ? { parentId: parentId || null } : {}),
        ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
        ...(badgeTr !== undefined ? { badgeTr: badgeTr || null } : {}),
        ...(badgeEn !== undefined ? { badgeEn: badgeEn || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "NAVIGATION_UPDATED",
        entityType: "NAVIGATION",
        entityId: id,
        metadataJson: JSON.stringify({
          titleTr: updated.titleTr,
          url: updated.url,
          section: updated.section,
        }),
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("PUT Navigation Items API Error:", error);
    return NextResponse.json({ error: "Navigasyon güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
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
      return NextResponse.json({ error: "Navigasyon ID gereklidir." }, { status: 400 });
    }

    const existing = await prisma.navigationItem.findUnique({ where: { id } });
    if (existing) {
      await prisma.navigationItem.delete({ where: { id } });

      await prisma.auditLog.create({
        data: {
          actorId: session.id,
          actorEmail: session.email,
          actorRole: session.role,
          action: "NAVIGATION_DELETED",
          entityType: "NAVIGATION",
          entityId: id,
          metadataJson: JSON.stringify({
            titleTr: existing.titleTr,
            section: existing.section,
          }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Navigation API Error:", error);
    return NextResponse.json({ error: "Navigasyon silinemedi." }, { status: 500 });
  }
}
