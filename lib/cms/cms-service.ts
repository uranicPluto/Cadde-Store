import { DetailedProductMock, getFullCatalog } from "@/lib/catalog/product-repository";
import { SectionConfig, SectionItem, SectionType } from "./cms-types";

export function parseSectionConfig(configJson: string | SectionConfig | undefined | null): SectionConfig {
  if (!configJson) return {};
  if (typeof configJson === "object") return configJson;
  try {
    return JSON.parse(configJson);
  } catch {
    return {};
  }
}

export function serializeSectionConfig(config: SectionConfig): string {
  return JSON.stringify(config);
}

export function getDefaultBaselineSections(): SectionItem[] {
  return [
    {
      id: "sec-hero",
      titleTR: "Ana Sayfa Vitrin & Kampanyalar",
      titleEN: "Homepage Hero & Campaigns",
      type: "HERO",
      orderIndex: 0,
      active: true,
      configJson: {
        subtitleTR: "Bahar 2026 Sezonunda %60'a Varan İndirimler",
        subtitleEN: "Up to 60% Off Spring 2026 Season",
        ctaTextTR: "Alışverişe Başla",
        ctaTextEN: "Shop Now",
        ctaUrl: "/category/women",
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      banners: [
        {
          id: "hero-1",
          sectionId: "sec-hero",
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
          ctaTextTR: "Hemen Keşfet",
          ctaTextEN: "Discover Now",
          orderIndex: 0,
          active: true,
        },
        {
          id: "hero-2",
          sectionId: "sec-hero",
          titleTR: "Erkek Sokak Modası",
          titleEN: "Men's Urban Streetwear",
          subtitleTR: "Rahat ve şık kombinler",
          subtitleEN: "Comfortable and stylish outfits",
          imageUrlDesktop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
          imageUrlMobile: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
          targetType: "CATEGORY",
          targetValue: "/category/men",
          badgeTextTR: "ÖZEL FIRSAT",
          badgeTextEN: "SPECIAL DEAL",
          ctaTextTR: "İncele",
          ctaTextEN: "View Collection",
          orderIndex: 1,
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
      configJson: {
        subtitleTR: "En çok tercih edilen dünya markaları",
        subtitleEN: "Most preferred global brands",
        displayMode: "STRIP",
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      banners: [],
    },
    {
      id: "sec-popular-products",
      titleTR: "Çok Satanlar & Popüler Ürünler",
      titleEN: "Bestsellers & Popular Products",
      type: "PRODUCT_CAROUSEL",
      orderIndex: 2,
      active: true,
      configJson: {
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
      },
      banners: [],
    },
    {
      id: "sec-category-grid",
      titleTR: "Popüler Kategorileri Keşfedin",
      titleEN: "Explore Popular Categories",
      type: "CATEGORY_GRID",
      orderIndex: 3,
      active: true,
      configJson: {
        subtitleTR: "İhtiyacınız olan her şey tek bir yerde",
        subtitleEN: "Everything you need all in one place",
        displayMode: "GRID",
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      banners: [],
    },
    {
      id: "sec-flash-deals",
      titleTR: "Günün Flaş Fırsatları",
      titleEN: "Flash Deals of the Day",
      type: "FLASH_DEALS",
      orderIndex: 4,
      active: true,
      configJson: {
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
      },
      banners: [],
    },
    {
      id: "sec-banner-strip",
      titleTR: "Öne Çıkan Kampanyalar",
      titleEN: "Special Campaign Highlights",
      type: "BANNER_STRIP",
      orderIndex: 5,
      active: true,
      configJson: {
        subtitleTR: "Sezonun en avantajlı alışveriş fırsatları",
        subtitleEN: "Most advantageous shopping opportunities of the season",
        displayMode: "CARDS",
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      banners: [
        {
          id: "camp-1",
          sectionId: "sec-banner-strip",
          titleTR: "Spor & Outdoor %40 İndirim",
          titleEN: "Sports & Outdoor 40% Off",
          subtitleTR: "En iyi spor ekipmanları ve giyim",
          subtitleEN: "Best athletic gear and clothing",
          imageUrlDesktop: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
          targetType: "CATEGORY",
          targetValue: "/category/sports",
          badgeTextTR: "FIRSAT",
          badgeTextEN: "DEAL",
          ctaTextTR: "Alışverişe Başla",
          ctaTextEN: "Shop Now",
          orderIndex: 0,
          active: true,
        },
        {
          id: "camp-2",
          sectionId: "sec-banner-strip",
          titleTR: "Kozmetik & Kişisel Bakım",
          titleEN: "Beauty & Personal Care",
          subtitleTR: "Seçili cilt bakım ürünlerinde 2.si %50",
          subtitleEN: "Buy 1 Get 1 50% Off on Skincare",
          imageUrlDesktop: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
          targetType: "CATEGORY",
          targetValue: "/category/beauty",
          badgeTextTR: "1+1 FIRSATI",
          badgeTextEN: "BOGO DEAL",
          ctaTextTR: "Keşfet",
          ctaTextEN: "Discover",
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
      configJson: {
        subtitleTR: "En sevdiğiniz markaların özel koleksiyonları",
        subtitleEN: "Exclusive collections from your favorite brands",
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      banners: [],
    },
    {
      id: "sec-store-highlights",
      titleTR: "Onaylı Mağazalar & Pazaryeri Satıcıları",
      titleEN: "Verified Sellers & Stores",
      type: "STORE_HIGHLIGHTS",
      orderIndex: 7,
      active: true,
      configJson: {
        subtitleTR: "Yüksek puanlı ve güvenilir satıcılarımızdan alışveriş yapın",
        subtitleEN: "Trusted marketplace merchants with top customer satisfaction",
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      banners: [],
    },
    {
      id: "sec-bestseller-grid",
      titleTR: "Haftanın En Çok Satan Ürünleri",
      titleEN: "Weekly Bestsellers",
      type: "BESTSELLER_GRID",
      orderIndex: 8,
      active: true,
      configJson: {
        subtitleTR: "En çok tercih edilen popüler ürünler",
        subtitleEN: "Most preferred popular items chosen by Cadde Store customers",
        productRules: {
          source: "BESTSELLING",
          itemLimitDesktop: 6,
          itemLimitTablet: 4,
          itemLimitMobile: 2,
        },
        visibility: { desktop: true, tablet: true, mobile: true },
      },
      banners: [],
    },
  ];
}

export function resolveProductsForSection(
  section: SectionItem,
  language: "tr" | "en" = "tr"
): DetailedProductMock[] {
  const catalog = getFullCatalog(language);
  const config = parseSectionConfig(section.configJson);
  const rules = config.productRules;

  if (!rules) {
    return catalog.slice(0, 8);
  }

  let filtered = [...catalog];

  // 1. In stock filter
  if (rules.inStockOnly) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  // 2. Rating filter
  if (rules.minRating && rules.minRating > 0) {
    filtered = filtered.filter((p) => p.rating >= rules.minRating!);
  }

  // 3. Category filter
  if (rules.categorySlug) {
    filtered = filtered.filter((p) => p.categorySlug === rules.categorySlug);
  }

  // 4. Brand filter
  if (rules.brandSlug) {
    filtered = filtered.filter(
      (p) => p.brand.toLowerCase() === rules.brandSlug?.toLowerCase()
    );
  }

  // 5. Price range
  if (rules.priceMin !== undefined && rules.priceMin > 0) {
    filtered = filtered.filter((p) => p.price >= rules.priceMin!);
  }
  if (rules.priceMax !== undefined && rules.priceMax > 0) {
    filtered = filtered.filter((p) => p.price <= rules.priceMax!);
  }

  // 6. Source ordering
  switch (rules.source) {
    case "MANUAL":
      if (rules.selectedProductIds && rules.selectedProductIds.length > 0) {
        const idMap = new Map(filtered.map((p) => [p.id, p]));
        return rules.selectedProductIds
          .map((id) => idMap.get(id))
          .filter(Boolean) as DetailedProductMock[];
      }
      break;
    case "HIGHEST_RATED":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case "MOST_REVIEWED":
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "HIGHEST_DISCOUNT":
      filtered.sort((a, b) => {
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      });
      break;
    case "LOWEST_PRICE":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "NEW_ARRIVALS":
    case "RECENTLY_ADDED":
      // In mock, reverse or randomize
      filtered.reverse();
      break;
    case "BESTSELLING":
    case "TRENDING":
    default:
      filtered.sort((a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating);
      break;
  }

  const limit = rules.itemLimitDesktop || 8;
  return filtered.slice(0, limit);
}
