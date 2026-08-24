import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  resetAppearanceSettings,
  deriveCssVariables,
  DEFAULT_APPEARANCE_SETTINGS,
} from "@/lib/appearance/appearance-repository";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yönetici yetkisi gereklidir." },
        { status: 403 }
      );
    }

    const reset = await resetAppearanceSettings();
    const cssVariables = deriveCssVariables(reset);

    // Keep PlatformSettings synchronized
    await prisma.platformSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        marketplaceName: DEFAULT_APPEARANCE_SETTINGS.marketplaceName,
      },
      update: {
        marketplaceName: DEFAULT_APPEARANCE_SETTINGS.marketplaceName,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "APPEARANCE_RESET",
        entityType: "APPEARANCE",
        entityId: reset.id,
        metadataJson: JSON.stringify({
          resetToDefault: true,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Görünüm ayarları varsayılanlara sıfırlandı.",
      settings: reset,
      cssVariables,
    });
  } catch (error) {
    console.error("POST /api/appearance/reset Error:", error);
    return NextResponse.json(
      { error: "Görünüm ayarları sıfırlanırken hata oluştu." },
      { status: 500 }
    );
  }
}
