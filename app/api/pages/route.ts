import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import {
  getAllPages,
  createPage,
  ensureDefaultStaticPages,
  CmsPageInput,
} from "@/lib/cms/page-repository";

import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";


export async function GET(request: Request) {
  try {
    await ensureDefaultStaticPages();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;

    const pages = await getAllPages({
      type,
      status,
      search,
      limit,
      offset,
    });

    const total = await prisma.cmsPage.count({
      where: {
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { slug: { contains: search.toLowerCase() } },
                { titleTr: { contains: search } },
                { titleEn: { contains: search } },
              ],
            }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      pages,
      total,
    });
  } catch (error: any) {
    console.error("GET /api/pages Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Sayfalar listelenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const permCheck = requirePermission(session, "PAGES", "WRITE");
    if (!permCheck.authorized) {
      return NextResponse.json(
        { success: false, error: permCheck.error || "Bu işlem için yetkiniz bulunmamaktadır.", code: "FORBIDDEN", resource: "PAGES", action: "WRITE" },
        { status: permCheck.status || 403 }
      );
    }

    const body = await request.json();
    const {
      slug,
      titleTr,
      titleEn,
      type = "CUSTOM",
      status = "DRAFT",
      sectionsJson = "[]",
      metaTitleTr,
      metaTitleEn,
      metaDescriptionTr,
      metaDescriptionEn,
      schedulePublishAt,
      scheduleUnpublishAt,
    } = body;

    if (!slug || !titleTr || !titleEn) {
      return NextResponse.json(
        { success: false, error: "Slug, Türkçe başlık ve İngilizce başlık alanları zorunludur." },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
    const existing = await prisma.cmsPage.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `"${normalizedSlug}" adresi (slug) zaten kullanımda.` },
        { status: 409 }
      );
    }

    const pageInput: CmsPageInput = {
      slug: normalizedSlug,
      titleTr: titleTr.trim(),
      titleEn: titleEn.trim(),
      type,
      status,
      sectionsJson,
      metaTitleTr: metaTitleTr || null,
      metaTitleEn: metaTitleEn || null,
      metaDescriptionTr: metaDescriptionTr || null,
      metaDescriptionEn: metaDescriptionEn || null,
      schedulePublishAt: schedulePublishAt || null,
      scheduleUnpublishAt: scheduleUnpublishAt || null,
      authorId: session!.id,
    };

    const newPage = await createPage(pageInput, session!.id);

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session!.id,
        actorEmail: session!.email,
        actorRole: session!.role,
        action: "PAGE_CREATED",
        entityType: "CMS",
        entityId: newPage.id,
        metadataJson: JSON.stringify({
          pageId: newPage.id,
          slug: newPage.slug,
          titleTr: newPage.titleTr,
          type: newPage.type,
          status: newPage.status,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        page: newPage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/pages Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Sayfa oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
