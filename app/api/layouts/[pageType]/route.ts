import { NextResponse } from "next/server";
import { getPageLayoutConfig, updatePageLayoutConfig, resetPageLayoutConfig, PageLayoutType } from "@/lib/layouts/layout-repository";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ pageType: string }> | { pageType: string };
}

export async function GET(request: Request, context: RouteParams) {
  try {
    const params = await context.params;
    const pageType = (params.pageType || "").toUpperCase() as PageLayoutType;

    if (pageType !== "PRODUCT" && pageType !== "CATEGORY") {
      return NextResponse.json({ error: "Geçersiz sayfa tipi. 'PRODUCT' veya 'CATEGORY' olmalıdır." }, { status: 400 });
    }

    const layout = await getPageLayoutConfig(pageType);
    return NextResponse.json({ layout, success: true });
  } catch (error) {
    console.error("GET Layout API Error:", error);
    return NextResponse.json({ error: "Düzen bilgisi getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const params = await context.params;
    const pageType = (params.pageType || "").toUpperCase() as PageLayoutType;

    if (pageType !== "PRODUCT" && pageType !== "CATEGORY") {
      return NextResponse.json({ error: "Geçersiz sayfa tipi." }, { status: 400 });
    }

    const body = await request.json();
    const { blocks, isCustom } = body;

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: "Blok listesi zorunludur." }, { status: 400 });
    }

    const updated = await updatePageLayoutConfig(pageType, { blocks, isCustom: isCustom ?? true });
    return NextResponse.json({ success: true, layout: updated });
  } catch (error) {
    console.error("PUT Layout API Error:", error);
    return NextResponse.json({ error: "Düzen güncellenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const params = await context.params;
    const pageType = (params.pageType || "").toUpperCase() as PageLayoutType;

    const resetLayout = await resetPageLayoutConfig(pageType);
    return NextResponse.json({ success: true, layout: resetLayout });
  } catch (error) {
    console.error("POST Layout Reset API Error:", error);
    return NextResponse.json({ error: "Düzen varsayılana sıfırlanamadı." }, { status: 500 });
  }
}
