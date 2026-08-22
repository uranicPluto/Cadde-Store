import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const body = await request.json();
    const {
      sectionId,
      titleTR,
      titleEN,
      subtitleTR,
      subtitleEN,
      imageUrlDesktop,
      imageUrlMobile,
      targetType,
      targetValue,
      badgeTextTR,
      badgeTextEN,
      orderIndex,
      active,
    } = body;

    if (!imageUrlDesktop || !targetValue) {
      return NextResponse.json({ error: "Görsel URL ve hedef bağlantı zorunludur." }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        sectionId: sectionId || null,
        titleTR: titleTR || null,
        titleEN: titleEN || null,
        subtitleTR: subtitleTR || null,
        subtitleEN: subtitleEN || null,
        imageUrlDesktop,
        imageUrlMobile: imageUrlMobile || imageUrlDesktop,
        targetType: targetType || "CATEGORY",
        targetValue: targetValue || "/",
        badgeTextTR: badgeTextTR || null,
        badgeTextEN: badgeTextEN || null,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: "BANNER_CREATED",
          entityType: "CMS",
          entityId: banner.id,
          metadataJson: JSON.stringify({ bannerTitle: banner.titleTR, target: banner.targetValue }),
        },
      });
    } catch (e) {
      console.warn("Audit log warning:", e);
    }

    return NextResponse.json({ banner, success: true }, { status: 201 });
  } catch (error) {
    console.error("[API CMS Banner POST Error]:", error);
    return NextResponse.json({ error: "Banner oluşturulamadı." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      sectionId,
      titleTR,
      titleEN,
      subtitleTR,
      subtitleEN,
      imageUrlDesktop,
      imageUrlMobile,
      targetType,
      targetValue,
      badgeTextTR,
      badgeTextEN,
      orderIndex,
      active,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Banner ID gereklidir." }, { status: 400 });
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(sectionId !== undefined && { sectionId: sectionId || null }),
        ...(titleTR !== undefined && { titleTR }),
        ...(titleEN !== undefined && { titleEN }),
        ...(subtitleTR !== undefined && { subtitleTR }),
        ...(subtitleEN !== undefined && { subtitleEN }),
        ...(imageUrlDesktop && { imageUrlDesktop }),
        ...(imageUrlMobile && { imageUrlMobile }),
        ...(targetType && { targetType }),
        ...(targetValue && { targetValue }),
        ...(badgeTextTR !== undefined && { badgeTextTR }),
        ...(badgeTextEN !== undefined && { badgeTextEN }),
        ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
        ...(active !== undefined && { active: Boolean(active) }),
      },
    });

    return NextResponse.json({ banner, success: true });
  } catch (error) {
    console.error("[API CMS Banner PUT Error]:", error);
    return NextResponse.json({ error: "Banner güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Banner ID gereklidir." }, { status: 400 });
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API CMS Banner DELETE Error]:", error);
    return NextResponse.json({ error: "Banner silinemedi." }, { status: 500 });
  }
}
