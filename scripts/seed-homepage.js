const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

const DEFAULT_BASELINE_SECTIONS = [
  {
    id: "sec-hero",
    titleTR: "Ana Sayfa Vitrin & Kampanyalar",
    titleEN: "Homepage Hero & Campaigns",
    type: "HERO",
    orderIndex: 0,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "Bahar 2026 Sezonunda %60'a Varan İndirimler",
      subtitleEN: "Up to 60% Off Spring 2026 Season",
      ctaTextTR: "Alışverişe Başla",
      ctaTextEN: "Shop Now",
      ctaUrl: "/category/women",
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [
      {
        id: "hero-1",
        titleTR: "Yeni Sezon Kadın Koleksiyonu",
        titleEN: "New Season Women Collection",
        subtitleTR: "Trend parçalar %50'ye varan avantajlarla",
        subtitleEN: "Trending styles up to 50% discount",
        imageUrlDesktop: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
        imageUrlMobile: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
        targetType: "CATEGORY",
        targetValue: "/category/women",
        badgeTextTR: "YENİ SEZON",
        badgeTextEN: "NEW SEASON",
        orderIndex: 0,
        active: true,
      },
      {
        id: "hero-2",
        titleTR: "Erkek Sokak Modası & Trendler",
        titleEN: "Men's Urban Streetwear",
        subtitleTR: "Rahat ve şık kombinler",
        subtitleEN: "Comfortable and stylish outfits",
        imageUrlDesktop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
        imageUrlMobile: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
        targetType: "CATEGORY",
        targetValue: "/category/men",
        badgeTextTR: "ÖZEL FIRSAT",
        badgeTextEN: "SPECIAL DEAL",
        orderIndex: 1,
        active: true,
      },
      {
        id: "hero-3",
        titleTR: "Akıllı Ev & Elektronik Fırsatları",
        titleEN: "Smart Home & Tech Deals",
        subtitleTR: "Geleceğin teknolojisi bugün kapınızda",
        subtitleEN: "Tomorrow's technology at your doorstep today",
        imageUrlDesktop: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
        imageUrlMobile: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        targetType: "CATEGORY",
        targetValue: "/category/electronics",
        badgeTextTR: "FLAŞ İNDİRİM",
        badgeTextEN: "FLASH SALE",
        orderIndex: 2,
        active: true,
      },
    ],
  },
  {
    id: "sec-brand-strip",
    titleTR: "Sizin İçin Markalar",
    titleEN: "Brands For You",
    type: "BRAND_STRIP",
    orderIndex: 1,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "En çok tercih edilen dünya markaları",
      subtitleEN: "Most preferred global brands",
      displayMode: "STRIP",
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [],
  },
  {
    id: "sec-popular-products",
    titleTR: "Çok Satanlar & Popüler Ürünler",
    titleEN: "Bestsellers & Popular Products",
    type: "PRODUCT_CAROUSEL",
    orderIndex: 2,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "Müşterilerimizin bu hafta en çok tercih ettiği ürünler",
      subtitleEN: "Most loved items selected by our customers this week",
      productRules: {
        source: "BESTSELLING",
        itemLimitDesktop: 8,
        itemLimitTablet: 4,
        itemLimitMobile: 2,
        minRating: 4.0,
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
    }),
    banners: [],
  },
  {
    id: "sec-category-grid",
    titleTR: "Popüler Kategorileri Keşfedin",
    titleEN: "Explore Popular Categories",
    type: "CATEGORY_GRID",
    orderIndex: 3,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "İhtiyacınız olan her şey tek bir yerde",
      subtitleEN: "Everything you need all in one place",
      displayMode: "GRID",
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [],
  },
  {
    id: "sec-flash-deals",
    titleTR: "Günün Flaş Fırsatları",
    titleEN: "Flash Deals of the Day",
    type: "FLASH_DEALS",
    orderIndex: 4,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "Sınırlı süre ve stoklarla ekstra indirimli ürünler",
      subtitleEN: "Limited time and stock with extra discounts",
      countdownEnabled: true,
      countdownEndDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      productRules: {
        source: "HIGHEST_DISCOUNT",
        itemLimitDesktop: 6,
        itemLimitTablet: 4,
        itemLimitMobile: 2,
        minDiscountPercent: 20,
      },
      displayOptions: {
        showRating: true,
        showReviewCount: true,
        showSeller: true,
        showOriginalPrice: true,
        showDiscountBadge: true,
        showFreeShippingBadge: true,
        showAddToCart: true,
        backgroundColor: "#fff7ed",
      },
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [],
  },
  {
    id: "sec-banner-strip",
    titleTR: "Öne Çıkan Kampanyalar",
    titleEN: "Special Campaign Highlights",
    type: "BANNER_STRIP",
    orderIndex: 5,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "Sezonun en avantajlı alışveriş fırsatları",
      subtitleEN: "Most advantageous shopping opportunities of the season",
      displayMode: "CARDS",
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [
      {
        id: "camp-1",
        titleTR: "Spor & Outdoor %40 İndirim",
        titleEN: "Sports & Outdoor 40% Off",
        subtitleTR: "En iyi spor ekipmanları ve giyim",
        subtitleEN: "Best athletic gear and clothing",
        imageUrlDesktop: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
        imageUrlMobile: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
        targetType: "CATEGORY",
        targetValue: "/category/sports",
        badgeTextTR: "FIRSAT",
        badgeTextEN: "DEAL",
        orderIndex: 0,
        active: true,
      },
      {
        id: "camp-2",
        titleTR: "Kozmetik & Kişisel Bakım",
        titleEN: "Beauty & Personal Care",
        subtitleTR: "Seçili cilt bakım ürünlerinde 2.si %50",
        subtitleEN: "Buy 1 Get 1 50% Off on Skincare",
        imageUrlDesktop: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        imageUrlMobile: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        targetType: "CATEGORY",
        targetValue: "/category/beauty",
        badgeTextTR: "1+1 FIRSATI",
        badgeTextEN: "BOGO DEAL",
        orderIndex: 1,
        active: true,
      },
    ],
  },
  {
    id: "sec-featured-brands",
    titleTR: "Öne Çıkan Markalar & Fırsatlar",
    titleEN: "Featured Brands & Deals",
    type: "FEATURED_BRANDS",
    orderIndex: 6,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "En sevdiğiniz markaların özel koleksiyonları",
      subtitleEN: "Exclusive collections from your favorite brands",
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [],
  },
  {
    id: "sec-store-highlights",
    titleTR: "Onaylı Mağazalar & Pazaryeri Satıcıları",
    titleEN: "Verified Stores & Marketplace Sellers",
    type: "STORE_HIGHLIGHTS",
    orderIndex: 7,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "Yüksek puanlı ve güvenilir satıcılarımızdan alışveriş yapın",
      subtitleEN: "Shop from our top-rated and verified merchant stores",
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [],
  },
  {
    id: "sec-sponsors",
    titleTR: "Resmi Sponsorlarımız & İş Ortaklarımız",
    titleEN: "Official Sponsors & Strategic Partners",
    type: "SPONSOR_CAROUSEL",
    orderIndex: 8,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "Türkiye'nin ve dünyanın önde gelen e-ticaret markaları",
      subtitleEN: "Leading Turkish and global e-commerce brand partners",
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [],
  },
  {
    id: "sec-bestseller-grid",
    titleTR: "Haftanın En Çok Satan Ürünleri",
    titleEN: "Weekly Top Bestsellers",
    type: "BESTSELLER_GRID",
    orderIndex: 9,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "Tüm kategorilerde en yüksek sipariş hacmine ulaşanlar",
      subtitleEN: "Highest order volume items across all categories",
      productRules: {
        source: "BESTSELLING",
        itemLimitDesktop: 8,
        itemLimitTablet: 4,
        itemLimitMobile: 2,
      },
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [],
  },
  {
    id: "sec-trust-badges",
    titleTR: "Cadde Store Güvencesi",
    titleEN: "Cadde Store Customer Trust",
    type: "TRUST_BADGES",
    orderIndex: 10,
    active: true,
    configJson: JSON.stringify({
      subtitleTR: "Güvenli ödeme, kolay iade ve hızlı teslimat",
      subtitleEN: "Secure payments, easy returns, and fast delivery",
      visibility: { desktop: true, tablet: true, mobile: true },
    }),
    banners: [],
  },
];

