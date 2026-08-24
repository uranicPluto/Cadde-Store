import prisma from "@/lib/db/prisma";
import { PageLayoutConfig } from "@prisma/client";

export type PageLayoutType = "PRODUCT" | "CATEGORY";

export interface LayoutBlockItem {
  id: string;
  type: string;
  titleTr: string;
  titleEn: string;
  enabled: boolean;
  orderIndex: number;
  config?: Record<string, any>;
}

export interface PageLayoutConfigDTO {
  id: string;
  pageType: PageLayoutType;
  isCustom: boolean;
  blocks: LayoutBlockItem[];
  updatedAt: Date | string;
}

export interface PageLayoutConfigInput {
  isCustom?: boolean;
  blocks: LayoutBlockItem[];
}

export const DEFAULT_PRODUCT_PAGE_BLOCKS: LayoutBlockItem[] = [
  { id: "blk-gallery", type: "GALLERY", titleTr: "Görsel Galerisi & Zoom", titleEn: "Image Gallery & Zoom", enabled: true, orderIndex: 0, config: { layout: "CAROUSEL", showThumbnails: true } },
  { id: "blk-title-brand", type: "TITLE_BRAND", titleTr: "Ürün Başlığı & Marka Rozeti", titleEn: "Product Title & Brand Badge", enabled: true, orderIndex: 1, config: {} },
  { id: "blk-rating-reviews", type: "RATING_REVIEWS", titleTr: "Yıldız Puanı & Yorum Sayısı", titleEn: "Rating Stars & Review Count", enabled: true, orderIndex: 2, config: { showStars: true } },
  { id: "blk-price-discount", type: "PRICE_DISCOUNT", titleTr: "Fiyat & İndirim Rozeti", titleEn: "Price & Discount Badge", enabled: true, orderIndex: 3, config: { showOriginalPrice: true, showDiscountBadge: true } },
  { id: "blk-variants", type: "VARIANTS", titleTr: "Renk ve Beden Seçimi", titleEn: "Color & Size Variants", enabled: true, orderIndex: 4, config: { showColorSwatches: true, showSizeGuide: true } },
  { id: "blk-seller-card", type: "SELLER_CARD", titleTr: "Satıcı Bilgi Kartı & Puanı", titleEn: "Merchant Store Card & Score", enabled: true, orderIndex: 5, config: { showRating: true, showFollowButton: true } },
  { id: "blk-shipping-estimator", type: "SHIPPING_ESTIMATOR", titleTr: "Kargo & Teslimat Tahmini", titleEn: "Shipping & Delivery Estimator", enabled: true, orderIndex: 6, config: { carrierName: "Yurtiçi Kargo" } },
  { id: "blk-buy-box", type: "BUY_BOX", titleTr: "Sepete Ekle & Hemen Al Butonları", titleEn: "Add to Cart & Buy Now Buttons", enabled: true, orderIndex: 7, config: { showQuantityPicker: true } },
  { id: "blk-trust-badges", type: "TRUST_BADGES", titleTr: "Güvenilirlik & İade Garantisi", titleEn: "Trust Badges & Return Guarantee", enabled: true, orderIndex: 8, config: {} },
  { id: "blk-description", type: "DESCRIPTION", titleTr: "Ürün Açıklaması & Detayları", titleEn: "Product Description & Details", enabled: true, orderIndex: 9, config: {} },
  { id: "blk-specs", type: "SPECS", titleTr: "Teknik Özellikler Tablosu", titleEn: "Technical Specifications Table", enabled: true, orderIndex: 10, config: {} },
  { id: "blk-reviews", type: "REVIEWS", titleTr: "Müşteri Değerlendirmeleri & Yorumlar", titleEn: "Customer Reviews & Ratings", enabled: true, orderIndex: 11, config: {} },
  { id: "blk-related-products", type: "RELATED_PRODUCTS", titleTr: "Benzer & Önerilen Ürünler", titleEn: "Related & Recommended Items", enabled: true, orderIndex: 12, config: { limit: 8 } },
];

