import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import {
  getPageVersions,
  rollbackPageVersion,
  getPageById,
} from "@/lib/cms/page-repository";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const page = await getPageById(id);
    if (!page) {
      return NextResponse.json(
        { success: false, error: "Sayfa bulunamadı." },
        { status: 404 }
      );
    }

    const versions = await getPageVersions(id);

    return NextResponse.json({
      success: true,
      versions,
    });
  } catch (error: any) {
    console.error(`GET /api/pages/${params.id}/versions Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Versiyon geçmişi getirilemedi." },
      { status: 500 }
    );
  }
}

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
        { success: false, error: "Sayfa bulunamadı." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json(
        { success: false, error: "Geri dönülecek versiyon ID'si belirtilmelidir." },
        { status: 400 }
      );
    }

    const restoredPage = await rollbackPageVersion(
      id,
      versionId,
      session.email || session.id
    );

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "PAGE_ROLLED_BACK",
        entityType: "CMS",
        entityId: id,
        metadataJson: JSON.stringify({
          pageId: id,
          slug: restoredPage.slug,
          versionId,
          restoredTitleTr: restoredPage.titleTr,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      page: restoredPage,
      message: "Sayfa başarıyla seçilen versiyona geri döndürüldü ve taslak olarak kaydedildi.",
    });
  } catch (error: any) {
    console.error(`POST /api/pages/${params.id}/versions Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Versiyon geri yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
