import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    let settings = await prisma.platformSettings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: "default" },
      });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET Platform Settings API Error:", error);
    return NextResponse.json({ error: "Platform ayarları getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const body = await request.json();
    const {
      marketplaceName,
      supportEmail,
      defaultCommissionRate,
      orderCancellationWindowDays,
      returnWindowDays,
      defaultShippingFee,
      freeShippingThreshold,
    } = body;

    const settings = await prisma.platformSettings.upsert({
      where: { id: "default" },
      update: {
        ...(marketplaceName ? { marketplaceName } : {}),
        ...(supportEmail ? { supportEmail } : {}),
        ...(defaultCommissionRate !== undefined ? { defaultCommissionRate: Number(defaultCommissionRate) } : {}),
        ...(orderCancellationWindowDays !== undefined ? { orderCancellationWindowDays: Number(orderCancellationWindowDays) } : {}),
        ...(returnWindowDays !== undefined ? { returnWindowDays: Number(returnWindowDays) } : {}),
        ...(defaultShippingFee !== undefined ? { defaultShippingFee: Number(defaultShippingFee) } : {}),
        ...(freeShippingThreshold !== undefined ? { freeShippingThreshold: Number(freeShippingThreshold) } : {}),
      },
      create: {
        id: "default",
        marketplaceName: marketplaceName || "Cadde Store Türkiye",
        supportEmail: supportEmail || "destek@cadde.store",
        defaultCommissionRate: Number(defaultCommissionRate || 10),
        orderCancellationWindowDays: Number(orderCancellationWindowDays || 2),
        returnWindowDays: Number(returnWindowDays || 14),
        defaultShippingFee: Number(defaultShippingFee || 34.9),
        freeShippingThreshold: Number(freeShippingThreshold || 200),
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("PUT Platform Settings API Error:", error);
    return NextResponse.json({ error: "Platform ayarları güncellenemedi." }, { status: 500 });
  }
}
