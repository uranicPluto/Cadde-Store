import { SectionType } from "@/lib/cms/cms-types";

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "image_picker"
  | "video_url"
  | "color"
  | "font_picker"
  | "checkbox"
  | "select"
  | "range"
  | "number"
  | "link_picker"
  | "product_picker"
  | "category_picker"
  | "brand_picker"
  | "repeater";

export interface FieldDefinition {
  id: string;
  type: FieldType;
  labelTr: string;
  labelEn: string;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  descriptionTr?: string;
  descriptionEn?: string;
  blockSchema?: Record<string, FieldDefinition>;
}

export interface SectionSchema {
  type: SectionType | string;
  nameTr: string;
  nameEn: string;
  category: "HERO" | "PRODUCTS" | "CATEGORIES" | "CAMPAIGNS" | "BRANDS" | "SPONSORS" | "CONTENT" | "TRUST";
  descriptionTr: string;
  descriptionEn: string;
  iconName: string;
  defaultConfig: Record<string, any>;
  fields: Record<string, FieldDefinition>;
  blockType?: string;
  blockSchema?: Record<string, FieldDefinition>;
}

export const SECTION_SCHEMA_REGISTRY: Record<string, SectionSchema> = {
  HERO: {
    type: "HERO",
    nameTr: "Hero Vitrin Afişi",
    nameEn: "Hero Banner",
    category: "HERO",
    descriptionTr: "Ana sayfa tepe vitrini; arka plan görseli, başlık, alt başlık ve eylem butonları.",
    descriptionEn: "High-impact top banner with background image, headings, and primary CTA buttons.",
    iconName: "Sparkles",
    defaultConfig: {
      titleTR: "Yeni Sezon Koleksiyonu",
      titleEN: "New Season Collection",
      subtitleTR: "Trend parçalar, özel indirimler ve hızlı teslimat avantajıyla.",
      subtitleEN: "Trending pieces with exclusive deals and fast express delivery.",
      heroBannerUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      ctaTextTR: "Şimdi Keşfet",
      ctaTextEN: "Explore Now",
      ctaUrl: "/category/kadin",
      badgeTextTR: "ÖZEL FIRSAT",
      badgeTextEN: "SPECIAL OFFER",
      bgGradient: "bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950",
    },
    fields: {
      titleTR: { id: "titleTR", type: "text", labelTr: "Başlık (TR)", labelEn: "Heading (TR)" },
      titleEN: { id: "titleEN", type: "text", labelTr: "Başlık (EN)", labelEn: "Heading (EN)" },
      subtitleTR: { id: "subtitleTR", type: "textarea", labelTr: "Alt Başlık (TR)", labelEn: "Subtitle (TR)" },
      subtitleEN: { id: "subtitleEN", type: "textarea", labelTr: "Alt Başlık (EN)", labelEn: "Subtitle (EN)" },
      heroBannerUrl: { id: "heroBannerUrl", type: "image_picker", labelTr: "Afiş Görseli", labelEn: "Banner Image" },
      ctaTextTR: { id: "ctaTextTR", type: "text", labelTr: "Buton Metni (TR)", labelEn: "Button Text (TR)" },
      ctaTextEN: { id: "ctaTextEN", type: "text", labelTr: "Buton Metni (EN)", labelEn: "Button Text (EN)" },
      ctaUrl: { id: "ctaUrl", type: "link_picker", labelTr: "Yönlendirme Linki", labelEn: "CTA Destination URL" },
      badgeTextTR: { id: "badgeTextTR", type: "text", labelTr: "Etiket Metni (TR)", labelEn: "Badge Text (TR)" },
    },
  },
  PRODUCT_CAROUSEL: {
    type: "PRODUCT_CAROUSEL",
    nameTr: "Ürün Kaydırıcı / Çok Satanlar",
    nameEn: "Product Carousel / Bestsellers",
    category: "PRODUCTS",
    descriptionTr: "Dinamik veya manuel seçilen ürünlerin yatay kaydırılabilir vitrini.",
    descriptionEn: "Horizontal scrolling product cards powered by dynamic rules or manual selection.",
    iconName: "ShoppingCart",
    defaultConfig: {
      titleTR: "En Çok Satanlar",
      titleEN: "Bestsellers",
      subtitleTR: "Kullanıcılarımızın bu hafta en çok tercih ettiği ürünler",
      subtitleEN: "Trending items most loved by our shoppers this week",
      productRules: {
        source: "BESTSELLING",
        itemLimitDesktop: 8,
        itemLimitTablet: 4,
        itemLimitMobile: 2,
      },
    },
    fields: {
      titleTR: { id: "titleTR", type: "text", labelTr: "Başlık (TR)", labelEn: "Heading (TR)" },
      titleEN: { id: "titleEN", type: "text", labelTr: "Başlık (EN)", labelEn: "Heading (EN)" },
      subtitleTR: { id: "subtitleTR", type: "text", labelTr: "Alt Başlık (TR)", labelEn: "Subtitle (TR)" },
      productSource: {
        id: "productSource",
        type: "select",
        labelTr: "Ürün Kaynağı",
        labelEn: "Product Source",
        options: [
          { label: "Çok Satanlar (Bestsellers)", value: "BESTSELLERS" },
          { label: "Yeni Gelenler (New Arrivals)", value: "NEW_ARRIVALS" },
          { label: "İndirimdekiler (On Sale)", value: "ON_SALE" },
          { label: "Manuel Seçim (Handpicked)", value: "MANUAL" },
        ],
      },
    },
  },
  CATEGORY_GRID: {
    type: "CATEGORY_GRID",
    nameTr: "Kategori Izgarası",
    nameEn: "Category Grid",
    category: "CATEGORIES",
    descriptionTr: "Görsel ve ikonlu kategori kartları vitrini.",
    descriptionEn: "Grid cards highlighting primary marketplace categories.",
    iconName: "Grid",
    defaultConfig: {
      titleTR: "Popüler Kategoriler",
      titleEN: "Popular Categories",
      columnsDesktop: 8,
    },
    fields: {
      titleTR: { id: "titleTR", type: "text", labelTr: "Başlık (TR)", labelEn: "Heading (TR)" },
      titleEN: { id: "titleEN", type: "text", labelTr: "Başlık (EN)", labelEn: "Heading (EN)" },
    },
  },
  FLASH_DEALS: {
    type: "FLASH_DEALS",
    nameTr: "Flaş İndirimler & Geri Sayım",
    nameEn: "Flash Sales & Countdown",
    category: "CAMPAIGNS",
    descriptionTr: "Süreli indirimli ürünler ve canlı geri sayım saati.",
    descriptionEn: "Time-limited discounted products with a live countdown timer.",
    iconName: "Flame",
    defaultConfig: {
      titleTR: "Günün Flaş Fırsatları",
      titleEN: "Flash Deals of the Day",
      subtitleTR: "Tükenmeden yakalayın! Saat 23:59'a kadar geçerli indirimler.",
      subtitleEN: "Grab them before they run out! Valid until midnight.",
    },
    fields: {
      titleTR: { id: "titleTR", type: "text", labelTr: "Başlık (TR)", labelEn: "Heading (TR)" },
      titleEN: { id: "titleEN", type: "text", labelTr: "Başlık (EN)", labelEn: "Heading (EN)" },
      subtitleTR: { id: "subtitleTR", type: "textarea", labelTr: "Alt Başlık (TR)", labelEn: "Subtitle (TR)" },
    },
  },
  BANNER_STRIP: {
    type: "BANNER_STRIP",
    nameTr: "Kampanya Banner Şeritleri",
    nameEn: "Campaign Banner Strips",
    category: "CAMPAIGNS",
    descriptionTr: "Özel sezon ve kategori tanıtım kartları.",
    descriptionEn: "Promotional cards highlighting seasonal shopping events.",
    iconName: "Megaphone",
    defaultConfig: {
      titleTR: "Öne Çıkan Kampanyalar",
      titleEN: "Featured Campaigns",
    },
    fields: {
      titleTR: { id: "titleTR", type: "text", labelTr: "Başlık (TR)", labelEn: "Heading (TR)" },
    },
  },
  BRAND_STRIP: {
    type: "BRAND_STRIP",
    nameTr: "Marka Logoları Şeridi",
    nameEn: "Brand Logo Strip",
    category: "BRANDS",
    descriptionTr: "Yetkili satıcı ve popüler marka logolarının hızlı geçiş şeridi.",
    descriptionEn: "Continuous horizontal strip of popular brand logos.",
    iconName: "Award",
    defaultConfig: {
      titleTR: "Öne Çıkan Markalar",
      titleEN: "Featured Brands",
    },
    fields: {
      titleTR: { id: "titleTR", type: "text", labelTr: "Başlık (TR)", labelEn: "Heading (TR)" },
    },
  },
  SPONSOR_CAROUSEL: {
    type: "SPONSOR_CAROUSEL",
    nameTr: "Sponsorlar & Partner Markalar",
    nameEn: "Sponsors & Partner Brands",
    category: "SPONSORS",
    descriptionTr: "Pazaryeri resmi sponsorları ve ortak marka vitrini.",
    descriptionEn: "Official marketplace sponsors with priority sorting.",
    iconName: "Award",
    defaultConfig: {
      titleTR: "Resmi Sponsorlarımız & İş Ortaklarımız",
      titleEN: "Official Sponsors & Partners",
      subtitleTR: "Güvenilir global ve yerel marka ortaklarımız.",
      subtitleEN: "Trusted global and local brand partnerships.",
    },
    fields: {
      titleTR: { id: "titleTR", type: "text", labelTr: "Başlık (TR)", labelEn: "Heading (TR)" },
      titleEN: { id: "titleEN", type: "text", labelTr: "Başlık (EN)", labelEn: "Heading (EN)" },
      subtitleTR: { id: "subtitleTR", type: "text", labelTr: "Alt Başlık (TR)", labelEn: "Subtitle (TR)" },
    },
  },
  STORE_HIGHLIGHTS: {
    type: "STORE_HIGHLIGHTS",
    nameTr: "Öne Çıkan Mağazalar",
    nameEn: "Store Highlights",
    category: "CONTENT",
    descriptionTr: "Yüksek puanlı onaylı satıcı mağazaları.",
    descriptionEn: "Top-rated verified seller stores.",
    iconName: "Store",
    defaultConfig: {
      titleTR: "Haftanın Başarılı Mağazaları",
      titleEN: "Top Rated Stores of the Week",
      subtitleTR: "Kullanıcı memnuniyeti en yüksek doğrulanmış satıcılar",
      subtitleEN: "Verified merchants with highest buyer ratings",
    },
    fields: {
      titleTR: { id: "titleTR", type: "text", labelTr: "Başlık (TR)", labelEn: "Heading (TR)" },
      titleEN: { id: "titleEN", type: "text", labelTr: "Başlık (EN)", labelEn: "Heading (EN)" },
    },
  },
  TRUST_BADGES: {
    type: "TRUST_BADGES",
    nameTr: "Müşteri Güven Rozetleri",
    nameEn: "Customer Trust Badges",
    category: "TRUST",
    descriptionTr: "Orijinallik garantisi, hızlı kargo ve güvenli ödeme rozetleri.",
    descriptionEn: "Original guarantee, fast shipping, and secure payment badges.",
    iconName: "ShieldCheck",
    defaultConfig: {
      titleTR: "Cadde Store Güvencesi",
      titleEN: "Cadde Store Guarantee",
    },
    fields: {
      titleTR: { id: "titleTR", type: "text", labelTr: "Başlık (TR)", labelEn: "Heading (TR)" },
    },
  },
};
