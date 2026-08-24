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
    const { items } = body; // Array of { id: string, orderIndex: number }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Geçersiz sıralama verisi." }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.homepageSection.update({
          where: { id: item.id },
          data: { orderIndex: Number(item.orderIndex) },
        })
      )
    );

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: "CMS_SECTIONS_REORDERED",
          entityType: "CMS",
          metadataJson: JSON.stringify({ reorderedCount: items.length }),
        },
      });
    } catch (e) {
      console.warn("Audit log warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Sections Reorder Error]:", error);
    return NextResponse.json({ error: "Sıralama güncellenemedi." }, { status: 500 });
  }
}
