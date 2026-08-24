export type SectionType =
  // Baseline existing sections
  | "HERO"
  | "BRAND_STRIP"
  | "PRODUCT_CAROUSEL"
  | "CATEGORY_GRID"
  | "FLASH_DEALS"
  | "BANNER_STRIP"
  | "FEATURED_BRANDS"
  | "STORE_HIGHLIGHTS"
  | "BESTSELLER_GRID"
  | "TRUST_BADGES"
  // Extended section library
  | "NEW_ARRIVALS"
  | "TRENDING_PRODUCTS"
  | "RECOMMENDED_PRODUCTS"
  | "DEALS_OF_THE_DAY"
  | "POPULAR_CATEGORIES"
  | "CATEGORY_CAROUSEL"
  | "BRAND_CAROUSEL"
  | "BRAND_DEALS"
  | "VERIFIED_SELLERS"
  | "FEATURED_STORES"
  | "SELLER_CAROUSEL"
  | "CAMPAIGN_CARDS"
  | "COUNTDOWN_CAMPAIGN"
  | "SEASONAL_CAMPAIGN"
  | "PROMOTIONAL_BANNER"
  | "RICH_CONTENT"
  | "IMAGE_TEXT_BANNER"
  | "VIDEO_BANNER"
  | "CUSTOM_GRID"
  | "DIVIDER"
  | "SPACER";

export type ProductSourceType =
  | "MANUAL"
  | "BESTSELLING"
  | "TRENDING"
  | "NEW_ARRIVALS"
  | "HIGHEST_RATED"
  | "MOST_REVIEWED"
  | "HIGHEST_DISCOUNT"
  | "LOWEST_PRICE"
  | "CATEGORY"
  | "BRAND"
  | "SELLER"
  | "RECENTLY_ADDED";

export interface DynamicProductRules {
  source: ProductSourceType;
  categorySlug?: string;
  brandSlug?: string;
  sellerSlug?: string;
  minRating?: number; // e.g. 4.0
  inStockOnly?: boolean;
  minDiscountPercent?: number; // e.g. 15
  priceMin?: number;
  priceMax?: number;
  itemLimitDesktop: number; // e.g. 6 or 8
  itemLimitTablet: number; // e.g. 4
  itemLimitMobile: number; // e.g. 2
  selectedProductIds?: string[]; // For manual selection
}

export interface SectionDisplayOptions {
  showRating: boolean;
  showReviewCount: boolean;
  showSeller: boolean;
  showOriginalPrice: boolean;
  showDiscountBadge: boolean;
  showFreeShippingBadge: boolean;
  showAddToCart: boolean;
  backgroundColor?: string;
  textColor?: string;
  containerWidth?: "FULL" | "CONTAINED";
  paddingTop?: number;
  paddingBottom?: number;
}

export interface DeviceVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface SectionAnalyticsSnapshot {
  impressions: number;
  clicks: number;
  ctr: number;
  addToCartCount: number;
  attributedRevenue: number;
}

export interface CmsBannerItem {
  id: string;
  sectionId?: string | null;
  titleTR?: string | null;
  titleEN?: string | null;
  subtitleTR?: string | null;
  subtitleEN?: string | null;
  imageUrlDesktop: string;
  imageUrlMobile?: string | null;
  targetType: "CATEGORY" | "PRODUCT" | "BRAND" | "SELLER" | "URL";
  targetValue: string;
  badgeTextTR?: string | null;
  badgeTextEN?: string | null;
  ctaTextTR?: string | null;
  ctaTextEN?: string | null;
  orderIndex: number;
  active: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface SectionConfig {
  // Common copy
  subtitleTR?: string;
  subtitleEN?: string;
  ctaTextTR?: string;
  ctaTextEN?: string;
  ctaUrl?: string;
  badgeTextTR?: string;
  badgeTextEN?: string;

  // Merchandising Rules
  productRules?: DynamicProductRules;
  displayOptions?: SectionDisplayOptions;
  visibility?: DeviceVisibility;

  // Countdown & Scheduling
  countdownEnabled?: boolean;
  countdownEndDate?: string;

  // Category / Brand / Seller Selections
  selectedCategoryIds?: string[];
  selectedBrandIds?: string[];
  selectedSellerIds?: string[];
  displayMode?: "GRID" | "CAROUSEL" | "STRIP" | "CARDS";

  // Additional Layout & Visual Properties
  heroBannerUrl?: string;
  categoryColumns?: number;
  cardStyle?: string;
  grayscaleLogos?: boolean;
  endDate?: string;

  // Rich Content / Custom HTML
  customHtmlTR?: string;
  customHtmlEN?: string;
  videoUrl?: string;

  // Analytics Snapshot
  analytics?: SectionAnalyticsSnapshot;
}

export interface SectionItem {
  id: string;
  titleTR: string;
  titleEN: string;
  type: SectionType | string;
  orderIndex: number;
  active: boolean;
  configJson: string | SectionConfig;
  startDate?: string | null;
  endDate?: string | null;
  banners: CmsBannerItem[];
}

export interface HomepageTemplateItem {
  id: string;
  name: string;
  description?: string | null;
  type: SectionType | string;
  configJson: string | SectionConfig;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageVersionItem {
  id: string;
  versionNumber: number;
  snapshotJson: string;
  changeSummary?: string | null;
  authorEmail?: string | null;
  publishedAt: string;
}
