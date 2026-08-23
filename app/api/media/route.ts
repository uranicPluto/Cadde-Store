import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mimeType = searchParams.get("mimeType") || searchParams.get("type");
    const search = searchParams.get("search") || searchParams.get("query");

    const where: any = {};

    if (mimeType) {
      where.mimeType = { contains: mimeType };
    }

    if (search) {
      where.OR = [
        { filename: { contains: search } },
        { altTextTr: { contains: search } },
        { altTextEn: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const assets = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ media: assets, assets });
  } catch (error) {
    console.error("GET Media Assets API Error:", error);
    return NextResponse.json({ error: "Medya dosyaları yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SELLER")) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
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
      uploadedBy,
    } = body;

    if (!filename || !url) {
      return NextResponse.json(
        { error: "Dosya adı ve URL zorunludur." },
        { status: 400 }
      );
    }

    const media = await prisma.mediaAsset.create({
      data: {
        filename,
        url,
        mimeType: mimeType || "image/jpeg",
        sizeBytes: sizeBytes !== undefined ? Number(sizeBytes) : 0,
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
        altTextTr: altTextTr || null,
        altTextEn: altTextEn || null,
        tags: typeof tags === "string" ? tags : tags ? JSON.stringify(tags) : null,
        referenceCount: referenceCount !== undefined ? Number(referenceCount) : 0,
        uploadedBy: uploadedBy || session.id,
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "MEDIA_CREATED",
        entityType: "MEDIA",
        entityId: media.id,
        metadataJson: JSON.stringify({
          filename: media.filename,
          mimeType: media.mimeType,
          sizeBytes: media.sizeBytes,
          url: media.url,
        }),
      },
    });

    return NextResponse.json({ success: true, media }, { status: 201 });
  } catch (error) {
    console.error("POST Media Asset API Error:", error);
    return NextResponse.json({ error: "Medya kaydı oluşturulamadı." }, { status: 500 });
  }
}
