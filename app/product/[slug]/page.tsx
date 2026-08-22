"use client";

import React, { useState, useEffect, useRef } from "react";
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
  SlidersHorizontal,
  Bell,
  Check,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Camera,
  Layers,
  Wind,
  Flame,
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

  // Selected Options
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [buyMoreQty, setBuyMoreQty] = useState(1); // 1 = 1 piece, 2 = 2 pieces (%10 discount)

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("İstanbul - Kadıköy");
  const [isAskQuestionModalOpen, setIsAskQuestionModalOpen] = useState(false);
  const [sellerQuestionText, setSellerQuestionText] = useState("");
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  // Review Filters
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [selectedHeightFilter, setSelectedHeightFilter] = useState<string | null>(null);
  const [selectedWeightFilter, setSelectedWeightFilter] = useState<string | null>(null);
  const [onlyPhotosFilter, setOnlyPhotosFilter] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, "up" | "down">>({});

  // Dynamic Color Variants with Dedicated Galleries
  const colorVariants: ColorVariant[] = [
    {
      name: "White",
      nameTR: "Beyaz",
      hex: "#ffffff",
      isHot: true,
      mainImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1625910513413-562725e839e1?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Black",
      nameTR: "Siyah",
      hex: "#000000",
      isHot: true,
      mainImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Navy",
      nameTR: "Lacivert",
      hex: "#1e3a8a",
      mainImage: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Grey",
      nameTR: "Gri",
      hex: "#6b7280",
      mainImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Beige",
      nameTR: "Bej / Ekru",
      hex: "#d2b48c",
      mainImage: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      name: "Green",
      nameTR: "Yeşil",
      hex: "#15803d",
      mainImage: "https://images.unsplash.com/photo-1625910513413-562725e839e1?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1625910513413-562725e839e1?auto=format&fit=crop&w=800&q=80",
      ],
    },
  ];

  const availableSizes = [
    { size: "XS", inStock: true },
    { size: "S", inStock: false }, // Out of stock with slash & notification bell
    { size: "M", inStock: true },
    { size: "L", inStock: true },
    { size: "XL", inStock: true },
    { size: "2XL", inStock: false },
    { size: "3XL", inStock: true },
  ];

  const customerPhotos = [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1625910513413-562725e839e1?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=300&q=80",
  ];

  const customerReviewsData = [
    {
      id: "cr-1",
      author: "E*** K.",
      date: "17 Haziran 2026",
      rating: 5,
      size: "Size: M • True to size",
      comment: "Kumaşı çok kaliteli, yumuşacık ve nefes alıyor. Yaka duruşu mükemmel, yıkamada hiç çekme ve kırışma yapmadı. Kesinlikle tavsiye ederim.",
      helpfulCount: 42,
      photos: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80"],
      verified: true,
    },
    {
      id: "cr-2",
      author: "Esraa R.",
      date: "16 Kasım 2025",
      rating: 5,
      size: "Size: L • True to size",
      comment: "Very good quality polo t-shirt! Fits comfortably, delivery was fast within 2 days with nice packaging.",
      helpfulCount: 19,
      photos: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=300&q=80"],
      verified: true,
    },
    {
      id: "cr-3",
      author: "Mohammed M.",
      date: "18 Kasım 2025",
      rating: 5,
      size: "Size: XL",
      comment: "Good quality, durable cotton texture and slim fit styling looks very sharp for both office and casual days.",
      helpfulCount: 11,
      verified: true,
    },
  ];

  useEffect(() => {
    if (slug) {
      fetchDbProductBySlug(slug, language).then((prod) => {
        if (prod) {
          setProduct(prod);
          addRecentlyViewed(prod);
        }
      });

      fetchDbProducts(language).then((prods) => {
        setRelatedProducts(prods.filter((p) => p.slug !== slug).slice(0, 6));
      });
    }
  }, [slug, language]);

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

  // Interactive Lens Zoom Handler (Matches Screenshot 4)
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
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast type="success" title="Cadde Store" message={toastMsg} onClose={() => setToastMsg(null)} />
        </div>
      )}

      {/* 1. Top Cadde Plus Strip (Matches Screenshot 1) */}
      <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white py-2 px-4 shadow-sm select-none">
        <div className="max-w-wide mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-amber-400 font-extrabold text-sm">+</span>
            <span className="font-extrabold text-amber-300">404.99 TL</span>
            <span className="text-slate-200">at checkout with</span>
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
            { label: product.brand, href: `/search?q=${product.brand}` },
            { label: product.name },
          ]}
        />

        {/* 2. Main Product Hero Section (Grid Layout Matching Screenshot 1, 2, 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 5 COLS: Main Product Gallery with Interactive Lens Zoom (Screenshot 4) */}
          <div className="lg:col-span-5 flex flex-col gap-3 relative">
            {/* Main Interactive Zoom Box Container */}
            <div
              ref={imgContainerRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              className="relative w-full aspect-3/4 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-crosshair select-none"
            >
              {/* Left / Right Carousel Arrow Buttons */}
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

              {/* Main Base Image */}
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Visual Feature Stamps on Bottom Right of Main Image (Screenshot 1 & 4) */}
              <div className="absolute right-3 bottom-4 z-10 flex flex-col gap-2 pointer-events-none">
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/80 backdrop-blur-xs border border-slate-300 text-center p-1 shadow-xs">
                  <Layers className="w-4 h-4 text-slate-800" />
                  <span className="text-[7px] font-black text-slate-900 leading-tight uppercase mt-0.5">
                    Kıvrılmaz Yaka
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/80 backdrop-blur-xs border border-slate-300 text-center p-1 shadow-xs">
                  <Wind className="w-4 h-4 text-slate-800" />
                  <span className="text-[7px] font-black text-slate-900 leading-tight uppercase mt-0.5">
                    Nefes Alabilir Çekmez Kumaş
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/80 backdrop-blur-xs border border-slate-300 text-center p-1 shadow-xs">
                  <Sparkles className="w-4 h-4 text-slate-800" />
                  <span className="text-[7px] font-black text-slate-900 leading-tight uppercase mt-0.5">
                    Esnek Hareket
                  </span>
                </div>
              </div>

              {/* Square Zoom Lens (Screenshot 4) */}
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

            {/* High-Resolution Magnified Zoom Flyout Panel (Screenshot 4) */}
            {isZooming && (
              <div
                className="hidden lg:block absolute left-[103%] top-0 w-[450px] h-[520px] bg-white border-2 border-slate-300 rounded-2xl shadow-2xl z-40 overflow-hidden pointer-events-none"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundPosition: `${zoomPos.bgX}% ${zoomPos.bgY}%`,
                  backgroundSize: "250%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}

            {/* Thumbnails Underneath Main Image (Screenshot 1 & 2) */}
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
          </div>

          {/* MIDDLE 4 COLS: Product Info, Pricing, Multi-Quantity, Colors, Sizes (Screenshot 1 & 2) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Category Rank Badge (Screenshot 1) */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 font-semibold">Men Polo T-Shirts category</span>
              <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2 py-0.5 rounded-full">
                #1 Most favorited &gt;
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                <span className="font-extrabold text-slate-950 mr-1">{product.brand}</span>
                <span>{product.name}</span>
              </h1>

              {/* Rating & Social Metrics (Screenshot 1) */}
              <div className="flex items-center gap-2.5 mt-1.5 text-xs text-slate-600 flex-wrap">
                <span className="font-extrabold text-slate-900">{product.rating}</span>
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-400 font-semibold">• 24247 ratings</span>
                <span className="text-slate-400 font-semibold">• 113 Q&amp;A</span>
              </div>

              {/* Customers Love It & Urgency Badge (Screenshot 1) */}
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Customers love it!</span>
                  <a href="#reviews-section" className="text-primary hover:underline font-extrabold">
                    Read reviews &gt;
                  </a>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600">
                  <Eye className="w-3.5 h-3.5 text-orange-500" />
                  <span>Popular item! 1.5K views in the last 24 hours!</span>
                </div>
              </div>
            </div>

            {/* Price Block & Plus Exclusive (Screenshot 1) */}
            <div className="flex flex-col gap-0.5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
              <div className="flex items-center gap-1 text-xs font-extrabold text-rose-600">
                <span>+ Cadde Plus Exclusive</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-rose-600">At checkout</span>
                <span className="text-xl font-black text-rose-600">404.99 TL</span>
              </div>
              <span className="text-xs text-slate-400 line-through font-semibold mt-0.5">
                {formatCurrency(product.price, currency)}
              </span>
            </div>

            {/* "Buy More, Pay Less" Volume Tier (Screenshot 1) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-black text-slate-900">Buy more, pay less</span>
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
                  <span className="text-xs font-black text-slate-900">1 x 449.99 TL</span>
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
                    %10 discount
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900">2 x 404.99 TL</span>
                    <span className="text-[10px] text-slate-500 font-bold">= 809.98 TL</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Color Variations with Swatches (Screenshot 1 & 2) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  Color: <span className="text-slate-600 font-bold">{colorVariants[selectedColorIdx].nameTR}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{colorVariants.length} renk seçeneği</span>
              </div>

              {/* Color Swatch Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {colorVariants.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleColorChange(idx)}
                    className={cn(
                      "w-12 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer relative",
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
                    <img src={col.mainImage} alt={col.nameTR} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector with Out-of-Stock Slashes (Screenshot 1 & 2) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  Size: <span className="text-slate-600 font-bold">{selectedSize}</span>
                </span>
                <span className="text-[10px] text-primary font-bold hover:underline cursor-pointer">Beden Tablosu &gt;</span>
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
                    {/* Diagonal Slash for Out of Stock */}
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

            {/* Action Buttons: Buy Now & Add to Cart (Screenshot 2) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 bg-white hover:bg-slate-50 text-[#f27a1a] border-2 border-[#f27a1a] font-black text-xs py-3 rounded-xl transition-colors cursor-pointer shadow-2xs text-center"
              >
                Buy now
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[#f27a1a] hover:bg-[#d9660d] text-white font-black text-xs py-3 rounded-xl transition-colors cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to cart</span>
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

            {/* Estimated Shipping & Delivery Location Box (Screenshot 2) */}
            <div className="flex flex-col gap-2 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Estimated shipping: Ships in 1 day(s)</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 flex-wrap gap-1">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <MapPin className="w-4 h-4 text-[#f27a1a] shrink-0" />
                  <span>Estimated delivery:</span>
                  <span className="font-bold text-slate-900">{selectedLocation}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-primary font-black text-xs hover:underline cursor-pointer"
                >
                  Select location &gt;
                </button>
              </div>
            </div>

            {/* Payment Options (Screenshot 2) */}
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200/90 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-black text-slate-900">Installments up to 12 months</span>
                <span className="text-slate-500 font-medium">Installments starting at 48.43 TL/month</span>
              </div>
            </div>

            {/* Codes & Coupons Ticket Card (Screenshot 2) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-black text-slate-900">Codes &amp; Coupons</span>
              <div className="relative p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-3">
                <span className="absolute -top-2 right-3 bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                  Limited availability
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-xs flex flex-col items-center justify-center">
                    <span>100</span>
                    <span className="text-[8px]">TL</span>
                  </div>
                  <div className="flex flex-col text-xs">
                    <span className="font-black text-slate-900">Min. limit: 900 TL</span>
                    <span className="text-slate-500 text-[10px]">Expiration date: 31.09.2026</span>
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
                    <span>{couponCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Highlighted Features Grid (Screenshot 2) */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-slate-900">Highlighted features:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Material</span>
                  <span className="font-extrabold text-slate-900">Cotton-Polyester</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Mold</span>
                  <span className="font-extrabold text-slate-900">Slim fit</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Sleeve length</span>
                  <span className="font-extrabold text-slate-900">Short</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Package contents</span>
                  <span className="font-extrabold text-slate-900">Single</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Color</span>
                  <span className="font-extrabold text-slate-900">White</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Pattern</span>
                  <span className="font-extrabold text-slate-900">Plain</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Collar</span>
                  <span className="font-extrabold text-slate-900">Polo neck</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Sleeve type</span>
                  <span className="font-extrabold text-slate-900">Standard sleeve</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 3 COLS: Campaigns, Seller Card, Questions, Follow (Screenshot 1) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Available Campaigns Card (Screenshot 1) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Available Campaigns
              </span>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px] leading-tight">
                      Free shipping over 1500 TL (Seller pays)
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#f27a1a] shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px] leading-tight">
                      Code: AC100 - 100 TL off over 900 TL
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-rose-900 text-[11px] leading-tight">
                      + Cadde Plus Exclusive Price
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* Seller Details Card (Screenshot 1) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">Altınyıldız Classics</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 fill-sky-100" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">5.6M followers</span>
                </div>

                <span className="bg-emerald-600 text-white font-black text-xs px-2 py-0.5 rounded-lg shadow-2xs">
                  9.1
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
                <span>{isFollowingStore ? "Following (Coupon Unlocked)" : "Follow to earn"}</span>
              </button>

              {/* Ask Seller Question Button */}
              <button
                type="button"
                onClick={() => setIsAskQuestionModalOpen(true)}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-black text-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MessageCircleQuestion className="w-4 h-4 text-slate-500" />
                  <span>Seller questions (113)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Go to Store Button */}
              <Link
                href="/seller/trend-fashion"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-colors text-center shadow-2xs uppercase tracking-wider mt-1"
              >
                Go to store &gt;
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Comprehensive Reviews Section with Height/Weight Fit Metric Selector (Screenshot 3) */}
        <div id="reviews-section" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          {/* Header & Rating Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">All reviews</h2>
              <div className="flex items-center gap-3 mt-1 text-xs">
                <span className="text-lg font-black text-slate-900">4.6</span>
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-500 font-semibold">• 24247 ratings 10134 reviews</span>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-400 hover:text-primary cursor-pointer">
              Reviews Policy &gt;
            </span>
          </div>

          {/* Customer Photos Carousel Strip (Screenshot 3) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Reviews with images</span>
              <span className="text-xs font-bold text-primary hover:underline cursor-pointer">All (2109) &gt;</span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {customerPhotos.map((photo, pIdx) => (
                <div
                  key={pIdx}
                  className="w-20 h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Search & Filter Controls (Screenshot 3) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search in product reviews..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setOnlyPhotosFilter(!onlyPhotosFilter)}
                className={cn(
                  "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
                  onlyPhotosFilter
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                )}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Reviews with images (2109)</span>
              </button>
            </div>
          </div>

          {/* Body Fit / Height & Weight Metric Chips (Screenshot 3) */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col gap-3">
            {/* Height Selector */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <span className="text-xs font-black text-slate-700 shrink-0">Height:</span>
              {[
                { label: "<150 cm (81)", val: "150" },
                { label: "151-160 cm (706)", val: "160" },
                { label: "161-170 cm (1419)", val: "170" },
                { label: "171-180 cm (775)", val: "180" },
              ].map((h) => (
                <button
                  key={h.val}
                  type="button"
                  onClick={() => setSelectedHeightFilter(selectedHeightFilter === h.val ? null : h.val)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0",
                    selectedHeightFilter === h.val
                      ? "bg-[#f27a1a] text-white border-[#f27a1a] shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {h.label}
                </button>
              ))}
            </div>

            {/* Weight Selector */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <span className="text-xs font-black text-slate-700 shrink-0">Weight:</span>
              {[
                { label: "<50 kg (264)", val: "50" },
                { label: "51-60 kg (864)", val: "60" },
                { label: "61-70 kg (848)", val: "70" },
                { label: "71-80 kg (636)", val: "80" },
              ].map((w) => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => setSelectedWeightFilter(selectedWeightFilter === w.val ? null : w.val)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0",
                    selectedWeightFilter === w.val
                      ? "bg-[#f27a1a] text-white border-[#f27a1a] shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Reviews Feed List (Screenshot 3) */}
          <div className="flex flex-col divide-y divide-slate-100">
            {customerReviewsData.map((rev) => (
              <div key={rev.id} className="py-5 flex flex-col gap-2.5">
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

                  <span className="text-[11px] text-slate-400">
                    Purchased from <span className="font-bold text-slate-700">Altınyıldız Classics</span>
                  </span>
                </div>

                <span className="text-xs font-bold text-slate-500">{rev.size}</span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">{rev.comment}</p>

                {rev.photos && rev.photos.length > 0 && (
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
            ))}
          </div>
        </div>

        {/* 4. Similar Items Section */}
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
      </main>

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Select Delivery Location</h3>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {[
                "İstanbul - Kadıköy",
                "İstanbul - Beşiktaş",
                "Ankara - Çankaya",
                "İzmir - Karşıyaka",
                "Bursa - Nilüfer",
                "Antalya - Muratpaşa",
              ].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc);
                    setIsLocationModalOpen(false);
                  }}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold text-left transition-colors flex items-center justify-between",
                    selectedLocation === loc
                      ? "bg-orange-50 border-primary text-primary"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  )}
                >
                  <span>{loc}</span>
                  {selectedLocation === loc && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ask Seller Question Modal */}
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
                <span className="text-[10px] text-slate-500">Satıcı: Altınyıldız Classics</span>
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
