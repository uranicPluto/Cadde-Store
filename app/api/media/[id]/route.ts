import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, context: RouteParams) {
  try {
    const params = await context.params;
    const { id } = params;

    const media = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Medya dosyası bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ media, asset: media });
  } catch (error) {
    console.error("GET Media Asset [id] API Error:", error);
    return NextResponse.json({ error: "Medya bilgisi getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SELLER")) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const params = await context.params;
    const { id } = params;

    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Medya dosyası bulunamadı." }, { status: 404 });
    }

    const body = await request.json();
    const {
      filename,
      url,
      mimeType,
      sizeBytes,
      width,
      height,
      altTextTr,
      altTextEn,
      tags,
      referenceCount,
    } = body;

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...(filename ? { filename } : {}),
        ...(url ? { url } : {}),
        ...(mimeType ? { mimeType } : {}),
        ...(sizeBytes !== undefined ? { sizeBytes: Number(sizeBytes) } : {}),
        ...(width !== undefined ? { width: width ? Number(width) : null } : {}),
        ...(height !== undefined ? { height: height ? Number(height) : null } : {}),
        ...(altTextTr !== undefined ? { altTextTr: altTextTr || null } : {}),
        ...(altTextEn !== undefined ? { altTextEn: altTextEn || null } : {}),
        ...(tags !== undefined ? { tags: typeof tags === "string" ? tags : tags ? JSON.stringify(tags) : null } : {}),
        ...(referenceCount !== undefined ? { referenceCount: Number(referenceCount) } : {}),
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "MEDIA_UPDATED",
        entityType: "MEDIA",
        entityId: id,
        metadataJson: JSON.stringify({
          filename: updated.filename,
          referenceCount: updated.referenceCount,
        }),
      },
    });

    return NextResponse.json({ success: true, media: updated });
  } catch (error) {
    console.error("PUT Media Asset [id] API Error:", error);
    return NextResponse.json({ error: "Medya bilgisi güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SELLER")) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const params = await context.params;
    const { id } = params;

    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Medya dosyası bulunamadı." }, { status: 404 });
    }

    await prisma.mediaAsset.delete({ where: { id } });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "MEDIA_DELETED",
        entityType: "MEDIA",
        entityId: id,
        metadataJson: JSON.stringify({
          filename: existing.filename,
          url: existing.url,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Media Asset [id] API Error:", error);
    return NextResponse.json({ error: "Medya dosyası silinemedi." }, { status: 500 });
  }
}
