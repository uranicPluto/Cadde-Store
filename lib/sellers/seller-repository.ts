import { SellerProfile } from "./seller-types";
import { Language } from "../i18n/config";

export const MOCK_SELLERS: SellerProfile[] = [
  {
    id: "seller-1",
    slug: "trend-fashion-magazasi",
    name: "Trend Fashion Mağazası",
    logo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
    banner: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    description: {
      tr: "Türkiye'nin lider kadın ve erkek giyim satıcısı. %100 orijinal marka ürünleri ve hızlı teslimat.",
      en: "Turkey's leading men & women fashion store. 100% original brand products and fast shipping.",
    },
    rating: 4.9,
    reviewCount: 3840,
    verified: true,
    location: "İstanbul, Türkiye",
    responseRate: "%99 (Anında yanıt)",
    followers: 42800,
    productCount: 142,
    joinedDate: "Ocak 2024",
    shippingPolicy: {
      tr: "200 TL ve üzeri siparişlerde kargo bedava. Aynı gün hızlı kargo imkanı.",
      en: "Free shipping on orders over 200 TRY. Same-day dispatch available.",
    },
    returnPolicy: {
      tr: "14 gün içinde koşulsuz ücretsiz iade hakkı.",
      en: "14 days hassle-free money back return policy.",
    },
    contactPhone: "0850 123 45 67",
    contactEmail: "destek@trendfashion.com",
    categories: ["men", "women", "shoes-bags"],
    reviews: [
      {
        id: "sr-1",
        userName: "Ahmet K.",
        rating: 5,
        date: "14.08.2026",
        comment: "Kumaş kalitesi ve kargo hızı mükemmel! 24 saat içinde teslim edildi.",
        productName: "Siyah Oversize Fit Bisiklet Yaka Pamuklu Erkek Tişört",
        reply: "Teşekkür ederiz! Ürünümüzü güzel günlerde kullanmanız dileğiyle.",
        replyDate: "15.08.2026",
      },
      {
        id: "sr-2",
        userName: "Zeynep B.",
        rating: 5,
        date: "10.08.2026",
        comment: "Elbisenin duruşu harika. Tam bedeninizi alabilirsiniz.",
        productName: "Çiçek Desenli V Yaka Sakura Kadın Elbise",
      },
    ],
  },
  {
    id: "seller-2",
    slug: "techworld-turkiye",
    name: "TechWorld Türkiye",
    logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
    banner: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80",
    description: {
      tr: "Akıllı telefon, bilgisayar ve kulaklık kategorilerinde yetkili distribütör garantili orijinal teknoloji mağazası.",
      en: "Authorized distributor of smart phones, laptops, and audio gear with official warranty.",
    },
    rating: 4.8,
    reviewCount: 2150,
    verified: true,
    location: "Ankara, Türkiye",
    responseRate: "%98 (30 dakika içinde)",
    followers: 28900,
    productCount: 88,
    joinedDate: "Mart 2024",
    shippingPolicy: {
      tr: "Tüm teknoloji ürünlerinde sigortalı ve korumalı kargo bedava.",
      en: "Insured and protected free shipping on all tech items.",
    },
    returnPolicy: {
      tr: "Açılmamış ambalajlı ürünlerde 14 gün iade garantisi.",
      en: "14-day return policy for unopened items in original packaging.",
    },
    contactPhone: "0850 987 65 43",
    contactEmail: "destek@techworld.com.tr",
    categories: ["electronics"],
    reviews: [
      {
        id: "sr-3",
        userName: "Mehmet E.",
        rating: 5,
        date: "19.08.2026",
        comment: "Orijinal faturalı ve kapalı kutu geldi. Ses kalitesi efsane.",
        productName: "Kablosuz Gürültü Engelleyici Kulak Üstü Bluetooth Kulaklık",
      },
    ],
  },
  {
    id: "seller-3",
    slug: "evim-yasam-concept",
    name: "Evim & Yaşam Concept",
    logo: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=300&q=80",
    banner: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1200&q=80",
    description: {
      tr: "Mutfak gereçleri, çeyiz tencere setleri ve küçük ev aletleri mağazası.",
      en: "Premium kitchenware, cookware sets, and smart home appliances.",
    },
    rating: 4.7,
    reviewCount: 1640,
    verified: true,
    location: "İzmir, Türkiye",
    responseRate: "%96 (1 saat içinde)",
    followers: 19400,
    productCount: 64,
    joinedDate: "Haziran 2024",
    shippingPolicy: {
      tr: "Kırılmaya karşı dayanıklı köpüklü korumalı paketleme.",
      en: "Heavy-duty shockproof foam packaging against breakage.",
    },
    returnPolicy: {
      tr: "Hasarlı teslimatlarda anında ücretsiz değişim garantisi.",
      en: "Instant free replacement guarantee for damaged deliveries.",
    },
    contactPhone: "0850 444 33 22",
    contactEmail: "bilgi@evimyasam.com",
    categories: ["home-living"],
    reviews: [],
  },
];

export function getSellerBySlug(slug: string): SellerProfile | undefined {
  return MOCK_SELLERS.find((s) => s.slug === slug) || MOCK_SELLERS[0];
}
