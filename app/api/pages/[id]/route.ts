import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import {
  getPageById,
  updatePage,
  deletePage,
  CmsPageInput,
} from "@/lib/cms/page-repository";

import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeVersions = searchParams.get("includeVersions") === "true";

    const page = await getPageById(id, includeVersions);

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Sayfa bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      page,
    });
  } catch (error: any) {
    console.error(`GET /api/pages/${params.id} Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Sayfa getirilemedi." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const permCheck = requirePermission(session, "PAGES", "WRITE");
    if (!permCheck.authorized) {
      return NextResponse.json(
        { success: false, error: permCheck.error || "Bu işlem için yetkiniz bulunmamaktadır.", code: "FORBIDDEN", resource: "PAGES", action: "WRITE" },
        { status: permCheck.status || 403 }
      );
    }

    const { id } = params;
    const existing = await getPageById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Güncellenecek sayfa bulunamadı." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      slug,
      titleTr,
      titleEn,
      type,
      status,
      sectionsJson,
      metaTitleTr,
      metaTitleEn,
      metaDescriptionTr,
      metaDescriptionEn,
      schedulePublishAt,
      scheduleUnpublishAt,
    } = body;

    if (slug) {
      const normalizedSlug = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
      if (normalizedSlug !== existing.slug) {
        const slugExists = await prisma.cmsPage.findUnique({
          where: { slug: normalizedSlug },
        });
        if (slugExists && slugExists.id !== id) {
          return NextResponse.json(
            { success: false, error: `"${normalizedSlug}" adresi (slug) başka bir sayfa tarafından kullanılıyor.` },
            { status: 409 }
          );
        }
      }
    }

    const updateData: Partial<CmsPageInput> = {};
    if (slug !== undefined) updateData.slug = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
    if (titleTr !== undefined) updateData.titleTr = titleTr.trim();
    if (titleEn !== undefined) updateData.titleEn = titleEn.trim();
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (sectionsJson !== undefined) updateData.sectionsJson = sectionsJson;
    if (metaTitleTr !== undefined) updateData.metaTitleTr = metaTitleTr;
    if (metaTitleEn !== undefined) updateData.metaTitleEn = metaTitleEn;
    if (metaDescriptionTr !== undefined) updateData.metaDescriptionTr = metaDescriptionTr;
    if (metaDescriptionEn !== undefined) updateData.metaDescriptionEn = metaDescriptionEn;
    if (schedulePublishAt !== undefined) updateData.schedulePublishAt = schedulePublishAt;
    if (scheduleUnpublishAt !== undefined) updateData.scheduleUnpublishAt = scheduleUnpublishAt;

    const updated = await updatePage(id, updateData);

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session!.id,
        actorEmail: session!.email,
        actorRole: session!.role,
        action: "PAGE_UPDATED",
        entityType: "CMS",
        entityId: updated.id,
        metadataJson: JSON.stringify({
          pageId: updated.id,
          slug: updated.slug,
          status: updated.status,
          updatedFields: Object.keys(updateData),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      page: updated,
    });
  } catch (error: any) {
    console.error(`PUT /api/pages/${params.id} Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Sayfa güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const permCheck = requirePermission(session, "PAGES", "DELETE");
    if (!permCheck.authorized) {
      return NextResponse.json(
        { success: false, error: permCheck.error || "Bu işlem için yetkiniz bulunmamaktadır.", code: "FORBIDDEN", resource: "PAGES", action: "DELETE" },
        { status: permCheck.status || 403 }
      );
    }

    const { id } = params;
    const existing = await getPageById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Silinecek sayfa bulunamadı." },
        { status: 404 }
      );
    }

    await deletePage(id);

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session!.id,
        actorEmail: session!.email,
        actorRole: session!.role,
        action: "PAGE_DELETED",
        entityType: "CMS",
        entityId: id,
        metadataJson: JSON.stringify({
          deletedPageId: id,
          slug: existing.slug,
          titleTr: existing.titleTr,
          type: existing.type,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      deleted: true,
      message: `"${existing.titleTr}" sayfası başarıyla silindi.`,
    });
  } catch (error: any) {
    console.error(`DELETE /api/pages/${params.id} Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Sayfa silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
