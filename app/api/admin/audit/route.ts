import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    const perm = requirePermission(user, "AUDIT", "READ");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem", code: "FORBIDDEN", resource: "AUDIT", action: "READ" },
        { status: perm.status || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");

    const whereClause: any = {};
    if (entityType) {
      whereClause.entityType = entityType;
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[API Admin Audit GET Error]:", error);
    return NextResponse.json({ error: "Denetim kayıtları yüklenemedi." }, { status: 500 });
  }
}
