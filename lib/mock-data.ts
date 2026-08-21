import { Language } from "./i18n/config";

export interface ProductMock {
  id: string;
  name: string;
  brand: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  badges?: {
    bestseller?: boolean;
    fastDelivery?: boolean;
    freeShipping?: boolean;
    coupon?: string;
    campaign?: string;
    limitedStock?: boolean;
  };
  attributes?: {
    color?: string;
    sizes?: string[];
  };
}

export interface BrandMock {
  id: string;
  name: string;
  logoUrl: string;
  discountText?: string;
  bannerUrl?: string;
}

export interface StoreMock {
  id: string;
  name: string;
  logoUrl: string;
  rating: number;
  followerCount: string;
  bannerUrl: string;
  featuredProductImage: string;
}

export interface BannerMock {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  badge?: string;
  bgGradient: string;
  imageUrl: string;
}

export function getMockProducts(lang: Language = "tr"): ProductMock[] {
  const isEn = lang === "en";

  return [
    {
      id: "p1",
      name: isEn
        ? "Black Oversize Fit Crew Neck Cotton Men's T-Shirt"
        : "Siyah Oversize Fit Bisiklet Yaka Pamuklu Erkek Tişört",
      brand: "Zara",
      storeName: isEn ? "Trend Fashion Store" : "Trend Fashion Mağazası",
      price: 349.99,
      originalPrice: 499.99,
      rating: 4.8,
      reviewCount: 1420,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      badges: {
        bestseller: true,
        fastDelivery: true,
        freeShipping: true,
        coupon: isEn ? "$50 Coupon" : "50 TL Kupon",
      },
      attributes: {
        color: isEn ? "Black" : "Siyah",
        sizes: ["S", "M", "L", "XL"],
      },
    },
    {
      id: "p2",
      name: isEn
        ? "Air Cushion Running & Walking Sports Shoes"
        : "Air Cushion Koşu ve Yürüyüş Spor Ayakkabısı",
      brand: "Nike",
      storeName: isEn ? "Sports Market Turkey" : "Spor Market Türkiye",
      price: 2199.00,
      originalPrice: 2899.00,
      rating: 4.9,
      reviewCount: 3840,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      badges: {
        bestseller: true,
        fastDelivery: true,
        freeShipping: true,
        campaign: isEn ? "Sports Festival" : "Spor Festivali",
      },
      attributes: {
        color: isEn ? "Red" : "Kırmızı",
        sizes: ["40", "41", "42", "43", "44"],
      },
    },
    {
      id: "p3",
      name: isEn
        ? "Wireless Noise-Canceling Over-Ear Bluetooth Headphones"
        : "Kablosuz Gürültü Engelleyici Kulak Üstü Bluetooth Kulaklık",
      brand: "Sony",
      storeName: isEn ? "TechWorld Turkey" : "TechWorld Türkiye",
      price: 4599.90,
      originalPrice: 5299.90,
      rating: 4.7,
      reviewCount: 950,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      badges: {
        fastDelivery: true,
        freeShipping: true,
        limitedStock: true,
      },
      attributes: {
        color: isEn ? "Black" : "Siyah",
      },
    },
    {
      id: "p4",
      name: isEn
        ? "Stainless Steel 12-Piece Ceramic Cookware Set"
        : "Paslanmaz Çelik 12 Parça Çeyiz Seramik Tencere Seti",
      brand: "Karaca",
      storeName: isEn ? "Home & Living Concept" : "Evim & Yaşam Concept",
      price: 1899.00,
      originalPrice: 2499.00,
      rating: 4.6,
      reviewCount: 620,
      imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
      badges: {
        freeShipping: true,
        coupon: isEn ? "$100 Discount" : "100 TL İndirim",
      },
    },
    {
      id: "p5",
      name: isEn
        ? "Genuine Leather Men's Shoulder Crossbody Bag"
        : "Derivasyonlu Hakiki Deri Erkek Omuz Çantası",
      brand: "Polo Club",
      storeName: isEn ? "Bag World" : "Çanta Dünyası",
      price: 799.50,
      originalPrice: 1199.00,
      rating: 4.5,
      reviewCount: 310,
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
      badges: {
        fastDelivery: true,
      },
    },
    {
      id: "p6",
      name: isEn
        ? "Natural Vitamin C Radiance Facial Care Serum 30ml"
        : "Doğal Vitamin C Işıltı Veren Yüz Bakım Serumu 30ml",
      brand: "L'Oreal Paris",
      storeName: isEn ? "Cosmetics World" : "Kozmetik Dünyası",
      price: 249.90,
      originalPrice: 399.90,
      rating: 4.8,
      reviewCount: 5400,
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
      badges: {
        bestseller: true,
        fastDelivery: true,
      },
    },
  ];
}

