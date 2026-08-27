import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const where: any = {};
    if (activeOnly) {
      where.active = true;
    }

    const sponsors = await prisma.sponsor.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ sponsors });
  } catch (error) {
    console.error("GET Sponsors API Error:", error);
    return NextResponse.json({ error: "Sponsorlar yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    if (!name || !logoUrl) {
      return NextResponse.json({ error: "Sponsor adı ve logo görseli zorunludur." }, { status: 400 });
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        logoUrl,
        linkUrl: linkUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority !== undefined ? Number(priority) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json({ sponsor });
  } catch (error) {
    console.error("POST Sponsor API Error:", error);
    return NextResponse.json({ error: "Sponsor kaydedilemedi." }, { status: 500 });
  }
}
