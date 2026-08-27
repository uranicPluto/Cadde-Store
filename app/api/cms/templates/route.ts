import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const templates = await prisma.homepageTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("[API Templates GET Error]:", error);
    return NextResponse.json({ error: "Şablonlar yüklenemedi." }, { status: 500 });
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
    const { name, description, type, configJson } = body;

    if (!name) {
      return NextResponse.json({ error: "Şablon adı zorunludur." }, { status: 400 });
    }

    const template = await prisma.homepageTemplate.create({
      data: {
        name,
        description: description || null,
        type: type || "PRODUCT_CAROUSEL",
        configJson: typeof configJson === "string" ? configJson : JSON.stringify(configJson || {}),
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user!.id,
          actorEmail: user!.email,
          actorRole: user!.role,
          action: "CMS_TEMPLATE_CREATED",
          entityType: "CMS",
          entityId: template.id,
          metadataJson: JSON.stringify({ templateName: template.name, type: template.type }),
        },
      });
    } catch (e) {
      console.warn("Audit log warning:", e);
    }

    return NextResponse.json({ template, success: true }, { status: 201 });
  } catch (error) {
    console.error("[API Template POST Error]:", error);
    return NextResponse.json({ error: "Şablon oluşturulamadı." }, { status: 500 });
  }
}
