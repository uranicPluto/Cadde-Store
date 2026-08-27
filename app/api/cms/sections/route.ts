import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getMockBanners } from "@/lib/mock-data";
import { getSessionUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    const sections = await prisma.homepageSection.findMany({
      where: includeAll ? {} : { active: true },
      orderBy: { orderIndex: "asc" },
      include: {
        banners: {
          where: includeAll ? {} : { active: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!sections || sections.length === 0) {
      if (includeAll) {
        return NextResponse.json({ sections: [], source: "empty" });
      }

      // Return structured fallback matching default UI for public view
      const mockBanners = getMockBanners();
      return NextResponse.json({
        sections: [
          {
            id: "hero-main-section",
            titleTR: "Ana Sayfa Vitrin",
            titleEN: "Homepage Main Hero",
            type: "HERO",
            orderIndex: 0,
            active: true,
            configJson: JSON.stringify({ autoplay: true, intervalMs: 5000 }),
            banners: mockBanners.map((b, i) => ({
              id: b.id,
              sectionId: "hero-main-section",
              titleTR: b.title,
              titleEN: b.title,
              subtitleTR: b.subtitle,
              subtitleEN: b.subtitle,
              imageUrlDesktop: b.imageUrl,
              imageUrlMobile: b.imageUrl,
              targetType: "CATEGORY",
              targetValue: "/category/women",
              badgeTextTR: b.badge || null,
              badgeTextEN: b.badge || null,
              orderIndex: i,
              active: true,
            })),
          },
        ],
        source: "mock",
      });
    }

    return NextResponse.json({ sections, source: "database" });
  } catch (error) {
    console.error("[API CMS Sections GET Error]:", error);
    return NextResponse.json({
      sections: [],
      source: "error-fallback",
    });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const perm = requirePermission(user, "HOMEPAGE", "WRITE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem", code: "FORBIDDEN", resource: "HOMEPAGE", action: "WRITE" },
        { status: perm.status || 403 }
      );
    }

    const body = await request.json();
    const { titleTR, titleEN, type, orderIndex, configJson, active, startDate, endDate } = body;

    if (!titleTR || !titleEN) {
      return NextResponse.json({ error: "Türkçe ve İngilizce başlık zorunludur." }, { status: 400 });
    }

    const section = await prisma.homepageSection.create({
      data: {
        titleTR,
        titleEN,
        type: type || "HERO",
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0,
        configJson: typeof configJson === "string" ? configJson : JSON.stringify(configJson || {}),
        active: active !== undefined ? Boolean(active) : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user!.id,
          actorEmail: user!.email,
          actorRole: user!.role,
          action: "CMS_SECTION_CREATED",
          entityType: "CMS",
          entityId: section.id,
          metadataJson: JSON.stringify({ sectionTitle: section.titleTR, type: section.type }),
        },
      });
    } catch (e) {
      console.warn("Audit log creation warning:", e);
    }

    return NextResponse.json({ section, success: true }, { status: 201 });
  } catch (error) {
    console.error("[API CMS Section POST Error]:", error);
    return NextResponse.json({ error: "CMS bölümü oluşturulamadı." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    const perm = requirePermission(user, "HOMEPAGE", "WRITE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem", code: "FORBIDDEN", resource: "HOMEPAGE", action: "WRITE" },
        { status: perm.status || 403 }
      );
    }

    const body = await request.json();
    const { id, titleTR, titleEN, type, orderIndex, active, configJson, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json({ error: "Bölüm ID gereklidir." }, { status: 400 });
    }

    const section = await prisma.homepageSection.update({
      where: { id },
      data: {
        ...(titleTR !== undefined && { titleTR }),
        ...(titleEN !== undefined && { titleEN }),
        ...(type !== undefined && { type }),
        ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(configJson !== undefined && { configJson: typeof configJson === "string" ? configJson : JSON.stringify(configJson) }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user!.id,
          actorEmail: user!.email,
          actorRole: user!.role,
          action: "CMS_SECTION_UPDATED",
          entityType: "CMS",
          entityId: section.id,
          metadataJson: JSON.stringify({
            sectionTitle: section.titleTR,
            type: section.type,
            active: section.active,
            orderIndex: section.orderIndex,
          }),
        },
      });
    } catch (e) {
      console.warn("Audit log creation warning:", e);
    }

    return NextResponse.json({ section, success: true });
  } catch (error) {
    console.error("[API CMS Section PUT Error]:", error);
    return NextResponse.json({ error: "Bölüm güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    const perm = requirePermission(user, "HOMEPAGE", "DELETE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem", code: "FORBIDDEN", resource: "HOMEPAGE", action: "DELETE" },
        { status: perm.status || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // No body
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Bölüm ID gereklidir." }, { status: 400 });
    }

    const section = await prisma.homepageSection.delete({
      where: { id },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user!.id,
          actorEmail: user!.email,
          actorRole: user!.role,
          action: "CMS_SECTION_DELETED",
          entityType: "CMS",
          entityId: id,
          metadataJson: JSON.stringify({ sectionTitle: section.titleTR, type: section.type }),
        },
      });
    } catch (e) {
      console.warn("Audit log creation warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API CMS Section DELETE Error]:", error);
    return NextResponse.json({ error: "Bölüm silinemedi." }, { status: 500 });
  }
}
