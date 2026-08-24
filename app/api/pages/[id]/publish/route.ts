import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { publishPage, unpublishPage, getPageById } from "@/lib/cms/page-repository";

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
    const page = await getPageById(id);
    if (!page) {
      return NextResponse.json(
        { success: false, error: "Yayınlanacak sayfa bulunamadı." },
        { status: 404 }
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }

    const action = body.action || "publish"; // "publish" or "unpublish"
    const changeSummary = body.changeSummary || undefined;

    if (action === "unpublish") {
      const unpublished = await unpublishPage(id);

      await prisma.auditLog.create({
        data: {
          actorId: session.id,
          actorEmail: session.email,
          actorRole: session.role,
          action: "PAGE_UNPUBLISHED",
          entityType: "CMS",
          entityId: id,
          metadataJson: JSON.stringify({
            pageId: id,
            slug: unpublished.slug,
            status: "DRAFT",
          }),
        },
      });

      return NextResponse.json({
        success: true,
        page: unpublished,
        message: "Sayfa taslak durumuna alındı.",
      });
    }

    const { page: publishedPage, version } = await publishPage(
      id,
      session.email || session.id,
      changeSummary
    );

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "PAGE_PUBLISHED",
        entityType: "CMS",
        entityId: id,
        metadataJson: JSON.stringify({
          pageId: id,
          slug: publishedPage.slug,
          versionNumber: version.versionNumber,
          versionId: version.id,
          changeSummary: version.changeSummary,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      page: publishedPage,
      version,
      message: `"${publishedPage.titleTr}" sayfası başarıyla yayınlandı (v${version.versionNumber}).`,
    });
  } catch (error: any) {
    console.error(`POST /api/pages/${params.id}/publish Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Sayfa yayınlanırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
