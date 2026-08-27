import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons, source: "database" });
  } catch (error) {
    console.error("[API Coupons GET Error]:", error);
    return NextResponse.json({ error: "Kuponlar yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const perm = requirePermission(session, "MARKETING", "WRITE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem.", code: "FORBIDDEN", resource: "MARKETING", action: "WRITE" },
        { status: perm.status || 403 }
      );
    }
    const body = await request.json();
    const { code, type, value, minimumOrder, maximumDiscount, expiresAt, active, usageLimit } = body;

    if (!code || value === undefined || value === null) {
      return NextResponse.json({ error: "Kupon kodu ve indirim değeri zorunludur." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const created = await prisma.coupon.create({
      data: {
        code: cleanCode,
        type: type || "PERCENTAGE",
        value: Number(value),
        minimumOrder: minimumOrder ? Number(minimumOrder) : null,
        maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active !== undefined ? Boolean(active) : true,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: session?.id || null,
          actorEmail: session?.email || null,
          actorRole: session?.role || "ADMIN",
          action: "COUPON_CREATED",
          entityType: "COUPON",
          entityId: created.id,
          metadataJson: JSON.stringify({ code: cleanCode, type: created.type, value: created.value }),
        },
      });
    } catch (err) {
      console.error("Audit log error on coupon create:", err);
    }

    return NextResponse.json({ success: true, coupon: created });
  } catch (error) {
    console.error("[API Coupons POST Error]:", error);
    return NextResponse.json({ error: "Kupon oluşturulamadı." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    const perm = requirePermission(session, "MARKETING", "WRITE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem.", code: "FORBIDDEN", resource: "MARKETING", action: "WRITE" },
        { status: perm.status || 403 }
      );
    }
    const body = await request.json();
    const { id, code, active, type, value, minimumOrder, maximumDiscount, expiresAt, usageLimit } = body;

    if (!id && !code) {
      return NextResponse.json({ error: "Kupon ID veya kodu zorunludur." }, { status: 400 });
    }

    const updated = await prisma.coupon.update({
      where: id ? { id } : { code: (code as string).toUpperCase() },
      data: {
        ...(type ? { type } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
        ...(value !== undefined ? { value: Number(value) } : {}),
        ...(minimumOrder !== undefined ? { minimumOrder: minimumOrder ? Number(minimumOrder) : null } : {}),
        ...(maximumDiscount !== undefined ? { maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null } : {}),
        ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
        ...(usageLimit !== undefined ? { usageLimit: usageLimit ? Number(usageLimit) : null } : {}),
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: session?.id || null,
          actorEmail: session?.email || null,
          actorRole: session?.role || "ADMIN",
          action: "COUPON_UPDATED",
          entityType: "COUPON",
          entityId: updated.id,
          metadataJson: JSON.stringify({
            code: updated.code,
            active: updated.active,
            value: updated.value,
            type: updated.type,
          }),
        },
      });
    } catch (err) {
      console.error("Audit log error on coupon update:", err);
    }

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error) {
    console.error("[API Coupons PUT Error]:", error);
    return NextResponse.json({ error: "Kupon güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    const perm = requirePermission(session, "MARKETING", "DELETE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem.", code: "FORBIDDEN", resource: "MARKETING", action: "DELETE" },
        { status: perm.status || 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    let code = searchParams.get("code");

    if (!id && !code) {
      try {
        const body = await request.json();
        id = body.id;
        code = body.code;
      } catch (e) {}
    }

    if (!id && !code) {
      return NextResponse.json({ error: "Kupon ID veya kodu zorunludur." }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({
      where: id ? { id } : { code: (code as string).toUpperCase() },
    });

    if (existing) {
      await prisma.coupon.delete({
        where: { id: existing.id },
      });

      try {
        await prisma.auditLog.create({
          data: {
            actorId: session?.id || null,
            actorEmail: session?.email || null,
            actorRole: session?.role || "ADMIN",
            action: "COUPON_DELETED",
            entityType: "COUPON",
            entityId: existing.id,
            metadataJson: JSON.stringify({ code: existing.code }),
          },
        });
      } catch (err) {
        console.error("Audit log error on coupon delete:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Coupons DELETE Error]:", error);
    return NextResponse.json({ error: "Kupon silinemedi." }, { status: 500 });
  }
}
