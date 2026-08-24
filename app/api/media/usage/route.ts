import { NextResponse } from "next/server";
import { scanMediaAssetUsage } from "@/lib/media/media-usage-scanner";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Görsel URL'si gereklidir." }, { status: 400 });
    }

    const scanResult = await scanMediaAssetUsage(url);
    return NextResponse.json({ success: true, ...scanResult });
  } catch (error) {
    console.error("GET Media Usage Error:", error);
    return NextResponse.json({ error: "Medya kullanım analizi yapılamadı." }, { status: 500 });
  }
}
