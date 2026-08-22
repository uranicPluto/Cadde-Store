import { Language } from "../i18n/config";

export interface ReviewMock {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount: number;
}

export interface DetailedProductMock {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  galleryImages: string[];
  badges?: {
    bestseller?: boolean;
    fastDelivery?: boolean;
    freeShipping?: boolean;
    coupon?: string;
    campaign?: string;
    limitedStock?: boolean;
  };
  attributes?: {
    color?: string[];
    sizes?: string[];
    material?: string;
    warranty?: string;
  };
  description: string;
  specifications: Record<string, string>;
  stock: number;
  reviews: ReviewMock[];
}

// Convert DB Product record to DetailedProductMock interface format
export function mapDbProductToMock(dbProd: any, lang: Language = "tr"): DetailedProductMock {
  const isEn = lang === "en";

  let colors: string[] = [];
  let sizes: string[] = [];
  let images: string[] = [dbProd.imageUrl];

  try {
    if (typeof dbProd.colors === "string") colors = JSON.parse(dbProd.colors);
    if (typeof dbProd.sizes === "string") sizes = JSON.parse(dbProd.sizes);
    if (typeof dbProd.images === "string") images = JSON.parse(dbProd.images);
    if (images.length === 0) images = [dbProd.imageUrl];
  } catch (e) {}

  return {
    id: dbProd.id,
    slug: dbProd.slug,
    name: dbProd.name,
    brand: dbProd.brand || "Cadde Store",
    categorySlug: dbProd.category?.slug || "general",
    categoryName: isEn ? dbProd.category?.nameEN || dbProd.category?.nameTR : dbProd.category?.nameTR || "Genel",
    storeName: dbProd.seller?.storeName || "Cadde Store Mağazası",
    price: dbProd.price,
    originalPrice: dbProd.originalPrice || undefined,
    rating: dbProd.rating || 5.0,
    reviewCount: dbProd.reviewCount || 0,
    imageUrl: dbProd.imageUrl,
    galleryImages: images,
    badges: {
      bestseller: dbProd.rating >= 4.8,
      fastDelivery: true,
      freeShipping: dbProd.price >= 200,
    },
    attributes: {
      color: colors,
      sizes,
    },
    description: dbProd.description || dbProd.name,
    specifications: {
      [isEn ? "Brand" : "Marka"]: dbProd.brand || "Cadde Store",
      [isEn ? "SKU" : "Stok Kodu"]: dbProd.sku || "CS-SKU",
    },
    stock: dbProd.stock,
    reviews: Array.isArray(dbProd.reviews)
      ? dbProd.reviews.map((r: any) => ({
          id: r.id,
          userName: r.user ? `${r.user.firstName} ${r.user.lastName[0]}.` : "Müşteri",
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString("tr-TR"),
          comment: r.comment,
          helpfulCount: 0,
        }))
      : [],
  };
}

