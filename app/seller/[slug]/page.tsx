"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { getSellerBySlug } from "@/lib/sellers/seller-repository";
import { getFullCatalog, DetailedProductMock } from "@/lib/catalog/product-repository";
import { sortProducts, SortOption } from "@/lib/catalog/sorting";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/marketplace/product-card";
import { Toast } from "@/components/ui/toast";
import {
  Star,
  ShieldCheck,
  MapPin,
  Users,
  Search,
  ArrowUpDown,
  Gift,
  Info,
  Calendar,
  FileText,
  Clock,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Crown,
  Camera,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  X,
  MessageCircleQuestion,
  Store,
  Tag,
  Check,
  PackageCheck,
  Truck,
  Sparkles,
  Award,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SellerStorefrontPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { language, currency, t } = useLanguage();
  const baseSeller = getSellerBySlug(slug) || {
    id: "seller-1",
    slug: "trend-fashion",
    name: "Altınyıldız Classics",
    rating: 9.1,
    reviewCount: 46973,
    followers: 5600000,
    location: "İzmir",
    verified: true,
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80",
    banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    description: {
      tr: "Altınyıldız Classics, modern erkeğin ve kadının gardırobuna şıklık, konfor ve kalite katan öncü Türk giyim markasıdır.",
      en: "Altınyıldız Classics is a leading Turkish clothing brand delivering elegance, comfort, and premium craftsmanship.",
    },
    shippingPolicy: {
      tr: "Saat 16:00'a kadar verilen tüm siparişler aynı gün kargoya teslim edilir. Ortalama kargoya veriliş süresi 20 saattir.",
      en: "All orders placed before 16:00 are shipped same-day. Average dispatch time is 20 hours.",
    },
    returnPolicy: {
      tr: "14 gün içinde kolay ve ücretsiz iade hakkı.",
      en: "14-day easy and free return policy.",
    },
    reviews: [],
  };

  const isEn = language === "en";
  const [seller, setSeller] = useState(baseSeller);
  const [displayProducts, setDisplayProducts] = useState<DetailedProductMock[]>([]);

  useEffect(() => {
    async function loadStorefront() {
      try {
        const selRes = await fetch(`/api/sellers?slug=${slug}`);
        if (selRes.ok) {
          const selData = await selRes.json();
          if (selData.seller) {
            const s = selData.seller;
            setSeller({
              id: s.id,
              slug: s.slug,
              name: s.storeName,
              rating: s.rating || 9.1,
              reviewCount: s.reviewCount || 46973,
              followers: s.followers || 5600000,
              location: "İzmir",
              verified: s.verified ?? true,
              logo: s.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80",
              banner: s.banner || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
              description: {
                tr: s.description || "Kaliteli ve güvenilir alışveriş.",
                en: s.description || "Quality and trusted shopping.",
              },
              shippingPolicy: {
                tr: s.shippingPolicy || "Saat 16:00'a kadar verilen tüm siparişler aynı gün kargoya teslim edilir.",
                en: s.shippingPolicy || "All orders placed before 16:00 are shipped same-day.",
              },
              returnPolicy: {
                tr: s.returnPolicy || "14 gün içinde kolay ve ücretsiz iade hakkı.",
                en: s.returnPolicy || "14-day easy and free return policy.",
              },
              reviews: [],
            });
          }
        }

        const prodRes = await fetch(`/api/products?seller=${slug}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.products && Array.isArray(prodData.products) && prodData.products.length > 0) {
            const mapped = prodData.products.map((p: any) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              brand: p.brand || seller.name,
              categorySlug: p.category?.slug || "women",
              categoryName: isEn ? p.category?.nameEN || p.category?.nameTR : p.category?.nameTR || "Kadın Giyim",
              storeName: seller.name,
              price: p.price,
              originalPrice: p.originalPrice || undefined,
              rating: p.rating || 4.8,
              reviewCount: p.reviewCount || 50,
              imageUrl: p.imageUrl,
              galleryImages: [p.imageUrl],
              badges: {
                bestseller: p.rating >= 4.8,
                fastDelivery: true,
                freeShipping: p.price >= 200,
              },
              attributes: {
                color: ["Siyah", "Beyaz"],
                sizes: ["S", "M", "L"],
              },
              description: p.description || p.name,
              specifications: {},
              stock: p.stock,
              reviews: [],
            }));
            setDisplayProducts(mapped);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load seller storefront from API", e);
      }

      const fullCatalog = getFullCatalog(language);
      const sellerProducts = fullCatalog.filter(
        (p) =>
          p.storeName?.toLowerCase().includes("altınyıldız") ||
          p.storeName?.toLowerCase().includes("trend") ||
          p.brand === "Zara" ||
          p.brand === "Apple"
      );
      setDisplayProducts(sellerProducts.length > 0 ? sellerProducts : fullCatalog.slice(0, 12));
    }

    loadStorefront();
  }, [slug, language]);

  // Navigation Tabs: "home" | "all_products" | "special_offers"
  const [activeNavTab, setActiveNavTab] = useState<"home" | "all_products" | "special_offers">("home");
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recommended");

  // Seller Profile Modal State (Image 2)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileReviewTab, setProfileReviewTab] = useState<"product" | "seller">("seller");
  const [starFilter, setStarFilter] = useState<number | null>(null);

  // Follow & Coupon State
  const [isFollowing, setIsFollowing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Ask Seller Question Modal
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionSent, setQuestionSent] = useState(false);

  const matched = search.trim()
    ? displayProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : displayProducts;

  const finalProducts = sortProducts(matched, sortOption);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setToastMsg(
      !isFollowing
        ? isEn
          ? "You are now following Altınyıldız Classics! 50 TL coupon unlocked."
          : "Altınyıldız Classics mağazasını takip ettiniz! 50 TL kupon hesabınıza tanımlandı."
        : isEn
        ? "Unfollowed store."
        : "Mağaza takipten çıkarıldı."
    );
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setQuestionSent(true);
    setTimeout(() => {
      setQuestionSent(false);
      setIsAskQuestionOpen(false);
      setQuestionText("");
      setToastMsg(isEn ? "Question transmitted to seller!" : "Sorunuz satıcıya iletildi!");
      setTimeout(() => setToastMsg(null), 3000);
    }, 1200);
  };

  // 1. SELLER SPECIFIC REVIEWS DATA (Focus: Packaging, Delivery Speed, Seller Communication, Authenticity)
  const sellerSpecificReviews = [
    {
      id: "sr-1",
      author: "Ece K.",
      date: "12 Ağustos 2026",
      rating: 5,
      sellerAspects: [
        { label: "🚀 Hızlı Kargo", high: true },
        { label: "🎁 Özenli Paketleme", high: true },
        { label: "💯 Orijinal & Faturalı", high: true },
      ],
      serviceScore: { speed: "5/5", packaging: "5/5", response: "5/5" },
      comment: "Kargo hızı inanılmazdı! Dün saat 15:30'da sipariş verdim, bugün sabah 10:00'da kapıma teslim edildi. Hediye paketi gibi kat kat balonlu korumaya sarılmıştı, faturası kutunun içerisindeydi. Mükemmel bir mağaza!",
      likes: 54,
      verifiedOrder: "Sipariş No: #CS-89211",
      reply: "Değerli müşterimiz, siparişinizin sorunsuz ve hızlı ulaşmasına çok sevindik. Bizi tercih ettiğiniz için teşekkür ederiz!",
      replyDate: "13 Ağustos 2026",
    },
    {
      id: "sr-2",
      author: "Caner T.",
      date: "28 Temmuz 2026",
      rating: 5,
      sellerAspects: [
        { label: "💬 İlgili Satıcı", high: true },
        { label: "🔄 Kolay İade/Değişim", high: true },
      ],
      serviceScore: { speed: "5/5", packaging: "5/5", response: "5/5" },
      comment: "Sipariş öncesi beden tablosuyla ilgili satıcıya soru sormuştum, 10 dakika içinde çok detaylı yardımcı oldular. Kargo 1 günde geldi, kutusu tertemizdi.",
      likes: 29,
      verifiedOrder: "Sipariş No: #CS-78144",
      reply: "Memnuniyetiniz bizim için en büyük önceliktir. Güzel günlerde kullanmanızı dileriz.",
      replyDate: "29 Temmuz 2026",
    },
    {
      id: "sr-3",
      author: "Ahmet V.",
      date: "04 Temmuz 2026",
      rating: 4,
      sellerAspects: [
        { label: "🎁 Sağlam Paketleme", high: true },
        { label: "📦 Eksiksiz Teslimat", high: true },
      ],
      serviceScore: { speed: "4/5", packaging: "5/5", response: "4/5" },
      comment: "Satıcının ürün hazırlama ve paketlemesi kusursuzdu. Kargo şirketi dağıtımı 1 gün geciktirdi fakat satıcı mesaj atıp kargo sürecini bizzat takip etti ve bilgi verdi. İlgileri için teşekkürler.",
      likes: 12,
      verifiedOrder: "Sipariş No: #CS-66420",
    },
  ];

  // 2. PRODUCT SPECIFIC REVIEWS DATA (Focus: Fabric quality, Fit, Body size, Color)
  const productSpecificReviews = [
    {
      id: "pr-1",
      author: "Mehmet S.",
      date: "10 Ağustos 2026",
      rating: 5,
      productName: "Pamuklu Slim Fit Polo Yaka Tişört - Beyaz",
      purchasedSize: "Size: L (Boy: 182 cm • Kilo: 78 kg)",
      productAspects: [
        { label: "Kalıp: Tam Kalıp", high: true },
        { label: "Kumaş: %100 Pamuk", high: true },
      ],
      comment: "Kumaş dokusu çok tok ve kaliteli, terletmiyor. 1.82 boy 78 kiloyum L beden tam oturdu. Yıkamada çekme veya sarkma yapmadı.",
      photos: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80"],
      likes: 41,
    },
    {
      id: "pr-2",
      author: "Zeynep A.",
      date: "01 Ağustos 2026",
      rating: 5,
      productName: "Desenli Şifon Midi Elbise - Bordo",
      purchasedSize: "Size: S (Boy: 165 cm • Kilo: 54 kg)",
      productAspects: [
        { label: "Kalıp: Rahat Kalıp", high: true },
        { label: "Renk: Fotoğraftaki Gibi Canlı", high: true },
      ],
      comment: "Rengi ve duruşu muazzam. Astarı olduğu için iç göstermiyor, şifon kumaşı uçuş uçuş.",
      photos: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80"],
      likes: 23,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast type="success" title="Cadde Store" message={toastMsg} onClose={() => setToastMsg(null)} />
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-4 flex flex-col gap-4 flex-1">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "Stores" : "Mağazalar", href: "/account/stores" },
            { label: seller.name },
          ]}
        />

        {/* 1. SELLER STOREFRONT HERO BANNER (Matches Screenshot 1) */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="h-44 sm:h-56 md:h-64 w-full relative bg-slate-900 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
              alt={seller.name}
              className="w-full h-full object-cover object-center brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

            {/* Banner Header Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
              {/* Seller Logo & Name Pill */}
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 border-2 border-white/80 shadow-xl overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80"
                    alt={seller.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-2xl font-black tracking-tight drop-shadow-md">
                      {seller.name}
                    </h1>
                    <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                    <span className="bg-emerald-500 text-white font-black text-xs px-2 py-0.5 rounded-lg shadow-sm">
                      {seller.rating}
                    </span>
                  </div>

                  {/* "Seller profile > (i)" Clickable Pill (Matches Screenshot 1 & 2) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(true)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>{isEn ? "Seller profile" : "Satıcı Profili"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <Info className="w-3.5 h-3.5 text-white/70" />
                  </div>
                </div>
              </div>

              {/* Right Side: Follow To Earn & Followers Count (Screenshot 1) */}
              <div className="flex flex-col items-start sm:items-end gap-1">
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  className={cn(
                    "px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg",
                    isFollowing
                      ? "bg-emerald-600 text-white"
                      : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  )}
                >
                  <Gift className="w-4 h-4" />
                  <span>{isFollowing ? "Takip Ediliyor" : "Follow To Earn!"}</span>
                </button>
                <span className="text-[11px] text-white/80 font-bold">5.6M followers</span>
              </div>
            </div>
          </div>

          {/* 2. STORE SUB-NAVBAR TABS & STORE SEARCH (Matches Screenshot 1) */}
          <div className="bg-white border-t border-slate-200 p-3 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-6 text-xs font-black">
              <button
                type="button"
                onClick={() => setActiveNavTab("home")}
                className={cn(
                  "py-2 transition-colors relative cursor-pointer",
                  activeNavTab === "home" ? "text-primary font-extrabold" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <span>{isEn ? "Home" : "Ana Sayfa"}</span>
                {activeNavTab === "home" && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveNavTab("all_products")}
                className={cn(
                  "py-2 transition-colors relative cursor-pointer",
                  activeNavTab === "all_products"
                    ? "text-primary font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <span>{isEn ? "All Products" : "Tüm Ürünler"}</span>
                {activeNavTab === "all_products" && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveNavTab("special_offers")}
                className={cn(
                  "py-2 transition-colors relative cursor-pointer",
                  activeNavTab === "special_offers"
                    ? "text-primary font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <span>{isEn ? "Special Offers" : "Özel Fırsatlar"}</span>
                {activeNavTab === "special_offers" && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            </div>

            {/* Right Search in Store Bar */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isEn ? "Search in store" : "Mağazada ara"}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-xs font-semibold outline-none focus:border-primary"
              />
              <button
                type="button"
                className="absolute right-2 top-1.5 w-7 h-7 rounded-lg bg-primary hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. STORE HOME TAB: CAMPAIGNS CAROUSELS & PRODUCT CATALOG */}
        {activeNavTab === "home" && (
          <div className="flex flex-col gap-6">
            {/* Campaigns Section Header */}
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Campaigns</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campaign Box 1: Cadde Plus Exclusive Price */}
                <div className="bg-orange-50/80 border border-orange-200/80 rounded-3xl p-4 flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                      <Crown className="w-4 h-4 text-primary" />
                      <span>Cadde Plus Exclusive Price</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {displayProducts.slice(0, 2).map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        className="bg-white rounded-2xl p-2.5 border border-orange-100 flex items-center gap-2.5 hover:shadow-sm transition-all"
                      >
                        <img src={p.imageUrl} alt="" className="w-14 h-16 object-cover rounded-xl shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black text-slate-800 line-clamp-1">{p.name}</span>
                          <div className="flex items-center text-amber-400 my-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-[9px] text-slate-400 font-bold ml-1">(241)</span>
                          </div>
                          <span className="text-xs font-black text-[#f27a1a]">419.99 TL</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Campaign Box 2: Store Super Coupon Campaign */}
                <div className="bg-orange-50/80 border border-orange-200/80 rounded-3xl p-4 flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                      <Crown className="w-4 h-4 text-primary" />
                      <span>Cadde Plus Exclusive Price</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {displayProducts.slice(2, 4).map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        className="bg-white rounded-2xl p-2.5 border border-orange-100 flex items-center gap-2.5 hover:shadow-sm transition-all"
                      >
                        <img src={p.imageUrl} alt="" className="w-14 h-16 object-cover rounded-xl shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black text-slate-800 line-clamp-1">{p.name}</span>
                          <div className="flex items-center text-amber-400 my-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-[9px] text-slate-400 font-bold ml-1">(171)</span>
                          </div>
                          <span className="text-xs font-black text-[#f27a1a]">419.99 TL</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Store Catalog Grid */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  {isEn ? "Featured Products" : "Öne Çıkan Ürünler"} ({finalProducts.length})
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {finalProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. ALL PRODUCTS TAB */}
        {activeNavTab === "all_products" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {finalProducts.length} {isEn ? "products found" : "ürün listeleniyor"}
              </span>

              <div className="flex items-center gap-2 text-xs font-bold">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                >
                  <option value="recommended">{t("seller.storefront.sortRecommended")}</option>
                  <option value="bestselling">{t("seller.storefront.sortBestselling")}</option>
                  <option value="price_asc">{t("seller.storefront.sortPriceAsc")}</option>
                  <option value="price_desc">{t("seller.storefront.sortPriceDesc")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {finalProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* 5. SPECIAL OFFERS TAB */}
        {activeNavTab === "special_offers" && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-purple-600" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-purple-950">Mağaza Kuponu: 100 TL İndirim</span>
                  <span className="text-[11px] text-purple-800">900 TL ve üzeri siparişlerde geçerli (Kod: AC100)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("AC100");
                  setToastMsg("Kupon kodu kopyalandı!");
                  setTimeout(() => setToastMsg(null), 2500);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                Kodu Kopyala
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {finalProducts.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 6. COMPREHENSIVE SELLER PROFILE MODAL (Matches Screenshot 2 & Differentiates Product vs Seller Reviews) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                  AC
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">{seller.name}</h3>
                    <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-100" />
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      9.1
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">Resmi Yetkili Satıcı Portalı</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* 5 OPERATIONAL TRUST METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Duration on Cadde Store */}
              <div className="p-4 bg-orange-50/50 border border-orange-200/70 rounded-2xl flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-500">Duration on Cadde Store</span>
                  <span className="text-sm font-black text-slate-900">7 Year</span>
                </div>
              </div>

              {/* Location */}
              <div className="p-4 bg-orange-50/50 border border-orange-200/70 rounded-2xl flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-500">Location</span>
                  <span className="text-sm font-black text-slate-900">İzmir</span>
                </div>
              </div>

              {/* Corporate Invoice */}
              <div className="p-4 bg-orange-50/50 border border-orange-200/70 rounded-2xl flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-500">Corporate invoice</span>
                  <span className="text-sm font-black text-slate-900">Available</span>
                </div>
              </div>
            </div>

            {/* Operational Times 2-Card Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Average time to ship */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span>Average time to ship</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <span className="text-sm font-black text-slate-900">20 hrs</span>
              </div>

              {/* Time to answer questions */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span>Time to answer questions</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <span className="text-sm font-black text-slate-900">30-45 mins</span>
              </div>
            </div>

            {/* DISTINCT REVIEWS SUBSYSTEM (Product Reviews vs Seller Reviews) */}
            <div className="flex flex-col gap-4 pt-2 border-t border-slate-100">
              {/* Reviews Sub-tabs */}
              <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setProfileReviewTab("product")}
                  className={cn(
                    "pb-3 transition-colors relative cursor-pointer",
                    profileReviewTab === "product" ? "text-primary" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <span>Product reviews ({productSpecificReviews.length})</span>
                  {profileReviewTab === "product" && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setProfileReviewTab("seller")}
                  className={cn(
                    "pb-3 transition-colors relative cursor-pointer",
                    profileReviewTab === "seller" ? "text-primary" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <span>Seller reviews ({sellerSpecificReviews.length})</span>
                  {profileReviewTab === "seller" && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              </div>

              {/* SELLER REVIEWS VIEW (Evaluates Store Logistics, Packaging, Response Speed) */}
              {profileReviewTab === "seller" && (
                <div className="flex flex-col gap-4">
                  {/* Seller Operational Performance Scorecards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Paketleme Kalitesi</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <PackageCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-black text-slate-900">4.9 / 5.0</span>
                      </div>
                      <span className="text-[9px] text-emerald-700 font-bold mt-0.5">%99 Hasarsız Teslim</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Kargo Hızı</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Truck className="w-4 h-4 text-primary" />
                        <span className="text-sm font-black text-slate-900">4.9 / 5.0</span>
                      </div>
                      <span className="text-[9px] text-primary font-bold mt-0.5">Aynı Gün Gönderim</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Müşteri İletişimi</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-black text-slate-900">4.8 / 5.0</span>
                      </div>
                      <span className="text-[9px] text-indigo-700 font-bold mt-0.5">Ort. 30 Dk Yanıt</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Orijinallik &amp; Fatura</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-black text-slate-900">5.0 / 5.0</span>
                      </div>
                      <span className="text-[9px] text-amber-700 font-bold mt-0.5">%100 E-Fatura Güvencesi</span>
                    </div>
                  </div>

                  {/* Rating Score Summary Line */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-black text-slate-900">4.9</span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-slate-500 font-bold">• 12,480 Satıcı Değerlendirmesi</span>
                    </div>

                    <span className="text-xs font-bold text-slate-400 hover:text-primary cursor-pointer">
                      Satıcı Değerlendirme Politikası &gt;
                    </span>
                  </div>

                  {/* Star Filter Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <span className="text-xs font-bold text-slate-500 shrink-0">Filter by stars:</span>
                    {[
                      { star: null, label: "Tümü" },
                      { star: 5, label: "5 Yıldız (11.840)" },
                      { star: 4, label: "4 Yıldız (510)" },
                      { star: 3, label: "3 Yıldız (90)" },
                      { star: 2, label: "2 Yıldız (25)" },
                      { star: 1, label: "1 Yıldız (15)" },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setStarFilter(item.star)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0",
                          starFilter === item.star
                            ? "bg-[#f27a1a] text-white border-[#f27a1a] shadow-2xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Seller Reviews Feed */}
                  <div className="flex flex-col divide-y divide-slate-100">
                    {sellerSpecificReviews.map((rev) => (
                      <div key={rev.id} className="py-4 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs font-black text-slate-900">{rev.author}</span>
                            <span className="text-[11px] text-slate-400">• {rev.date}</span>
                          </div>

                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            {rev.verifiedOrder}
                          </span>
                        </div>

                        {/* Aspect Pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {rev.sellerAspects.map((asp, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-md"
                            >
                              {asp.label}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{rev.comment}</p>

                        {/* Official Seller Reply */}
                        {rev.reply && (
                          <div className="mt-1 p-3 bg-orange-50/60 border border-orange-200/80 rounded-xl text-xs flex flex-col gap-1">
                            <span className="font-extrabold text-primary flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Yetkili Mağaza Yanıtı ({rev.replyDate})</span>
                            </span>
                            <p className="text-slate-800">{rev.reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCT REVIEWS VIEW (Evaluates Physical Clothes, Sizing, Colors, Fabrics) */}
              {profileReviewTab === "product" && (
                <div className="flex flex-col gap-4">
                  {/* Rating Score Summary Line */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-black text-slate-900">4.7</span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-slate-500 font-bold">• 34,493 Ürün Değerlendirmesi</span>
                    </div>

                    <span className="text-xs font-bold text-slate-400 hover:text-primary cursor-pointer">
                      Ürün Değerlendirme Politikası &gt;
                    </span>
                  </div>

                  {/* Product Reviews Feed */}
                  <div className="flex flex-col divide-y divide-slate-100">
                    {productSpecificReviews.map((rev) => (
                      <div key={rev.id} className="py-4 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs font-black text-slate-900">{rev.author}</span>
                            <span className="text-[11px] text-slate-400">• {rev.date}</span>
                          </div>

                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Doğrulanmış Ürün Yorumu
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-extrabold text-primary">{rev.productName}</span>
                          <span className="text-[11px] font-bold text-slate-500">{rev.purchasedSize}</span>
                        </div>

                        {/* Product Aspect Pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {rev.productAspects.map((asp, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md"
                            >
                              {asp.label}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{rev.comment}</p>

                        {/* Customer Photos */}
                        {rev.photos && (
                          <div className="flex items-center gap-2 mt-1">
                            {rev.photos.map((ph, idx) => (
                              <img
                                key={idx}
                                src={ph}
                                alt=""
                                className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. ASK SELLER QUESTION MODAL */}
      {isAskQuestionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Satıcıya Soru Sor</h3>
              <button
                type="button"
                onClick={() => setIsAskQuestionOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendQuestion} className="flex flex-col gap-4">
              <textarea
                rows={4}
                required
                placeholder="Mağazaya ürünler, kargolama veya garanti hakkında sorunuzu yazın..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-medium"
              />

              <button
                type="submit"
                disabled={questionSent}
                className="w-full bg-[#f27a1a] hover:bg-[#d9660d] text-white font-black text-xs py-3 rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {questionSent ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Sorunuz iletiliyor...</span>
                  </>
                ) : (
                  <span>Soruyu Gönder</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
