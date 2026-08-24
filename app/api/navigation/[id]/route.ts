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

    const item = await prisma.navigationItem.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        parent: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Navigasyon öğesi bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("GET Navigation Item [id] API Error:", error);
    return NextResponse.json({ error: "Navigasyon öğesi getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz bulunmamaktadır." }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;

    const existing = await prisma.navigationItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Navigasyon öğesi bulunamadı." }, { status: 404 });
    }

    const body = await request.json();
    const {
      titleTr,
      titleEn,
      url,
      section,
      parentId,
      sortOrder,
      badgeTr,
      badgeEn,
      isActive,
      deviceVisibility,
      itemType,
      imageUrl,
      descriptionTr,
      descriptionEn,
      ctaTextTr,
      ctaTextEn,
      targetUrl,
      scheduleStartAt,
      scheduleEndAt,
      metadataJson,
    } = body;

    const updated = await prisma.navigationItem.update({
      where: { id },
      data: {
        ...(titleTr !== undefined ? { titleTr } : {}),
        ...(titleEn !== undefined ? { titleEn } : {}),
        ...(url !== undefined ? { url } : {}),
        ...(section !== undefined ? { section } : {}),
        ...(parentId !== undefined ? { parentId: parentId || null } : {}),
        ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
        ...(badgeTr !== undefined ? { badgeTr: badgeTr || null } : {}),
        ...(badgeEn !== undefined ? { badgeEn: badgeEn || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(deviceVisibility !== undefined ? { deviceVisibility } : {}),
        ...(itemType !== undefined ? { itemType } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        ...(descriptionTr !== undefined ? { descriptionTr: descriptionTr || null } : {}),
        ...(descriptionEn !== undefined ? { descriptionEn: descriptionEn || null } : {}),
        ...(ctaTextTr !== undefined ? { ctaTextTr: ctaTextTr || null } : {}),
        ...(ctaTextEn !== undefined ? { ctaTextEn: ctaTextEn || null } : {}),
        ...(targetUrl !== undefined ? { targetUrl: targetUrl || null } : {}),
        ...(scheduleStartAt !== undefined ? { scheduleStartAt: scheduleStartAt ? new Date(scheduleStartAt) : null } : {}),
        ...(scheduleEndAt !== undefined ? { scheduleEndAt: scheduleEndAt ? new Date(scheduleEndAt) : null } : {}),
        ...(metadataJson !== undefined ? { metadataJson: typeof metadataJson === "object" ? JSON.stringify(metadataJson) : (metadataJson || "{}") } : {}),
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "NAVIGATION_UPDATED",
        entityType: "NAVIGATION",
        entityId: id,
        metadataJson: JSON.stringify({
          titleTr: updated.titleTr,
          titleEn: updated.titleEn,
          url: updated.url,
          section: updated.section,
          sortOrder: updated.sortOrder,
          deviceVisibility: updated.deviceVisibility,
          itemType: updated.itemType,
        }),
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("PUT Navigation Item [id] API Error:", error);
    return NextResponse.json({ error: "Navigasyon öğesi güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz bulunmamaktadır." }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;

    const existing = await prisma.navigationItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Navigasyon öğesi bulunamadı." }, { status: 404 });
    }

    await prisma.navigationItem.delete({ where: { id } });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "NAVIGATION_DELETED",
        entityType: "NAVIGATION",
        entityId: id,
        metadataJson: JSON.stringify({
          titleTr: existing.titleTr,
          section: existing.section,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Navigation Item [id] API Error:", error);
    return NextResponse.json({ error: "Navigasyon öğesi silinemedi." }, { status: 500 });
  }
}
