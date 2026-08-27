import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: params.id },
    });

    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ sponsor });
  } catch (error) {
    console.error("GET Sponsor Detail Error:", error);
    return NextResponse.json({ error: "Sponsor yüklenemedi." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const perm = requirePermission(session, "CATALOG", "WRITE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem.", code: "FORBIDDEN", resource: "CATALOG", action: "WRITE" },
        { status: perm.status || 403 }
      );
    }

    const body = await request.json();
    const { name, logoUrl, linkUrl, startDate, endDate, priority, active } = body;

    const updated = await prisma.sponsor.update({
      where: { id: params.id },
      data: {
        name,
        logoUrl,
        linkUrl: linkUrl !== undefined ? linkUrl : undefined,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority !== undefined ? Number(priority) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    return NextResponse.json({ sponsor: updated });
  } catch (error) {
    console.error("PUT Sponsor Error:", error);
    return NextResponse.json({ error: "Sponsor güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const perm = requirePermission(session, "CATALOG", "DELETE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem.", code: "FORBIDDEN", resource: "CATALOG", action: "DELETE" },
        { status: perm.status || 403 }
      );
    }

    await prisma.sponsor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Sponsor Error:", error);
    return NextResponse.json({ error: "Sponsor silinemedi." }, { status: 500 });
  }
}
