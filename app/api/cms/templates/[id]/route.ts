import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Şablon ID gereklidir." }, { status: 400 });
    }

    await prisma.homepageTemplate.delete({
      where: { id },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: "CMS_TEMPLATE_DELETED",
          entityType: "CMS",
          entityId: id,
        },
      });
    } catch (e) {
      console.warn("Audit log warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Template DELETE Error]:", error);
    return NextResponse.json({ error: "Şablon silinemedi." }, { status: 500 });
  }
}
