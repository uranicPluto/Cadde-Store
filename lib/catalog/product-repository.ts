import { Language } from "../i18n/config";
import { createSlug } from "./slug-utils";

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
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
      ],
      badges: { bestseller: true, fastDelivery: true, freeShipping: true, coupon: isEn ? "$50 Coupon" : "50 TL Kupon" },
      attributes: { color: [isEn ? "Black" : "Siyah", isEn ? "White" : "Beyaz", isEn ? "Beige" : "Bej"], sizes: ["S", "M", "L", "XL"] },
      description: isEn
        ? "100% premium combed cotton breathable oversize t-shirt designed for ultimate daily comfort and streetwear aesthetics."
        : "%100 birinici sınıf penyeden üretilmiş, nefes alabilen oversize fit tişört. Günlük rahatlık ve sokak modası stilini bir arada sunar.",
      specifications: { [isEn ? "Material" : "Kumaş Tipi"]: "%100 Pamuk", [isEn ? "Pattern" : "Kalıp"]: "Oversize", [isEn ? "Origin" : "Menşei"]: "Türkiye" },
      stock: 45,
      reviews: [
        { id: "r1", userName: "Ahmet K.", rating: 5, date: "12.08.2026", comment: isEn ? "Fabric quality is top notch, fits perfectly!" : "Kumaş kalitesi harika, kalıbı tam oturdu!", helpfulCount: 14 },
        { id: "r2", userName: "Burak Y.", rating: 4, date: "05.08.2026", comment: isEn ? "Nice color and fast delivery." : "Rengi güzel, kargo hızlı geldi.", helpfulCount: 6 },
      ],
    },
    {
      id: "p2",
      slug: "nike-air-cushion-kosu-ve-yuruyus-spor-ayakkabisi",
      name: isEn
        ? "Air Cushion Running & Walking Sports Shoes"
        : "Air Cushion Koşu ve Yürüyüş Spor Ayakkabısı",
      brand: "Nike",
      categorySlug: "shoes-bags",
      categoryName: isEn ? "Shoes & Bags" : "Ayakkabı & Çanta",
      storeName: isEn ? "Sports Market Turkey" : "Spor Market Türkiye",
      price: 2199.00,
      originalPrice: 2899.00,
      rating: 4.9,
      reviewCount: 3840,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
      ],
      badges: { bestseller: true, fastDelivery: true, freeShipping: true, campaign: isEn ? "Sports Festival" : "Spor Festivali" },
      attributes: { color: [isEn ? "Red" : "Kırmızı", isEn ? "Black" : "Siyah"], sizes: ["40", "41", "42", "43", "44"] },
      description: isEn ? "High-performance air-cushioned running shoes engineered for superior bounce and shock absorption." : "Üstün darbe emiş gücü ve esneklik sunan özel hava yastıklı koşu ayakkabısı.",
      specifications: { [isEn ? "Sole Type" : "Taban Tipi"]: "Air Cushion", [isEn ? "Activity" : "Kullanım Alanı"]: "Koşu / Yürüyüş" },
      stock: 18,
      reviews: [{ id: "r3", userName: "Caner T.", rating: 5, date: "18.08.2026", comment: isEn ? "Super comfortable for long walks." : "Uzun yürüyüşler için süper rahat.", helpfulCount: 22 }],
    },
    {
      id: "p3",
      slug: "sony-kablosuz-gurultu-engelleyici-kulak-ustu-bluetooth-kulaklik",
      name: isEn
        ? "Wireless Noise-Canceling Over-Ear Bluetooth Headphones"
        : "Kablosuz Gürültü Engelleyici Kulak Üstü Bluetooth Kulaklık",
      brand: "Sony",
      categorySlug: "electronics",
      categoryName: isEn ? "Electronics" : "Elektronik",
      storeName: isEn ? "TechWorld Turkey" : "TechWorld Türkiye",
      price: 4599.90,
      originalPrice: 5299.90,
      rating: 4.7,
      reviewCount: 950,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      ],
      badges: { fastDelivery: true, freeShipping: true, limitedStock: true },
      attributes: { color: [isEn ? "Black" : "Siyah", isEn ? "Silver" : "Gümüş"] },
      description: isEn ? "Industry-leading active noise canceling headphones with 30-hour battery life and Hi-Res audio." : "30 saat pil ömrü ve Yüksek Çözünürlüklü ses kalitesi sunan aktif gürültü engellemeli kulaklık.",
      specifications: { [isEn ? "Battery Life" : "Pil Ömrü"]: "30 Saat", [isEn ? "Connectivity" : "Bağlantı"]: "Bluetooth 5.2" },
      stock: 5,
      reviews: [{ id: "r4", userName: "Mehmet E.", rating: 5, date: "20.08.2026", comment: isEn ? "Best ANC on the market." : "Piyasadaki en iyi ses ve ANC kalitesi.", helpfulCount: 31 }],
    },
    {
      id: "p4",
      slug: "karaca-paslanmaz-celik-12-parca-seramik-tencere-seti",
      name: isEn
        ? "Stainless Steel 12-Piece Ceramic Cookware Set"
        : "Paslanmaz Çelik 12 Parça Çeyiz Seramik Tencere Seti",
      brand: "Karaca",
      categorySlug: "home-living",
      categoryName: isEn ? "Home & Living" : "Ev & Yaşam",
      storeName: isEn ? "Home & Living Concept" : "Evim & Yaşam Concept",
      price: 1899.00,
      originalPrice: 2499.00,
      rating: 4.6,
      reviewCount: 620,
      imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"],
      badges: { freeShipping: true, coupon: isEn ? "$100 Discount" : "100 TL İndirim" },
      attributes: { color: [isEn ? "Granite Grey" : "Granit Gri"] },
      description: isEn ? "Durable non-stick granite cookware set with ergonomic handles for healthy cooking." : "Sağlıklı yemek pişirme için ergonomik saplı, dayanıklı yapışmaz granit tencere seti.",
      specifications: { [isEn ? "Piece Count" : "Parça Sayısı"]: "12 Parça", [isEn ? "Coating" : "Kaplama"]: "Granit Seramik" },
      stock: 20,
      reviews: [{ id: "r5", userName: "Zeynep B.", rating: 4, date: "15.08.2026", comment: isEn ? "Very stylish set." : "Çok şık bir çeyiz seti.", helpfulCount: 9 }],
    },
    {
      id: "p5",
      slug: "polo-club-hakiki-deri-erkek-omuz-cantasi",
      name: isEn
        ? "Genuine Leather Men's Shoulder Crossbody Bag"
        : "Derivasyonlu Hakiki Deri Erkek Omuz Çantası",
      brand: "Polo Club",
      categorySlug: "shoes-bags",
      categoryName: isEn ? "Shoes & Bags" : "Ayakkabı & Çanta",
      storeName: isEn ? "Bag World" : "Çanta Dünyası",
      price: 799.50,
      originalPrice: 1199.00,
      rating: 4.5,
      reviewCount: 310,
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"],
      badges: { fastDelivery: true },
      attributes: { color: [isEn ? "Brown" : "Kahverengi", isEn ? "Black" : "Siyah"] },
      description: isEn ? "Handcrafted 100% genuine calfskin shoulder bag with multiple zippered compartments." : "Çoklu fermuarlı gözlere sahip, el işçiliği %100 hakiki dana derisi omuz çantası.",
      specifications: { [isEn ? "Material" : "Malzeme"]: "%100 Hakiki Deri" },
      stock: 12,
      reviews: [],
    },
    {
      id: "p6",
      slug: "loreal-paris-dogal-vitamin-c-isilti-veren-yuz-serumu-30ml",
      name: isEn
        ? "Natural Vitamin C Radiance Facial Care Serum 30ml"
        : "Doğal Vitamin C Işıltı Veren Yüz Bakım Serumu 30ml",
      brand: "L'Oreal Paris",
      categorySlug: "beauty-care",
      categoryName: isEn ? "Beauty & Personal Care" : "Kozmetik & Kişisel Bakım",
      storeName: isEn ? "Cosmetics World" : "Kozmetik Dünyası",
      price: 249.90,
      originalPrice: 399.90,
      rating: 4.8,
      reviewCount: 5400,
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"],
      badges: { bestseller: true, fastDelivery: true },
      attributes: { color: [] },
      description: isEn ? "12% Pure Vitamin C serum formulation designed to brighten skin tone and smooth fine lines." : "%12 Saf C Vitamini içeren, cilt tonunu aydınlatan ve ince çizgileri azaltan yüz serumu.",
      specifications: { [isEn ? "Volume" : "Hacim"]: "30 ml", [isEn ? "Skin Type" : "Cilt Tipi"]: "Tüm Cilt Tipleri" },
      stock: 80,
      reviews: [],
    },
    {
      id: "p7",
      slug: "mango-cicek-desenli-v-yaka-sakura-kadin-elbise",
      name: isEn ? "Floral Print V-Neck Sakura Women's Dress" : "Çiçek Desenli V Yaka Sakura Kadın Elbise",
      brand: "Mango",
      categorySlug: "women",
      categoryName: isEn ? "Women's Clothing" : "Kadın Giyim",
      storeName: isEn ? "Trend Fashion Store" : "Trend Fashion Mağazası",
      price: 899.90,
      originalPrice: 1299.90,
      rating: 4.7,
      reviewCount: 420,
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80"],
      badges: { bestseller: true, freeShipping: true },
      attributes: { color: [isEn ? "Pink" : "Pembe"], sizes: ["XS", "S", "M", "L"] },
      description: isEn ? "Elegant spring floral midi dress with fluid fabric." : "Akan kumaşı ve canlı çiçek desenleri ile zarif bahar midi elbise.",
      specifications: { [isEn ? "Length" : "Boy"]: "Midi" },
      stock: 25,
      reviews: [],
    },
    {
      id: "p8",
      slug: "apple-iphone-15-pro-max-256gb-titanyum",
      name: isEn ? "iPhone 15 Pro Max 256GB Natural Titanium" : "iPhone 15 Pro Max 256GB Doğal Titanyum",
      brand: "Apple",
      categorySlug: "electronics",
      categoryName: isEn ? "Electronics" : "Elektronik",
      storeName: isEn ? "TechWorld Turkey" : "TechWorld Türkiye",
      price: 74999.00,
      originalPrice: 79999.00,
      rating: 4.9,
      reviewCount: 1890,
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"],
      badges: { bestseller: true, fastDelivery: true, freeShipping: true },
      attributes: { color: [isEn ? "Natural Titanium" : "Doğal Titanyum"] },
      description: isEn ? "Aerospace-grade titanium design with A17 Pro chip and 48MP main camera." : "Uzay endüstrisi sınıfı titanyum tasarım, A17 Pro çip ve 48MP ana kamera.",
      specifications: { [isEn ? "Storage" : "Hafıza"]: "256 GB" },
      stock: 10,
      reviews: [],
    },
    {
      id: "p9",
      slug: "samsung-55-inc-4k-uhd-smart-crystal-tv",
      name: isEn ? "55-Inch 4K UHD Smart Crystal LED TV" : "55 İnç 4K UHD Smart Crystal LED TV",
      brand: "Samsung",
      categorySlug: "electronics",
      categoryName: isEn ? "Electronics" : "Elektronik",
      storeName: isEn ? "TechWorld Turkey" : "TechWorld Türkiye",
      price: 19499.00,
      originalPrice: 22999.00,
      rating: 4.8,
      reviewCount: 760,
      imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80"],
      badges: { freeShipping: true, coupon: isEn ? "$500 Coupon" : "500 TL Kupon" },
      attributes: { color: [isEn ? "Black" : "Siyah"] },
      description: isEn ? "Vivid crystal processor 4K Smart TV with Tizen OS and HDR10+ support." : "Tizen işletim sistemli ve HDR10+ destekli 4K Crystal akıllı televizyon.",
      specifications: { [isEn ? "Screen Size" : "Ekran Boyutu"]: "55 inç / 139 cm" },
      stock: 14,
      reviews: [],
    },
    {
      id: "p10",
      slug: "philips-airfryer-xxl-sicak-hava-fritozu",
      name: isEn ? "Airfryer XXL Smart Hot Air Fryer 7.2L" : "Airfryer XXL Akıllı Sıcak Hava Fritözü 7.2L",
      brand: "Philips",
      categorySlug: "home-living",
      categoryName: isEn ? "Home & Living" : "Ev & Yaşam",
      storeName: isEn ? "Home & Living Concept" : "Evim & Yaşam Concept",
      price: 5499.00,
      originalPrice: 6999.00,
      rating: 4.9,
      reviewCount: 3120,
      imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80"],
      badges: { bestseller: true, fastDelivery: true, freeShipping: true },
      attributes: { color: [isEn ? "Black" : "Siyah"] },
      description: isEn ? "Cook healthy meals with up to 90% less fat using Rapid CombiAir technology." : "Rapid CombiAir teknolojisi ile %90'a varan daha az yağlı sağlıklı yemekler hazırlayın.",
      specifications: { [isEn ? "Capacity" : "Kapasite"]: "7.2 Litre" },
      stock: 22,
      reviews: [],
    },
  ];
}