export function getMockBrands(lang: Language = "tr"): BrandMock[] {
  const isEn = lang === "en";
  return [
    { id: "b1", name: "Nike", logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80", discountText: isEn ? "Up to 40% Off Deals" : "%40'a Vardı Fırsatlar" },
    { id: "b2", name: "Zara", logoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80", discountText: isEn ? "New Season Collection" : "Yeni Sezon Koleksiyonu" },
    { id: "b3", name: "Apple", logoUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80", discountText: isEn ? "No-Interest Installments" : "Vade Farksız Taksit" },
    { id: "b4", name: "Samsung", logoUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80", discountText: isEn ? "Special Offer Products" : "Özel Fırsat Ürünleri" },
    { id: "b5", name: "Karaca", logoUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=200&q=80", discountText: isEn ? "30% Off Home Bundles" : "Çeyiz Paketlerinde %30" },
    { id: "b6", name: "Mango", logoUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=200&q=80", discountText: isEn ? "End of Season Sale" : "Sezon Sonu İndirimi" },
  ];
}

export function getMockStores(lang: Language = "tr"): StoreMock[] {
  const isEn = lang === "en";
  return [
    {
      id: "s1",
      name: isEn ? "Trend Fashion Store" : "Trend Fashion Mağazası",
      logoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: 9.8,
      followerCount: "142.5K",
      bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      featuredProductImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "s2",
      name: isEn ? "TechWorld Turkey" : "TechWorld Türkiye",
      logoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      rating: 9.6,
      followerCount: "89.2K",
      bannerUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      featuredProductImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
    },
  ];
}

export function getMockBanners(lang: Language = "tr"): BannerMock[] {
  const isEn = lang === "en";
  return [
    {
      id: "bn1",
      title: isEn ? "Big Autumn Sale Deals" : "Büyük Sonbahar Fırsatları",
      subtitle: isEn ? "Flat 50% Off Selected Fashion & Footwear" : "Seçili Moda ve Ayakkabı Ürünlerinde Net %50 İndirim",
      ctaText: isEn ? "Start Shopping" : "Alışverişe Başla",
      badge: isEn ? "Limited Time" : "Sınırlı Süre",
      bgGradient: "from-orange-500 to-amber-600",
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "bn2",
      title: isEn ? "Electronics Days Started!" : "Elektronik Günleri Başladı!",
      subtitle: isEn ? "6 Installments on Phones, Laptops & Headphones" : "Telefon, Laptop ve Kulaklıklarda Peşin Fiyatına 6 Taksit",
      ctaText: isEn ? "Explore Deals" : "Fırsatları İncele",
      badge: isEn ? "Super Deal" : "Süper Fırsat",
      bgGradient: "from-indigo-600 to-purple-600",
      imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80",
    },
  ];
}

export function getMockCategories(lang: Language = "tr") {
  const isEn = lang === "en";
  return [
    { id: "c1", name: isEn ? "Women's Clothing" : "Kadın Giyim", icon: "Shirt" },
    { id: "c2", name: isEn ? "Men's Clothing" : "Erkek Giyim", icon: "User" },
    { id: "c3", name: isEn ? "Shoes & Bags" : "Ayakkabı & Çanta", icon: "Footprints" },
    { id: "c4", name: isEn ? "Electronics" : "Elektronik", icon: "Smartphone" },
    { id: "c5", name: isEn ? "Home & Living" : "Ev & Yaşam", icon: "Home" },
    { id: "c6", name: isEn ? "Cosmetics & Personal Care" : "Kozmetik & Kişisel Bakım", icon: "Sparkles" },
    { id: "c7", name: isEn ? "Sports & Outdoor" : "Spor & Outdoor", icon: "Activity" },
    { id: "c8", name: isEn ? "Supermarket" : "Süpermarket", icon: "ShoppingBag" },
  ];
}

export const MOCK_PRODUCTS = getMockProducts("tr");
export const MOCK_BRANDS = getMockBrands("tr");
export const MOCK_STORES = getMockStores("tr");
export const MOCK_BANNERS = getMockBanners("tr");
export const MOCK_CATEGORIES = getMockCategories("tr");