export function getFullCatalog(lang: Language = "tr"): DetailedProductMock[] {
  const isEn = lang === "en";

  return [
    {
      id: "p1",
      slug: "zara-siyah-oversize-fit-bisiklet-yaka-pamuklu-erkek-tisort",
      name: isEn
        ? "Black Oversize Fit Crew Neck Cotton Men's T-Shirt"
        : "Siyah Oversize Fit Bisiklet Yaka Pamuklu Erkek Tişört",
      brand: "Zara",
      categorySlug: "men",
      categoryName: isEn ? "Men's Clothing" : "Erkek Giyim",
      storeName: isEn ? "Trend Fashion Store" : "Trend Fashion Mağazası",
      price: 349.99,
      originalPrice: 499.99,
      rating: 4.8,
      reviewCount: 1420,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
      ],
      badges: { bestseller: true, fastDelivery: true, freeShipping: true, coupon: isEn ? "$50 Coupon" : "50 TL Kupon" },
      attributes: { color: [isEn ? "Black" : "Siyah", isEn ? "White" : "Beyaz"], sizes: ["S", "M", "L", "XL"] },
      description: isEn
        ? "100% premium combed cotton breathable oversize t-shirt designed for ultimate daily comfort."
        : "%100 birinici sınıf penyeden üretilmiş, nefes alabilen oversize fit tişört.",
      specifications: { [isEn ? "Material" : "Kumaş Tipi"]: "%100 Pamuk" },
      stock: 45,
      reviews: [
        { id: "r1", userName: "Ahmet K.", rating: 5, date: "12.08.2026", comment: isEn ? "Fabric quality is top notch!" : "Kumaş kalitesi harika!", helpfulCount: 14 },
      ],
    },
    {
      id: "p2",
      slug: "nike-air-cushion-kosu-ve-yuruyus-spor-ayakkabisi",
      name: isEn ? "Air Cushion Running & Walking Sports Shoes" : "Air Cushion Koşu ve Yürüyüş Spor Ayakkabısı",
      brand: "Nike",
      categorySlug: "shoes-bags",
      categoryName: isEn ? "Shoes & Bags" : "Ayakkabı & Çanta",
      storeName: isEn ? "Sports Market Turkey" : "Spor Market Türkiye",
      price: 2199.00,
      originalPrice: 2899.00,
      rating: 4.9,
      reviewCount: 3840,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"],
      badges: { bestseller: true, fastDelivery: true, freeShipping: true },
      attributes: { color: [isEn ? "Red" : "Kırmızı"], sizes: ["40", "41", "42", "43"] },
      description: isEn ? "High-performance air-cushioned running shoes." : "Üstün darbe emiş gücü ve esneklik sunan özel hava yastıklı koşu ayakkabısı.",
      specifications: { [isEn ? "Sole Type" : "Taban Tipi"]: "Air Cushion" },
      stock: 18,
      reviews: [],
    },
    {
      id: "p3",
      slug: "sony-kablosuz-gurultu-engelleyici-kulak-ustu-bluetooth-kulaklik",
      name: isEn ? "Wireless Noise-Canceling Over-Ear Bluetooth Headphones" : "Kablosuz Gürültü Engelleyici Kulak Üstü Bluetooth Kulaklık",
      brand: "Sony",
      categorySlug: "electronics",
      categoryName: isEn ? "Electronics" : "Elektronik",
      storeName: isEn ? "TechWorld Turkey" : "TechWorld Türkiye",
      price: 4599.90,
      originalPrice: 5299.90,
      rating: 4.7,
      reviewCount: 950,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
      badges: { fastDelivery: true, freeShipping: true },
      attributes: { color: [isEn ? "Black" : "Siyah"] },
      description: isEn ? "Industry-leading active noise canceling headphones." : "30 saat pil ömrü ve Yüksek Çözünürlüklü ses kalitesi sunan kulaklık.",
      specifications: { [isEn ? "Battery Life" : "Pil Ömrü"]: "30 Saat" },
      stock: 5,
      reviews: [],
    },
  ];
}

// Async Database Product Fetchers with Fallback
export async function fetchDbProducts(lang: Language = "tr"): Promise<DetailedProductMock[]> {
  try {
    const res = await fetch(`/api/products`, { cache: "no-store" });
    if (!res.ok) return getFullCatalog(lang);
    const data = await res.json();
    if (data.products && Array.isArray(data.products) && data.products.length > 0) {
      return data.products.map((p: any) => mapDbProductToMock(p, lang));
    }
  } catch (e) {}
  return getFullCatalog(lang);
}

export async function fetchDbProductBySlug(slug: string, lang: Language = "tr"): Promise<DetailedProductMock | null> {
  try {
    const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.product) return mapDbProductToMock(data.product, lang);
    }
  } catch (e) {}

  const catalog = getFullCatalog(lang);
  return catalog.find((p) => p.slug === slug) || null;
}
