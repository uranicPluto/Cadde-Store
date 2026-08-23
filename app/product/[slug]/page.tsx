"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { fetchDbProductBySlug, fetchDbProducts, DetailedProductMock } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { useRecentlyViewed } from "@/lib/recently-viewed/recently-viewed-context";
import { formatCurrency } from "@/lib/utils";
import { createSlug } from "@/lib/catalog/slug-utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/marketplace/product-card";
import { Toast } from "@/components/ui/toast";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  MapPin,
  Tag,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Crown,
  Eye,
  Store,
  MessageCircleQuestion,
  Gift,
  CreditCard,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Search,
  Bell,
  Check,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Camera,
  Layers,
  Wind,
  Plus,
  Trash2,
  Edit3,
  Building2,
  Home,
  Briefcase,
  X,
  Lock,
  Wallet,
  Landmark,
  BadgePercent,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Color variant definitions with unique multi-angle image galleries
interface ColorVariant {
  name: string;
  nameTR: string;
  hex: string;
  mainImage: string;
  gallery: string[];
  isHot?: boolean;
}

// User Delivery Address Definition
interface DeliveryAddress {
  id: string;
  title: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  addressLine: string;
  postalCode: string;
  isDefault?: boolean;
}

// Helper to map color names to hex swatches
function getColorHex(colorName: string): string {
  const c = colorName.toLowerCase();
  if (c.includes("siyah") || c.includes("black") || c.includes("kara")) return "#0f172a";
  if (c.includes("beyaz") || c.includes("white") || c.includes("ak")) return "#ffffff";
  if (c.includes("bordo") || c.includes("burgundy") || c.includes("maroon")) return "#881337";
  if (c.includes("krem") || c.includes("cream") || c.includes("ekru") || c.includes("ecru") || c.includes("bej") || c.includes("beige")) return "#d2b48c";
  if (c.includes("lacivert") || c.includes("navy")) return "#1e3a8a";
  if (c.includes("mavi") || c.includes("blue") || c.includes("sky")) return "#3b82f6";
  if (c.includes("gri") || c.includes("grey") || c.includes("gray") || c.includes("antrasit") || c.includes("füme")) return "#64748b";
  if (c.includes("kırmızı") || c.includes("red") || c.includes("al")) return "#dc2626";
  if (c.includes("haki") || c.includes("khaki") || c.includes("olive")) return "#4d7c0f";
  if (c.includes("yeşil") || c.includes("green") || c.includes("zümrüt")) return "#15803d";
  if (c.includes("pembe") || c.includes("pink") || c.includes("gül")) return "#ec4899";
  if (c.includes("sarı") || c.includes("yellow") || c.includes("gold") || c.includes("altın")) return "#d97706";
  if (c.includes("kahve") || c.includes("brown") || c.includes("taba")) return "#78350f";
  if (c.includes("mor") || c.includes("purple") || c.includes("lila") || c.includes("violet")) return "#7e22ce";
  if (c.includes("turuncu") || c.includes("orange")) return "#ea580c";
  if (c.includes("titanyum") || c.includes("titanium") || c.includes("silver") || c.includes("gümüş")) return "#94a3b8";
  return "#475569";
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { language, currency, t } = useLanguage();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRecentlyViewed } = useRecentlyViewed();
  const isEn = language === "en";

  const [product, setProduct] = useState<DetailedProductMock | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<DetailedProductMock[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isFollowingStore, setIsFollowingStore] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  // Gallery & Interactive Lens Zoom State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // Star Rating Hover Breakdown Popover State
  const [showRatingPopover, setShowRatingPopover] = useState(false);

  // Selected Options
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [buyMoreQty, setBuyMoreQty] = useState(1); // 1 = 1 piece, 2 = 2 pieces (%10 discount)

  // Location & Address Management State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([
    {
      id: "addr-1",
      title: "Ev Adresim",
      name: "Ahmet Yılmaz",
      phone: "+90 532 123 45 67",
      city: "İstanbul",
      district: "Kadıköy",
      neighborhood: "Caferağa Mah.",
      addressLine: "Moda Cad. No: 14/3 Daire: 7",
      postalCode: "34710",
      isDefault: true,
    },
    {
      id: "addr-2",
      title: "Ofis Adresim",
      name: "Ahmet Yılmaz",
      phone: "+90 532 123 45 67",
      city: "İstanbul",
      district: "Beşiktaş",
      neighborhood: "Levent Mah.",
      addressLine: "Büyükdere Cad. No: 195 K: 12",
      postalCode: "34394",
      isDefault: false,
    },
    {
      id: "addr-3",
      title: "Ankara Ofis",
      name: "Ahmet Yılmaz",
      phone: "+90 532 123 45 67",
      city: "Ankara",
      district: "Çankaya",
      neighborhood: "Kızılay Mah.",
      addressLine: "Gazi Mustafa Kemal Bulvarı No: 42",
      postalCode: "06420",
      isDefault: false,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState("addr-1");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<DeliveryAddress>({
    id: "",
    title: "Ev Adresi",
    name: "Ahmet Yılmaz",
    phone: "+90 532 123 45 67",
    city: "İstanbul",
    district: "Kadıköy",
    neighborhood: "Caferağa Mah.",
    addressLine: "",
    postalCode: "34710",
  });

  // Payment Options & Installments Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<"garanti" | "yapikredi" | "isbank" | "akbank" | "ziraat">("garanti");

  // Ask Seller Question Modal State
  const [isAskQuestionModalOpen, setIsAskQuestionModalOpen] = useState(false);
  const [sellerQuestionText, setSellerQuestionText] = useState("");
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  // Review Filters
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [selectedHeightFilter, setSelectedHeightFilter] = useState<string | null>(null);
  const [selectedWeightFilter, setSelectedWeightFilter] = useState<string | null>(null);
  const [onlyPhotosFilter, setOnlyPhotosFilter] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    if (slug) {
      fetchDbProductBySlug(slug, language).then((prod) => {
        if (prod) {
          setProduct(prod);
          addRecentlyViewed(prod);
          if (prod.attributes?.sizes && prod.attributes.sizes.length > 0) {
            setSelectedSize(prod.attributes.sizes[0]);
          } else {
            setSelectedSize(isEn ? "Standard" : "Standart");
          }
        }
      });

      fetchDbProducts(language).then((prods) => {
        setRelatedProducts(prods.filter((p) => p.slug !== slug).slice(0, 6));
      });
    }
  }, [slug, language, isEn]);

  // Derived Dynamic Color Variants
  const colorVariants: ColorVariant[] = useMemo(() => {
    if (!product) return [];

    const rawColors = product.attributes?.color || [];
    const gallery = product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : [product.imageUrl];

    if (rawColors.length > 0) {
      return rawColors.map((colName, idx) => ({
        name: colName,
        nameTR: colName,
        hex: getColorHex(colName),
        mainImage: gallery[idx % gallery.length] || product.imageUrl,
        gallery: gallery,
        isHot: idx === 0,
      }));
    }

    return [
      {
        name: isEn ? "Standard" : "Standart",
        nameTR: "Standart",
        hex: "#0f172a",
        mainImage: product.imageUrl,
        gallery: gallery,
        isHot: true,
      },
    ];
  }, [product, isEn]);

  // Derived Dynamic Sizes
  const availableSizes = useMemo(() => {
    if (!product) return [];
    const rawSizes = product.attributes?.sizes || [];
    if (rawSizes.length > 0) {
      return rawSizes.map((sz, idx) => ({
        size: sz,
        inStock: idx !== 1, 
      }));
    }
    return [{ size: isEn ? "Standard" : "Standart", inStock: true }];
  }, [product, isEn]);

  // Dynamic Bank Installments
  const bankInstallmentOptions = useMemo(() => {
    const p = product ? product.price : 450;
    return {
      garanti: {
        bankName: "Garanti BBVA Bonus",
        installments: [
          { count: 1, monthly: p, total: p, note: "Peşin Fiyatına" },
          { count: 3, monthly: Math.round((p / 3) * 100) / 100, total: p, note: "Peşin Fiyatına (0% Faiz)" },
          { count: 6, monthly: Math.round(((p * 1.083) / 6) * 100) / 100, total: Math.round(p * 1.083 * 100) / 100, note: "%8.3 Vade Farkı" },
          { count: 9, monthly: Math.round(((p * 1.142) / 9) * 100) / 100, total: Math.round(p * 1.142 * 100) / 100, note: "%14.2 Vade Farkı" },
          { count: 12, monthly: Math.round(((p * 1.291) / 12) * 100) / 100, total: Math.round(p * 1.291 * 100) / 100, note: "%29.1 Vade Farkı" },
        ],
      },
      yapikredi: {
        bankName: "Yapı Kredi World",
        installments: [
          { count: 1, monthly: p, total: p, note: "Peşin Fiyatına" },
          { count: 3, monthly: Math.round((p / 3) * 100) / 100, total: p, note: "Peşin Fiyatına (0% Faiz)" },
          { count: 6, monthly: Math.round(((p * 1.083) / 6) * 100) / 100, total: Math.round(p * 1.083 * 100) / 100, note: "%8.3 Vade Farkı" },
          { count: 9, monthly: Math.round(((p * 1.142) / 9) * 100) / 100, total: Math.round(p * 1.142 * 100) / 100, note: "%14.2 Vade Farkı" },
          { count: 12, monthly: Math.round(((p * 1.291) / 12) * 100) / 100, total: Math.round(p * 1.291 * 100) / 100, note: "%29.1 Vade Farkı" },
        ],
      },
      isbank: {
        bankName: "İş Bankası Maximum",
        installments: [
          { count: 1, monthly: p, total: p, note: "Peşin Fiyatına" },
          { count: 3, monthly: Math.round((p / 3) * 100) / 100, total: p, note: "Peşin Fiyatına (0% Faiz)" },
          { count: 6, monthly: Math.round(((p * 1.09) / 6) * 100) / 100, total: Math.round(p * 1.09 * 100) / 100, note: "%9 Vade Farkı" },
          { count: 9, monthly: Math.round(((p * 1.15) / 9) * 100) / 100, total: Math.round(p * 1.15 * 100) / 100, note: "%15 Vade Farkı" },
          { count: 12, monthly: Math.round(((p * 1.30) / 12) * 100) / 100, total: Math.round(p * 1.30 * 100) / 100, note: "%30 Vade Farkı" },
        ],
      },
      akbank: {
        bankName: "Akbank Axess",
        installments: [
          { count: 1, monthly: p, total: p, note: "Peşin Fiyatına" },
          { count: 3, monthly: Math.round((p / 3) * 100) / 100, total: p, note: "Peşin Fiyatına (0% Faiz)" },
          { count: 6, monthly: Math.round(((p * 1.083) / 6) * 100) / 100, total: Math.round(p * 1.083 * 100) / 100, note: "%8.3 Vade Farkı" },
          { count: 9, monthly: Math.round(((p * 1.142) / 9) * 100) / 100, total: Math.round(p * 1.142 * 100) / 100, note: "%14.2 Vade Farkı" },
          { count: 12, monthly: Math.round(((p * 1.291) / 12) * 100) / 100, total: Math.round(p * 1.291 * 100) / 100, note: "%29.1 Vade Farkı" },
        ],
      },
      ziraat: {
        bankName: "Ziraat Bankkart",
        installments: [
          { count: 1, monthly: p, total: p, note: "Peşin Fiyatına" },
          { count: 3, monthly: Math.round((p / 3) * 100) / 100, total: p, note: "Peşin Fiyatına (0% Faiz)" },
          { count: 6, monthly: Math.round(((p * 1.065) / 6) * 100) / 100, total: Math.round(p * 1.065 * 100) / 100, note: "%6.5 Vade Farkı" },
          { count: 9, monthly: Math.round(((p * 1.116) / 9) * 100) / 100, total: Math.round(p * 1.116 * 100) / 100, note: "%11.6 Vade Farkı" },
          { count: 12, monthly: Math.round(((p * 1.25) / 12) * 100) / 100, total: Math.round(p * 1.25 * 100) / 100, note: "%25 Vade Farkı" },
        ],
      },
    };
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <MarketplaceHeader />
        <main className="max-w-wide mx-auto w-full px-4 py-16 flex items-center justify-center">
          <div className="text-center font-bold text-slate-500">
            {isEn ? "Loading product..." : "Ürün detayları yükleniyor..."}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeGallery = colorVariants[selectedColorIdx]?.gallery || [product.imageUrl];
  const activeImage = activeGallery[selectedImageIndex] || activeGallery[0] || product.imageUrl;
  const favActive = isFavorite(product.id);
  const activeSelectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const plusPrice = Math.round(product.price * 0.90 * 100) / 100;
  const buyMoreUnitPrice = Math.round(product.price * 0.90 * 100) / 100;
  const buyMoreTotalPrice = Math.round(buyMoreUnitPrice * 2 * 100) / 100;
  const activeColorName = colorVariants[selectedColorIdx]?.nameTR || (isEn ? "Standard" : "Standart");

  // Interactive Lens Zoom Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgContainerRef.current) return;
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    setZoomPos({ x, y, bgX, bgY });
  };

  const handleColorChange = (idx: number) => {
    setSelectedColorIdx(idx);
    setSelectedImageIndex(0);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : activeGallery.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < activeGallery.length - 1 ? prev + 1 : 0));
  };

  const handleAddToCart = () => {
    addToCart(product, buyMoreQty, colorVariants[selectedColorIdx].nameTR, selectedSize);
    setToastMsg(isEn ? `Added to Cart: ${product.name}` : `Sepete Eklendi: ${product.name}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, buyMoreQty, colorVariants[selectedColorIdx].nameTR, selectedSize);
    router.push("/checkout");
  };

  const handleScrollToReviews = () => {
    const el = document.getElementById("reviews-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleVoteReview = (revId: string, type: "up" | "down") => {
    setHelpfulVoted((prev) => ({ ...prev, [revId]: type }));
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("AC100");
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2500);
  };

  const handleAskQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerQuestionText.trim()) return;
    setQuestionSubmitted(true);
    setTimeout(() => {
      setQuestionSubmitted(false);
      setIsAskQuestionModalOpen(false);
      setSellerQuestionText("");
      setToastMsg(isEn ? "Question sent to seller!" : "Sorunuz satıcıya iletildi!");
      setTimeout(() => setToastMsg(null), 3000);
    }, 1200);
  };

  // Address Handlers
  const handleOpenAddAddress = () => {
    setAddressForm({
      id: `addr-${Date.now()}`,
      title: "Yeni Adres",
      name: "Ahmet Yılmaz",
      phone: "+90 532 123 45 67",
      city: "İstanbul",
      district: "Kadıköy",
      neighborhood: "",
      addressLine: "",
      postalCode: "34000",
    });
    setIsEditingAddress(true);
  };

  const handleOpenEditAddress = (addr: DeliveryAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddressForm(addr);
    setIsEditingAddress(true);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      alert("En az 1 teslimat adresi bulunmalıdır.");
      return;
    }
    const filtered = addresses.filter((a) => a.id !== id);
    setAddresses(filtered);
    if (selectedAddressId === id) {
      setSelectedAddressId(filtered[0].id);
    }
  };

  const handleSaveAddressForm = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = addresses.find((a) => a.id === addressForm.id);
    if (exists) {
      setAddresses(addresses.map((a) => (a.id === addressForm.id ? addressForm : a)));
    } else {
      setAddresses([...addresses, addressForm]);
      setSelectedAddressId(addressForm.id);
    }
    setIsEditingAddress(false);
  };

  // Dynamic Specifications List
  const specsList = Object.entries(product.specifications || {});

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast type="success" title="Cadde Store" message={toastMsg} onClose={() => setToastMsg(null)} />
        </div>
      )}

      {/* 1. Top Cadde Plus Strip */}
      <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white py-2 px-4 shadow-sm select-none">
        <div className="max-w-wide mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-amber-400 font-extrabold text-sm">+</span>
            <span className="font-extrabold text-amber-300">{formatCurrency(plusPrice, currency)}</span>
            <span className="text-slate-200">{isEn ? "at checkout with" : "fiyatıyla"}</span>
            <span className="text-[#f27a1a] font-black uppercase tracking-wider">Cadde Plus</span>
          </div>

          <Link
            href="/account"
            className="text-[11px] font-black text-amber-200 hover:text-white bg-white/10 px-3 py-1 rounded-full border border-white/20 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>{isEn ? "Join for 1 TL" : "1 TL'ye Katıl"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-6 flex-1">
        {/* Breadcrumb Trail */}
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: product.categoryName, href: `/category/${product.categorySlug}` },
            { label: product.brand, href: `/search?brand=${encodeURIComponent(product.brand)}` },
            { label: product.name },
          ]}
        />

        {/* 2. Main Product Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 5 COLS: Main Product Gallery with Interactive Lens Zoom */}
          <div className="lg:col-span-5 flex flex-col gap-3 relative">
            {/* Main Interactive Zoom Box Container */}
            <div
              ref={imgContainerRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              className="relative w-full aspect-3/4 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-crosshair select-none"
            >
              {/* Carousel Arrow Buttons */}
              {activeGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:scale-105 transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:scale-105 transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Main Base Image */}
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-200"
              />

              {/* Visual Feature Stamps on Bottom Right */}
              <div className="absolute right-3 bottom-4 z-10 flex flex-col gap-2 pointer-events-none">
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/90 backdrop-blur-xs border border-slate-300 text-center p-1 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[7px] font-black text-slate-900 leading-tight uppercase mt-0.5">
                    %100 Orijinal
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/90 backdrop-blur-xs border border-slate-300 text-center p-1 shadow-xs">
                  <Truck className="w-4 h-4 text-[#f27a1a]" />
                  <span className="text-[7px] font-black text-slate-900 leading-tight uppercase mt-0.5">
                    Hızlı Kargo
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/90 backdrop-blur-xs border border-slate-300 text-center p-1 shadow-xs">
                  <RotateCcw className="w-4 h-4 text-sky-600" />
                  <span className="text-[7px] font-black text-slate-900 leading-tight uppercase mt-0.5">
                    Kolay İade
                  </span>
                </div>
              </div>

              {/* Square Zoom Lens */}
              {isZooming && (
                <div
                  className="absolute border-2 border-slate-900/60 bg-white/20 pointer-events-none rounded-lg"
                  style={{
                    width: "150px",
                    height: "150px",
                    left: `${Math.max(0, Math.min(zoomPos.x - 75, (imgContainerRef.current?.offsetWidth || 300) - 150))}px`,
                    top: `${Math.max(0, Math.min(zoomPos.y - 75, (imgContainerRef.current?.offsetHeight || 400) - 150))}px`,
                  }}
                />
              )}
            </div>

            {/* High-Resolution Magnified Zoom Flyout Panel */}
            {isZooming && (
              <div
                className="hidden lg:block absolute left-[103%] top-0 w-[460px] h-[520px] bg-white border-2 border-slate-300 rounded-2xl shadow-2xl z-40 overflow-hidden pointer-events-none"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundPosition: `${zoomPos.bgX}% ${zoomPos.bgY}%`,
                  backgroundSize: "260%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}

            {/* Thumbnails Underneath Main Image */}
            {activeGallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {activeGallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      "w-14 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer",
                      selectedImageIndex === idx
                        ? "border-[#f27a1a] shadow-xs scale-105"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MIDDLE 4 COLS: Product Info, Pricing, Multi-Quantity, Colors, Sizes */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Category Rank Badge */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 font-semibold">{product.categoryName}</span>
              <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2 py-0.5 rounded-full">
                #1 {isEn ? "Most favorited" : "En Çok Favorilenen"} &gt;
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                <Link
                  href={`/search?brand=${encodeURIComponent(product.brand)}`}
                  className="font-extrabold text-slate-950 hover:text-primary transition-colors mr-1"
                >
                  {product.brand}
                </Link>
                <span>{product.name}</span>
              </h1>

              {/* RATING BLOCK WITH HOVER STAR BREAKDOWN & SMOOTH CLICK SCROLL */}
              <div className="relative inline-block mt-2">
                <div
                  onMouseEnter={() => setShowRatingPopover(true)}
                  onMouseLeave={() => setShowRatingPopover(false)}
                  onClick={handleScrollToReviews}
                  className="flex items-center gap-2 text-xs text-slate-600 flex-wrap cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                >
                  <span className="font-black text-slate-900 text-sm">{product.rating}</span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3.5 h-3.5",
                          i < Math.round(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 fill-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-slate-500 font-bold hover:underline">
                    • {product.reviewCount || 120} {isEn ? "ratings" : "değerlendirme"}
                  </span>
                  <span className="text-slate-400 font-semibold">• 48 Q&amp;A</span>
                </div>

                {/* Star Rating Breakdown Popover on Mouse Hover */}
                {showRatingPopover && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900">{product.rating}</span>
                        <div className="flex flex-col">
                          <div className="flex items-center text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {product.reviewCount || 120} {isEn ? "reviews" : "değerlendirme"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        %96 Tavsiye
                      </span>
                    </div>

                    {/* 5 Star to 1 Star Progress Breakdown Bars */}
                    <div className="flex flex-col gap-1.5 text-[11px] font-bold">
                      {[
                        { stars: 5, pct: 82, count: `${Math.round((product.reviewCount || 120) * 0.82)}` },
                        { stars: 4, pct: 12, count: `${Math.round((product.reviewCount || 120) * 0.12)}` },
                        { stars: 3, pct: 4, count: `${Math.round((product.reviewCount || 120) * 0.04)}` },
                        { stars: 2, pct: 1, count: `${Math.round((product.reviewCount || 120) * 0.01)}` },
                        { stars: 1, pct: 1, count: `${Math.round((product.reviewCount || 120) * 0.01)}` },
                      ].map((item) => (
                        <div key={item.stars} className="flex items-center gap-2">
                          <span className="w-5 text-slate-600 font-extrabold">{item.stars} ★</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.pct}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 w-12 text-right">{item.count}</span>
                        </div>
                      ))}
                    </div>

                    <span className="text-[10px] text-primary font-black text-center pt-1 border-t border-slate-100">
                      {isEn ? "Click to read all reviews ↓" : "Tüm yorumları okumak için tıklayın ↓"}
                    </span>
                  </div>
                )}
              </div>

              {/* Customers Love It & Urgency Badge */}
              <div className="flex flex-col gap-1 mt-1">
                <button
                  type="button"
                  onClick={handleScrollToReviews}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-800 text-left hover:text-primary transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{isEn ? "Customers love it!" : "Müşterilerin favorisi!"}</span>
                  <span className="text-primary hover:underline font-extrabold">
                    {isEn ? "Read reviews >" : "Yorumları oku >"}
                  </span>
                </button>

                <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600">
                  <Eye className="w-3.5 h-3.5 text-orange-500" />
                  <span>
                    {isEn
                      ? "Popular item! 1.5K views in the last 24 hours!"
                      : "Popüler ürün! Son 24 saatte 1.500+ kişi inceledi!"}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Block & Plus Exclusive */}
            <div className="flex flex-col gap-0.5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
              <div className="flex items-center gap-1 text-xs font-extrabold text-rose-600">
                <Crown className="w-3.5 h-3.5" />
                <span>+ Cadde Plus {isEn ? "Exclusive Price" : "Özel Fiyatı"}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-rose-600">{isEn ? "At checkout" : "Sepette"}</span>
                <span className="text-2xl font-black text-rose-600">{formatCurrency(plusPrice, currency)}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-slate-900">
                  {isEn ? "Regular Price:" : "Satış Fiyatı:"} {formatCurrency(product.price, currency)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    {formatCurrency(product.originalPrice, currency)}
                  </span>
                )}
              </div>
            </div>

            {/* "Buy More, Pay Less" Volume Tier */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-black text-slate-900">
                {isEn ? "Buy more, pay less" : "Çok Al, Az Öde Fırsatı"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* 1 Piece */}
                <button
                  type="button"
                  onClick={() => setBuyMoreQty(1)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                    buyMoreQty === 1
                      ? "border-[#f27a1a] bg-orange-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <span className="text-xs font-black text-slate-900">
                    1 x {formatCurrency(product.price, currency)}
                  </span>
                </button>

                {/* 2 Pieces (%10 Discount) */}
                <button
                  type="button"
                  onClick={() => setBuyMoreQty(2)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all cursor-pointer relative",
                    buyMoreQty === 2
                      ? "border-[#f27a1a] bg-orange-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <span className="absolute -top-2 right-2 bg-[#f27a1a] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    %10 {isEn ? "discount" : "indirim"}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900">
                      2 x {formatCurrency(buyMoreUnitPrice, currency)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      = {formatCurrency(buyMoreTotalPrice, currency)}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Color Variations with Swatches */}
            {colorVariants.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    {isEn ? "Color / Model:" : "Renk / Model:"}{" "}
                    <span className="text-slate-600 font-bold">{activeColorName}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {colorVariants.length} {isEn ? "options" : "seçenek"}
                  </span>
                </div>

                {/* Color Swatch Thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {colorVariants.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleColorChange(idx)}
                      className={cn(
                        "w-12 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer relative flex flex-col items-center justify-center p-0.5",
                        selectedColorIdx === idx
                          ? "border-[#f27a1a] shadow-xs scale-105"
                          : "border-slate-200 opacity-80 hover:opacity-100"
                      )}
                    >
                      {col.isHot && (
                        <span className="absolute top-0 inset-x-0 bg-orange-500 text-white text-[7px] font-black uppercase text-center py-0.2">
                          Hot
                        </span>
                      )}
                      <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
                        {col.mainImage ? (
                          <img src={col.mainImage} alt={col.nameTR} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-slate-300" style={{ backgroundColor: col.hex }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size / Option Selector */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  {isEn ? "Option / Size:" : "Beden / Seçenek:"}{" "}
                  <span className="text-slate-600 font-bold">{selectedSize}</span>
                </span>
                <span className="text-[10px] text-primary font-bold hover:underline cursor-pointer">
                  {isEn ? "Size Guide >" : "Beden Tablosu >"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => (
                  <button
                    key={sz.size}
                    type="button"
                    onClick={() => {
                      if (sz.inStock) setSelectedSize(sz.size);
                    }}
                    className={cn(
                      "min-w-10 h-10 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center relative cursor-pointer",
                      sz.inStock
                        ? selectedSize === sz.size
                          ? "border-[#f27a1a] bg-orange-50 text-[#f27a1a] shadow-2xs font-extrabold"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                        : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed overflow-hidden"
                    )}
                  >
                    <span>{sz.size}</span>
                    {!sz.inStock && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-[1.5px] bg-slate-400 rotate-45" />
                        <Bell className="w-2.5 h-2.5 text-slate-400 absolute bottom-1 right-1" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Buy Now & Add to Cart */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 bg-white hover:bg-slate-50 text-[#f27a1a] border-2 border-[#f27a1a] font-black text-xs py-3 rounded-xl transition-colors cursor-pointer shadow-2xs text-center"
              >
                {isEn ? "Buy now" : "Hemen Al"}
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[#f27a1a] hover:bg-[#d9660d] text-white font-black text-xs py-3 rounded-xl transition-colors cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isEn ? "Add to cart" : "Sepete Ekle"}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={cn(
                  "p-3 rounded-xl border transition-colors cursor-pointer shrink-0",
                  favActive
                    ? "bg-rose-50 border-rose-300 text-rose-500"
                    : "bg-white border-slate-200 text-slate-400 hover:text-rose-500"
                )}
                aria-label="Favorite"
              >
                <Heart className={cn("w-5 h-5", favActive && "fill-rose-500")} />
              </button>
            </div>

            {/* CLICKABLE LOCATION & ADDRESS SELECTOR BOX */}
            <div
              onClick={() => setIsLocationModalOpen(true)}
              className="flex flex-col gap-2 p-3.5 bg-slate-50 hover:bg-orange-50/40 border border-slate-200/80 hover:border-orange-300 rounded-2xl text-xs text-slate-800 cursor-pointer transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isEn
                    ? "Estimated shipping: Ships in 1 day(s)"
                    : "Tahmini kargo: 24 saatte kargoda"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 flex-wrap gap-1">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <MapPin className="w-4 h-4 text-[#f27a1a] shrink-0" />
                  <span>{isEn ? "Estimated delivery:" : "Teslimat konumu:"}</span>
                  <span className="font-black text-slate-900">
                    {activeSelectedAddress.city} / {activeSelectedAddress.district} ({activeSelectedAddress.title})
                  </span>
                </div>

                <span className="text-primary font-black text-xs group-hover:underline flex items-center gap-0.5">
                  <span>{isEn ? "Select location" : "Konum Değiştir"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* CLICKABLE PAYMENT OPTIONS & INSTALLMENTS BOX */}
            <div
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center justify-between p-3.5 bg-white hover:bg-indigo-50/40 border border-slate-200/90 hover:border-indigo-300 rounded-2xl cursor-pointer transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-xs">
                  <span className="font-black text-slate-900">
                    {isEn ? "Installments up to 12 months" : "12 Aya Varan Taksit İmkanı"}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {isEn ? "Starting at " : "Aylık "}
                    <strong>{formatCurrency(Math.round(((product.price * 1.291) / 12) * 100) / 100, currency)}</strong>
                    {isEn ? "/month • 0% Interest on 3 installments" : " 'den başlayan taksitlerle • 3 Taksit Peşin Fiyatına"}
                  </span>
                </div>
              </div>

              <span className="text-indigo-600 font-black text-xs group-hover:underline flex items-center gap-0.5 shrink-0">
                <span>{isEn ? "View Options" : "Taksitleri Gör"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Codes & Coupons Ticket Card */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-black text-slate-900">
                {isEn ? "Codes & Coupons" : "Kuponlar & Kampanyalar"}
              </span>
              <div className="relative p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-3">
                <span className="absolute -top-2 right-3 bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                  {isEn ? "Limited availability" : "Sınırlı Kontenjan"}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-xs flex flex-col items-center justify-center">
                    <span>100</span>
                    <span className="text-[8px]">TL</span>
                  </div>
                  <div className="flex flex-col text-xs">
                    <span className="font-black text-slate-900">
                      {isEn ? "Min. limit: 900 TL" : "Alt limit: 900 TL"}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {isEn ? "Expiration: 31.09.2026" : "Son Kullanım: 31.09.2026"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-purple-900 bg-white px-2 py-1 rounded-lg border border-purple-200">
                    AC100
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCoupon}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    {couponCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{couponCopied ? (isEn ? "Copied" : "Kopyalandı") : (isEn ? "Copy" : "Kopyala")}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Highlighted Features Grid */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-slate-900">
                {isEn ? "Highlighted features:" : "Öne Çıkan Özellikler:"}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {specsList.length > 0 ? (
                  specsList.map(([k, v]) => (
                    <div key={k} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold">{k}</span>
                      <span className="font-extrabold text-slate-900 line-clamp-1">{v}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold">{isEn ? "Brand" : "Marka"}</span>
                      <span className="font-extrabold text-slate-900">{product.brand}</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold">{isEn ? "Category" : "Kategori"}</span>
                      <span className="font-extrabold text-slate-900">{product.categoryName}</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold">{isEn ? "Condition" : "Durum"}</span>
                      <span className="font-extrabold text-slate-900">{isEn ? "New / Original" : "Sıfır / Orijinal"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 3 COLS: Campaigns, Seller Card, Questions, Follow */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Available Campaigns Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isEn ? "Available Campaigns" : "Mevcut Kampanyalar"}
              </span>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px] leading-tight">
                      {isEn ? "Free shipping over 200 TL" : "200 TL ve Üzeri Kargo Bedava"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#f27a1a] shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px] leading-tight">
                      {isEn ? "Code: AC100 - 100 TL off" : "AC100 Koduyla 100 TL İndirim"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-rose-900 text-[11px] leading-tight">
                      {isEn ? "+ Cadde Plus Special Discount" : "+ Cadde Plus Özel İndirimi"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* Seller Details Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">{product.storeName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 fill-sky-100" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {isEn ? "Official Verified Seller" : "Resmi Onaylı Mağaza"}
                  </span>
                </div>

                <span className="bg-emerald-600 text-white font-black text-xs px-2 py-0.5 rounded-lg shadow-2xs">
                  {product.rating >= 4.5 ? product.rating : "4.8"}
                </span>
              </div>

              {/* Follow To Earn Button */}
              <button
                type="button"
                onClick={() => setIsFollowingStore(!isFollowingStore)}
                className={cn(
                  "w-full py-2.5 px-3 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs border",
                  isFollowingStore
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                )}
              >
                <Gift className="w-4 h-4 text-[#f27a1a]" />
                <span>
                  {isFollowingStore
                    ? isEn
                      ? "Following (Coupon Unlocked)"
                      : "Takip Ediliyor (Kupon Aktif)"
                    : isEn
                    ? "Follow to earn coupons"
                    : "Takip Et & Kazan"}
                </span>
              </button>

              {/* Ask Seller Question Button */}
              <button
                type="button"
                onClick={() => setIsAskQuestionModalOpen(true)}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-black text-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MessageCircleQuestion className="w-4 h-4 text-slate-500" />
                  <span>{isEn ? "Seller questions (48)" : "Satıcı Soruları (48)"}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Go to Store Button */}
              <Link
                href={`/seller/${createSlug(product.storeName)}`}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-colors text-center shadow-2xs uppercase tracking-wider mt-1"
              >
                {isEn ? "Go to store >" : "Mağazaya Git >"}
              </Link>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        {product.description && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-black text-slate-900">
              {isEn ? "Product Description & Details" : "Ürün Açıklaması ve Detayları"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* 3. Comprehensive Reviews Section */}
        <div id="reviews-section" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 scroll-mt-20">
          {/* Header & Rating Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {isEn ? "Customer Reviews" : "Müşteri Değerlendirmeleri"}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs">
                <span className="text-lg font-black text-slate-900">{product.rating}</span>
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.round(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200 fill-slate-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-slate-500 font-semibold">
                  • {product.reviewCount || 120} {isEn ? "ratings" : "değerlendirme"}
                </span>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-400 hover:text-primary cursor-pointer">
              {isEn ? "Reviews Policy >" : "Değerlendirme Kuralları >"}
            </span>
          </div>

          {/* Customer Reviews Feed List */}
          <div className="flex flex-col divide-y divide-slate-100">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="py-5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3.5 h-3.5",
                              i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-slate-900">{rev.userName}</span>
                      <span className="text-[11px] text-slate-400">• {rev.date}</span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {isEn ? "Purchased from " : "Satıcı: "}
                      <span className="font-bold text-slate-700">{product.storeName}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{rev.comment}</p>

                  <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleVoteReview(rev.id, "up")}
                      className={cn(
                        "flex items-center gap-1.5 hover:text-slate-700 transition-colors cursor-pointer",
                        helpfulVoted[rev.id] === "up" && "text-primary font-black"
                      )}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{rev.helpfulCount + (helpfulVoted[rev.id] === "up" ? 1 : 0)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVoteReview(rev.id, "down")}
                      className={cn(
                        "flex items-center gap-1.5 hover:text-slate-700 transition-colors cursor-pointer",
                        helpfulVoted[rev.id] === "down" && "text-rose-600 font-black"
                      )}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 font-medium flex flex-col items-center gap-2">
                <Star className="w-8 h-8 text-amber-400 fill-amber-400 opacity-60" />
                <p>
                  {isEn
                    ? "Be the first verified customer to review this product!"
                    : "Bu ürünü satın alan ilk müşterilerden olun ve değerlendirmenizi paylaşın!"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Similar Items Section */}
        {relatedProducts.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {isEn ? "Similar items" : "Benzer Ürünler"}
              </h2>
              <Link
                href={`/category/${product.categorySlug}`}
                className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
              >
                <span>{isEn ? "View All" : "Tümünü Gör"}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 5. COMPREHENSIVE DELIVERY LOCATION & ADDRESS MANAGER MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#f27a1a]" />
                <h3 className="text-base font-black text-slate-900">
                  {isEditingAddress ? "Adres Bilgilerini Düzenle" : "Teslimat Adresi ve Konum Seçimi"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setIsEditingAddress(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {isEditingAddress ? (
              /* Add / Edit Address Form */
              <form onSubmit={handleSaveAddressForm} className="flex flex-col gap-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-700">Adres Başlığı</label>
                    <input
                      type="text"
                      required
                      placeholder="Ev, İş, Yazlık vb."
                      value={addressForm.title}
                      onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-700">Ad Soyad</label>
                    <input
                      type="text"
                      required
                      placeholder="Ahmet Yılmaz"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-700">İl (Şehir)</label>
                    <select
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
                    >
                      <option value="İstanbul">İstanbul</option>
                      <option value="Ankara">Ankara</option>
                      <option value="İzmir">İzmir</option>
                      <option value="Bursa">Bursa</option>
                      <option value="Antalya">Antalya</option>
                      <option value="Adana">Adana</option>
                      <option value="Konya">Konya</option>
                      <option value="Gaziantep">Gaziantep</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-extrabold text-slate-700">İlçe</label>
                    <input
                      type="text"
                      required
                      placeholder="Kadıköy, Çankaya vb."
                      value={addressForm.district}
                      onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-700">Mahalle</label>
                  <input
                    type="text"
                    required
                    placeholder="Caferağa Mah."
                    value={addressForm.neighborhood}
                    onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-700">Açık Adres (Cadde, Sokak, No, Daire)</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Moda Cad. No: 14/3 Daire: 7"
                    value={addressForm.addressLine}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Adresi Kaydet
                  </button>
                </div>
              </form>
            ) : (
              /* Address List with Select, Edit, Delete */
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Kayıtlı Adresleriniz ({addresses.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="text-xs font-extrabold text-primary hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Adres Ekle</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setIsLocationModalOpen(false);
                          setToastMsg(`Teslimat konumu güncellendi: ${addr.city} / ${addr.district}`);
                          setTimeout(() => setToastMsg(null), 3000);
                        }}
                        className={cn(
                          "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative",
                          isSelected
                            ? "bg-orange-50/60 border-primary shadow-xs"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-primary">
                              {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                            </span>
                            <span className="text-xs font-black text-slate-900">{addr.title}</span>
                            <span className="text-[10px] text-slate-400 font-bold">• {addr.city} / {addr.district}</span>
                          </div>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditAddress(addr, e)}
                              className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                              title="Düzenle"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(addr.id, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 font-medium pl-6 leading-relaxed">
                          {addr.neighborhood} {addr.addressLine}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-[11px]">
                    Seçtiğiniz adrese göre tahmini teslimat tarihi: <strong>Yarın (24 Ağustos)</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. COMPREHENSIVE PAYMENT METHODS & BANK INSTALLMENTS MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Ödeme Seçenekleri &amp; Taksit Tablosu</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Bank Selector Chips */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Kredi Kartı Bankanızı Seçin:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {Object.entries(bankInstallmentOptions).map(([key, data]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedBank(key as "garanti" | "yapikredi" | "isbank" | "akbank" | "ziraat")}
                    className={cn(
                      "px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0",
                      selectedBank === key
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {data.bankName}
                  </button>
                ))}
              </div>
            </div>

            {/* Installments Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Taksit Sayısı</th>
                    <th className="p-3">Aylık Tutar</th>
                    <th className="p-3">Toplam Tutar</th>
                    <th className="p-3 text-right">Avantaj / Oran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bankInstallmentOptions[selectedBank].installments.map((inst) => (
                    <tr key={inst.count} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-black text-slate-900">
                        {inst.count === 1 ? "Tek Çekim" : `${inst.count} Taksit`}
                      </td>
                      <td className="p-3 font-bold text-slate-800">{inst.monthly.toFixed(2)} TL</td>
                      <td className="p-3 font-black text-[#f27a1a]">{inst.total.toFixed(2)} TL</td>
                      <td className="p-3 text-right">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black",
                            inst.count === 3
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {inst.note}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Alternative Payment Methods Strip */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Diğer Ödeme Seçenekleri:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900">Kapıda Ödeme</span>
                    <span className="text-[10px] text-slate-500">Nakit veya Kredi Kartı ile</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5">
                  <Landmark className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900">Havale / FAST / EFT</span>
                    <span className="text-[10px] text-emerald-600 font-bold">%2 Ek İndirim Avantajı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Guarantee Strip */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-[11px]">
                Tüm ödemeler 256-Bit SSL ve 3D Secure güvencesiyle korunmaktadır.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Ask Seller Question Modal */}
      {isAskQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Ask Seller a Question</h3>
              <button
                type="button"
                onClick={() => setIsAskQuestionModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <img src={activeImage} alt="" className="w-12 h-14 object-cover rounded-lg" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 line-clamp-1">{product.name}</span>
                <span className="text-[10px] text-slate-500">
                  {isEn ? "Seller: " : "Satıcı: "}{product.storeName}
                </span>
              </div>
            </div>

            <form onSubmit={handleAskQuestionSubmit} className="flex flex-col gap-4">
              <textarea
                rows={4}
                required
                placeholder="Ask about size fit, fabric, original warranty, or shipping time..."
                value={sellerQuestionText}
                onChange={(e) => setSellerQuestionText(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-medium"
              />

              <button
                type="submit"
                disabled={questionSubmitted}
                className="w-full bg-[#f27a1a] hover:bg-[#d9660d] text-white font-black text-xs py-3 rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {questionSubmitted ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Transmitting to seller...</span>
                  </>
                ) : (
                  <span>Send Question</span>
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
