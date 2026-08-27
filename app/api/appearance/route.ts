import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/db/prisma";
import {
  getAppearanceSettings,
  updateAppearanceSettings,
  deriveCssVariables,
  AppearanceSettingsInput,
} from "@/lib/appearance/appearance-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getAppearanceSettings();
    const cssVariables = deriveCssVariables(settings);
    return NextResponse.json({
      success: true,
      settings,
      cssVariables,
    });
  } catch (error) {
    console.error("GET /api/appearance Error:", error);
    return NextResponse.json(
      { error: "Görünüm ayarları getirilemedi." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    const perm = requirePermission(session, "APPEARANCE", "WRITE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Bu işlem için yetkiniz bulunmamaktadır.", code: "FORBIDDEN", resource: "APPEARANCE", action: "WRITE" },
        { status: perm.status || 403 }
      );
    }

    const body = await request.json();
    const input: AppearanceSettingsInput = {
      logoUrl: body.logoUrl,
      faviconUrl: body.faviconUrl,
      marketplaceName: body.marketplaceName,
      tagline: body.tagline,
      brandColor: body.brandColor,
      accentColor: body.accentColor,
      borderRadius: body.borderRadius,
      fontHeading: body.fontHeading,
      fontBody: body.fontBody,
      headerConfig: body.headerConfig,
      footerConfig: body.footerConfig,
    };

    const updated = await updateAppearanceSettings(input);
    const cssVariables = deriveCssVariables(updated);

    // Keep PlatformSettings synchronized if marketplaceName was changed
    if (body.marketplaceName) {
      await prisma.platformSettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          marketplaceName: body.marketplaceName,
        },
        update: {
          marketplaceName: body.marketplaceName,
        },
      });
    }

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: session!.id,
        actorEmail: session!.email,
        actorRole: session!.role,
        action: "APPEARANCE_UPDATED",
        entityType: "APPEARANCE",
        entityId: updated.id,
        metadataJson: JSON.stringify({
          marketplaceName: updated.marketplaceName,
          brandColor: updated.brandColor,
          accentColor: updated.accentColor,
          borderRadius: updated.borderRadius,
          fontHeading: updated.fontHeading,
          fontBody: updated.fontBody,
          hasHeaderConfig: Boolean(body.headerConfig),
          hasFooterConfig: Boolean(body.footerConfig),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      settings: updated,
      cssVariables,
    });
  } catch (error) {
    console.error("PUT /api/appearance Error:", error);
    return NextResponse.json(
      { error: "Görünüm ayarları kaydedilirken hata oluştu." },
      { status: 500 }
    );
  }
}