const DEFAULT_SPONSORS = [
  { id: "sp-1", name: "Nike", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg", linkUrl: "https://nike.com", priority: 100, active: true },
  { id: "sp-2", name: "Adidas", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", linkUrl: "https://adidas.com", priority: 95, active: true },
  { id: "sp-3", name: "Puma", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/88/Puma-Logo.svg", linkUrl: "https://puma.com", priority: 90, active: true },
  { id: "sp-4", name: "Zara", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg", linkUrl: "https://zara.com", priority: 85, active: true },
  { id: "sp-5", name: "Mango", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Mango-logo.svg", linkUrl: "https://mango.com", priority: 80, active: true },
  { id: "sp-6", name: "Apple", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", linkUrl: "https://apple.com", priority: 75, active: true },
  { id: "sp-7", name: "Samsung", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg", linkUrl: "https://samsung.com", priority: 70, active: true },
  { id: "sp-8", name: "Sony", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg", linkUrl: "https://sony.com", priority: 65, active: true },
];

async function seedHomepage() {
  console.log("[Seed Homepage] Resetting homepage sections & sponsors with curated data...");

  // 1. Clear existing homepage sections and banners
  await prisma.banner.deleteMany({});
  await prisma.homepageSection.deleteMany({});

  // 2. Insert curated sections with nested banners
  for (const s of DEFAULT_BASELINE_SECTIONS) {
    await prisma.homepageSection.create({
      data: {
        id: s.id,
        titleTR: s.titleTR,
        titleEN: s.titleEN,
        type: s.type,
        orderIndex: s.orderIndex,
        active: s.active,
        configJson: s.configJson,
        ...(s.banners && s.banners.length > 0 && {
          banners: {
            create: s.banners.map((b) => ({
              id: b.id,
              titleTR: b.titleTR,
              titleEN: b.titleEN,
              subtitleTR: b.subtitleTR,
              subtitleEN: b.subtitleEN,
              imageUrlDesktop: b.imageUrlDesktop,
              imageUrlMobile: b.imageUrlMobile,
              targetType: b.targetType,
              targetValue: b.targetValue,
              badgeTextTR: b.badgeTextTR,
              badgeTextEN: b.badgeTextEN,
              orderIndex: b.orderIndex,
              active: b.active,
            })),
          },
        }),
      },
    });
  }

  // 3. Clear and insert sponsors
  await prisma.sponsor.deleteMany({});
  for (const sp of DEFAULT_SPONSORS) {
    await prisma.sponsor.create({
      data: {
        id: sp.id,
        name: sp.name,
        logoUrl: sp.logoUrl,
        linkUrl: sp.linkUrl,
        priority: sp.priority,
        active: sp.active,
      },
    });
  }

  // 4. Save published version snapshot
  try {
    const fullSections = await prisma.homepageSection.findMany({
      include: { banners: true },
      orderBy: { orderIndex: "asc" },
    });

    await prisma.homepageVersion.create({
      data: {
        versionNumber: 1,
        snapshotJson: JSON.stringify(fullSections),
        changeSummary: "Curated Master Baseline 2026",
        authorEmail: "admin@cadde-store.com",
      },
    });
  } catch (e) {
    console.warn("Version snapshot notice:", e.message);
  }

  console.log(`[Seed Homepage] Successfully seeded ${DEFAULT_BASELINE_SECTIONS.length} sections and ${DEFAULT_SPONSORS.length} sponsors!`);
}

seedHomepage()
  .catch((e) => {
    console.error("[Seed Homepage Error]:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