export const DEFAULT_CATEGORY_PAGE_BLOCKS: LayoutBlockItem[] = [
  { id: "blk-cat-hero", type: "CATEGORY_HERO", titleTr: "Kategori Başlık & Banner Alanı", titleEn: "Category Hero & Banner Area", enabled: true, orderIndex: 0, config: {} },
  { id: "blk-cat-subcategories", type: "SUBCATEGORY_PILLS", titleTr: "Alt Kategori Hızlı Erişim Butonları", titleEn: "Subcategory Quick Filter Pills", enabled: true, orderIndex: 1, config: {} },
  { id: "blk-cat-brands", type: "BRAND_CAROUSEL", titleTr: "Öne Çıkan Kategori Markaları", titleEn: "Featured Category Brands", enabled: true, orderIndex: 2, config: {} },
  { id: "blk-cat-promos", type: "PROMO_BANNERS", titleTr: "Kategori Kampanya Kartları", titleEn: "Category Campaign Cards", enabled: true, orderIndex: 3, config: {} },
  { id: "blk-cat-filter-bar", type: "FILTER_BAR", titleTr: "Filtreleme & Sıralama Çubuğu", titleEn: "Filter & Sort ToolBar", enabled: true, orderIndex: 4, config: {} },
  { id: "blk-cat-product-grid", type: "PRODUCT_GRID", titleTr: "Ürün Listeleme Izgarası (Grid)", titleEn: "Product Catalog Grid", enabled: true, orderIndex: 5, config: { columnsDesktop: 4, columnsMobile: 2 } },
  { id: "blk-cat-recommendations", type: "RECOMMENDATIONS", titleTr: "Kategori Çok Satan Önerileri", titleEn: "Category Bestseller Recommendations", enabled: true, orderIndex: 6, config: { limit: 6 } },
];

export function getDefaultBlocks(pageType: PageLayoutType): LayoutBlockItem[] {
  return pageType === "PRODUCT" ? DEFAULT_PRODUCT_PAGE_BLOCKS : DEFAULT_CATEGORY_PAGE_BLOCKS;
}

export async function getPageLayoutConfig(pageType: PageLayoutType): Promise<PageLayoutConfigDTO> {
  try {
    let layout = await prisma.pageLayoutConfig.findUnique({
      where: { pageType },
    });

    if (!layout) {
      const defaultBlocks = getDefaultBlocks(pageType);
      layout = await prisma.pageLayoutConfig.create({
        data: {
          pageType,
          isCustom: false,
          blocksJson: JSON.stringify(defaultBlocks),
        },
      });
    }

    let parsedBlocks: LayoutBlockItem[] = [];
    try {
      parsedBlocks = JSON.parse(layout.blocksJson || "[]");
    } catch {
      parsedBlocks = getDefaultBlocks(pageType);
    }

    return {
      id: layout.id,
      pageType: layout.pageType as PageLayoutType,
      isCustom: layout.isCustom,
      blocks: parsedBlocks,
      updatedAt: layout.updatedAt,
    };
  } catch (error) {
    console.warn(`[LayoutRepository getPageLayoutConfig fallback for ${pageType}]:`, error);
    return {
      id: `default-${pageType.toLowerCase()}`,
      pageType,
      isCustom: false,
      blocks: getDefaultBlocks(pageType),
      updatedAt: new Date(),
    };
  }
}

export async function updatePageLayoutConfig(
  pageType: PageLayoutType,
  input: PageLayoutConfigInput
): Promise<PageLayoutConfigDTO> {
  const blocksJson = JSON.stringify(input.blocks || getDefaultBlocks(pageType));
  const isCustom = input.isCustom !== undefined ? input.isCustom : true;

  const layout = await prisma.pageLayoutConfig.upsert({
    where: { pageType },
    create: {
      pageType,
      isCustom,
      blocksJson,
    },
    update: {
      isCustom,
      blocksJson,
    },
  });

  return {
    id: layout.id,
    pageType: layout.pageType as PageLayoutType,
    isCustom: layout.isCustom,
    blocks: JSON.parse(layout.blocksJson || "[]"),
    updatedAt: layout.updatedAt,
  };
}

export async function resetPageLayoutConfig(pageType: PageLayoutType): Promise<PageLayoutConfigDTO> {
  const defaultBlocks = getDefaultBlocks(pageType);
  const layout = await prisma.pageLayoutConfig.upsert({
    where: { pageType },
    create: {
      pageType,
      isCustom: false,
      blocksJson: JSON.stringify(defaultBlocks),
    },
    update: {
      isCustom: false,
      blocksJson: JSON.stringify(defaultBlocks),
    },
  });

  return {
    id: layout.id,
    pageType: layout.pageType as PageLayoutType,
    isCustom: false,
    blocks: defaultBlocks,
    updatedAt: layout.updatedAt,
  };
}

