import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Lütfen bir kampanya açıklaması giriniz." }, { status: 400 });
    }

    const lower = prompt.toLowerCase();

    // Intelligent campaign structure generation based on user intent
    let category = "women";
    let titleTr = "Özel Sezon Kampanyası";
    let titleEn = "Special Season Campaign";
    let subtitleTr = "Trend parçalar özel avantajlarla sizleri bekliyor";
    let subtitleEn = "Trending styles await you with exclusive deals";
    let source = "BESTSELLING";
    let discountPercent = 20;

    if (lower.includes("yaz") || lower.includes("summer")) {
      titleTr = "Yaz Modası & Plaj Fırsatları";
      titleEn = "Summer Fashion & Beach Deals";
      subtitleTr = "Sezonun en trend elbise ve aksesuarlarında %50'ye varan indirim";
      subtitleEn = "Up to 50% off on the most trending summer dresses and accessories";
      category = "kadin";
    } else if (lower.includes("erkek") || lower.includes("men")) {
      titleTr = "Erkek Sokak Stili & Şıklık";
      titleEn = "Men's Urban Style & Essentials";
      subtitleTr = "Günlük ve klasik erkek giyiminde kaçırılmayacak fırsatlar";
      subtitleEn = "Unmissable deals in casual and classic menswear";
      category = "erkek";
    } else if (lower.includes("elektronik") || lower.includes("tech")) {
      titleTr = "Teknoloji & Akıllı Cihaz Günleri";
      titleEn = "Tech & Smart Device Days";
      subtitleTr = "Kulaklık, hoparlör ve akıllı aksesuarlarda süper fırsatlar";
      subtitleEn = "Super deals on headphones, speakers, and smart gadgets";
      category = "elektronik";
    }

    const generatedProposal = {
      id: `ai-sec-${Date.now()}`,
      type: "PRODUCT_CAROUSEL",
      titleTR: titleTr,
      titleEN: titleEn,
      orderIndex: 0,
      active: true,
      configJson: {
        subtitleTR: subtitleTr,
        subtitleEN: subtitleEn,
        ctaTextTR: "Kampanyayı İncele",
        ctaTextEN: "Explore Deals",
        ctaUrl: `/category/${category}`,
        productRules: {
          source: "TRENDING",
          categorySlug: category,
          itemLimitDesktop: 8,
          itemLimitTablet: 4,
          itemLimitMobile: 2,
          minDiscountPercent: discountPercent,
          inStockOnly: true,
        },
        displayOptions: {
          showRating: true,
          showReviewCount: true,
          showSeller: true,
          showOriginalPrice: true,
          showDiscountBadge: true,
          showFreeShippingBadge: true,
          showAddToCart: true,
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      banners: [
        {
          id: `ai-ban-${Date.now()}`,
          titleTR: titleTr,
          titleEN: titleEn,
          subtitleTR: subtitleTr,
          subtitleEN: subtitleEn,
          imageUrlDesktop: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
          targetType: "CATEGORY",
          targetValue: `/category/${category}`,
          badgeTextTR: "%50 İNDİRİM",
          badgeTextEN: "50% OFF",
          orderIndex: 0,
          active: true,
        },
      ],
    };

    return NextResponse.json({
      success: true,
      proposal: generatedProposal,
      message: "AI kampanya bloğu başarıyla oluşturuldu.",
    });
  } catch (error) {
    console.error("AI Campaign Generator Error:", error);
    return NextResponse.json({ error: "AI kampanya önerisi üretilemedi." }, { status: 500 });
  }
}
