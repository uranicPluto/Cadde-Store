import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { duplicatePage, getPageById } from "@/lib/cms/page-repository";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Yönetici yetkisi gereklidir." },
        { status: 403 }
      );
    }

    const { id } = params;
    const original = await getPageById(id);
    if (!original) {
      return NextResponse.json(
        { success: false, error: "Kopyalanacak kaynak sayfa bulunamadı." },
        { status: 404 }
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }

    const { newSlug, newTitleTr, newTitleEn } = body;

    if (newSlug) {
      const normalizedSlug = newSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
      const existing = await prisma.cmsPage.findUnique({
        where: { slug: normalizedSlug },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: `"${normalizedSlug}" adresi zaten kullanımda.` },
          { status: 409 }
        );
      }
    }

    const duplicated = await duplicatePage(
      id,
      newSlug ? newSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, "") : undefined,
      newTitleTr?.trim(),
      newTitleEn?.trim()
    );

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "PAGE_DUPLICATED",
        entityType: "CMS",
        entityId: duplicated.id,
        metadataJson: JSON.stringify({
          originalPageId: id,
          originalSlug: original.slug,
          newPageId: duplicated.id,
          newSlug: duplicated.slug,
          titleTr: duplicated.titleTr,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        page: duplicated,
        message: `"${duplicated.titleTr}" sayfası başarıyla oluşturuldu.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`POST /api/pages/${params.id}/duplicate Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Sayfa çoğaltılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
