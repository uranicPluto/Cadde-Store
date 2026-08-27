import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    const perm = requirePermission(user, "HOMEPAGE", "DELETE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem", code: "FORBIDDEN", resource: "HOMEPAGE", action: "DELETE" },
        { status: perm.status || 403 }
      );
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
          actorId: user!.id,
          actorEmail: user!.email,
          actorRole: user!.role,
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
