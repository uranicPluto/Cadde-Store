import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ROLE_PERMISSIONS_MAP, ROLE_METADATA, AdminRole, AdminResource, AdminAction } from "@/lib/auth/permissions";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true },
    });

    return NextResponse.json({
      success: true,
      roles: ROLE_PERMISSIONS_MAP,
      metadata: ROLE_METADATA,
      admins: adminUsers,
    });
  } catch (error) {
    console.error("GET Roles API Error:", error);
    return NextResponse.json({ error: "Rol bilgileri getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const body = await request.json();
    const { role, resource, actions } = body;

    if (!role || !resource || !Array.isArray(actions)) {
      return NextResponse.json({ error: "Geçersiz rol veya izin verisi." }, { status: 400 });
    }

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "ROLE_PERMISSIONS_UPDATED",
        entityType: "SETTINGS",
        metadataJson: JSON.stringify({ role, resource, actions }),
      },
    });

    return NextResponse.json({ success: true, message: "İzinler başarıyla güncellendi." });
  } catch (error) {
    console.error("PUT Roles API Error:", error);
    return NextResponse.json({ error: "İzinler güncellenemedi." }, { status: 500 });
  }
}
