import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 });
    }
    if (session.role === "ADMIN") {
      const perm = requirePermission(session, "MEDIA", "WRITE");
      if (!perm.authorized) {
        return NextResponse.json({ error: perm.error || "Yetkisiz işlem.", code: "FORBIDDEN", resource: "MEDIA", action: "WRITE" }, { status: 403 });
      }
    } else if (session.role !== "SELLER") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz bulunmamaktadır." }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Geçersiz içerik tipi. multipart/form-data bekleniyor." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altTextTr = (formData.get("altTextTr") as string) || "";
    const altTextEn = (formData.get("altTextEn") as string) || "";
    const tags = (formData.get("tags") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "Yüklenecek dosya bulunamadı." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean and generate unique filename
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(originalName) || ".jpg";
    const baseName = path.basename(originalName, ext);
    const finalFilename = `${baseName}-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadsDir, finalFilename);

    // Save to disk
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${finalFilename}`;

    // Create database asset record
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        filename: originalName,
        url: publicUrl,
        mimeType: file.type || "image/jpeg",
        sizeBytes: buffer.length,
        width: 1200,
        height: 800,
        altTextTr: altTextTr || originalName,
        altTextEn: altTextEn || originalName,
        tags: tags || "[]",
        referenceCount: 0,
        uploadedBy: session.id,
      },
    });

    // Record Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.id,
          actorEmail: session.email,
          actorRole: session.role,
          action: "MEDIA_UPLOADED",
          entityType: "MEDIA",
          entityId: mediaAsset.id,
          metadataJson: JSON.stringify({
            filename: originalName,
            url: publicUrl,
            sizeBytes: buffer.length,
            mimeType: file.type,
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Could not log media audit event:", auditErr);
    }

    return NextResponse.json({
      success: true,
      asset: mediaAsset,
      url: publicUrl,
      id: mediaAsset.id,
      filename: originalName,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Dosya yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
