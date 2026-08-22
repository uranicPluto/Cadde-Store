"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Heart, Star, ShoppingBag, Tag, ChevronRight, ChevronLeft } from "lucide-react";

export const PopularProductsSection: React.FC = () => {
  const { language, currency } = useLanguage();
  const { addToCart } = useCart();
  const isEn = language === "en";
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
  };

  const bestsellers = [
    {
      id: "bs-1",
      slug: "icollagen-tablets",
      brand: "icollagen",
      name: isEn ? "Collagen and Prebiotic Tablets" : "Kolajen ve Prebiyotik Tablet",
      price: 350,
      originalPrice: 420,
      rating: 4.2,
      reviewCount: 56581,
      urgencyTag: isEn ? "🚀 10K+ purchases in the last 3 days!" : "🚀 Son 3 günde 10K+ satıldı!",
      promoTag: isEn ? "Buy 3, pay 2" : "3 Al 2 Öde",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
      freeShipping: true,
      unitPriceInfo: "5.83 TL / tablet",
    },
    {
      id: "bs-2",
      slug: "momordica-coconut-mix",
      brand: "MOMORDİCA",
      name: isEn ? "Coconut Mix - 250 ml" : "Hindistan Cevizi Miksi - 250 ml",
      price: 212.55,
      originalPrice: 217.29,
      rating: 3.7,
      reviewCount: 34247,
      urgencyTag: isEn ? "🚀 10K+ purchases in the last 3 days!" : "🚀 Son 3 günde 10K+ satıldı!",
      promoTag: isEn ? "Lowest price in 10 days" : "Son 10 günün en düşük fiyatı",
      imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
      freeShipping: true,
    },
    {
      id: "bs-3",
      slug: "lumenascent-liora-perfume",
      brand: "LumenaScent",
      name: isEn ? "Liora Women's Perfume Floral Edp 50 ml" : "Liora Kadın Parfüm Floral EDP 50 ml",
      price: 426.55,
      originalPrice: 449,
      rating: 3.8,
      reviewCount: 34600,
      urgencyTag: isEn ? "🚀 10K+ purchases in the last 3 days!" : "🚀 Son 3 günde 10K+ satıldı!",
      promoTag: isEn ? "+ Cadde Plus Exclusive / At checkout 426.55 TL" : "+ Cadde Plus Özel / Sepette 426.55 TL",
      imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
      freeShipping: true,
    },
    {
      id: "bs-4",
      slug: "embeauty-anti-hair-loss",
      brand: "Embeauty",
      name: isEn ? "9-Active Anti Hair Loss Fast Growth & Repairing" : "9 Aktifli Dökülme Karşıtı Onarıcı Saç Serumu",
      price: 398.05,
      originalPrice: 419,
      rating: 4.1,
      reviewCount: 84063,
      urgencyTag: isEn ? "🚀 5K+ purchases in the last 3 days!" : "🚀 Son 3 günde 5K+ satıldı!",
      promoTag: isEn ? "+ Cadde Plus Exclusive / At checkout 398.05 TL" : "+ Cadde Plus Özel / Sepette 398.05 TL",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
      freeShipping: true,
    },
    {
      id: "bs-5",
      slug: "embeauty-mascara",
      brand: "Embeauty",
      name: isEn ? "Ultra Black Volumizing Mascara Volume Effect" : "Yoğun Siyah Hacim Veren Maskara",
      price: 426.55,
      originalPrice: 449,
      rating: 4.2,
      reviewCount: 28598,
      urgencyTag: isEn ? "🚀 5K+ purchases in the last 3 days!" : "🚀 Son 3 günde 5K+ satıldı!",
      promoTag: isEn ? "+ Cadde Plus Exclusive / At checkout 426.55 TL" : "+ Cadde Plus Özel / Sepette 426.55 TL",
      imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
      freeShipping: true,
    },
    {
      id: "bs-6",
      slug: "magly-building-blocks",
      brand: "Magly",
      name: isEn ? "Magnetic Building Blocks - Colorful 3D 72 Pieces" : "Manyetik Yapı Blokları Renkli 3D 72 Parça",
      price: 1784.25,
      originalPrice: 2196,
      rating: 4.7,
      reviewCount: 11169,
      urgencyTag: isEn ? "🚀 5K+ purchases in the last 3 days!" : "🚀 Son 3 günde 5K+ satıldı!",
      promoTag: isEn ? "Lowest price in 10 days" : "Son 10 günün en düşük fiyatı",
      imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
      freeShipping: true,
    },
    {
      id: "bs-7",
      slug: "momordica-karniyarik",
      brand: "MOMORDİCA",
      name: isEn ? "Psyllium Husk Karnıyarık Otu 250ml" : "Karnıyarık Otu Tozu 250ml",
      price: 299,
      originalPrice: 350,
      rating: 4.3,
      reviewCount: 1424,
      urgencyTag: isEn ? "⭐ 57.4K favorites!" : "⭐ 57.4K favorilendi!",
      promoTag: isEn ? "Buy 3, pay 2" : "3 Al 2 Öde",
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
      freeShipping: true,
    },
  ];

  return (
    <section className="w-full bg-slate-100 py-4 select-none">
      <div className="max-w-wide mx-auto px-4 sm:px-6">
        {/* Grey Card Wrap Shell Container */}
        <div className="bg-[#eef0f2] border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-2xs relative">
          {/* Header Title: Bestsellers */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {isEn ? "Bestsellers" : "En Çok Satanlar"}
            </h2>

            {/* Right Carousel Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollLeft}
                className="w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Previous bestsellers"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Next bestsellers"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Scrollable Bestsellers Cards (Longer vertical length) */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
          >
            {bestsellers.map((p) => (
              <div
                key={p.id}
                className="w-52 sm:w-56 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group relative shrink-0"
              >
                {/* Product Image Box - Increased height for longer vertical proportion */}
                <div className="relative w-full h-56 sm:h-64 bg-slate-50 overflow-hidden">
                  {/* Circular 3D BEST SELLING Stamp Badge */}
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex flex-col items-center justify-center text-[8px] sm:text-[9px] font-black leading-none uppercase shadow-md rotate-[-12deg] z-10 absolute top-2.5 left-2.5 border-2 border-white text-center">
                    <span>BEST</span>
                    <span>SELLING</span>
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                    aria-label="Add to favorites"
                  >
                    <Heart className="w-4 h-4" />
                  </button>

                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Dark Bottom Shipping Strip */}
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-700 text-white text-[10px] sm:text-[11px] font-bold text-center py-1.5 shadow-2xs">
                    {p.freeShipping ? (isEn ? "Free shipping" : "Kargo Bedava") : (isEn ? "Fast Delivery" : "Hızlı Teslimat")}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                  <div>
                    {/* Brand & Title */}
                    <Link href={`/product/${p.slug}`}>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 hover:text-primary transition-colors leading-tight">
                        <span className="font-extrabold text-slate-950 mr-1">{p.brand}</span>
                        <span>{p.name}</span>
                      </h3>
                    </Link>

                    {/* Urgency Purchase Metric Tag */}
                    <div className="mt-1.5 text-[10px] sm:text-[11px] font-extrabold text-orange-600 bg-orange-50/90 px-2 py-0.5 rounded w-fit leading-none">
                      {p.urgencyTag}
                    </div>

                    {/* Rating & Review Count */}
                    <div className="flex items-center gap-1 mt-1.5 text-xs">
                      <span className="font-bold text-slate-800">{p.rating}</span>
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">({p.reviewCount})</span>
                    </div>

                    {/* Promo Discount Tag */}
                    {p.promoTag && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-[#f27a1a] leading-tight">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{p.promoTag}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Add to Cart Action */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-[#f27a1a]">
                        {formatCurrency(p.price, currency)}
                      </span>
                      {p.originalPrice && (
                        <span className="text-xs text-slate-400 line-through font-semibold">
                          {formatCurrency(p.originalPrice, currency)}
                        </span>
                      )}
                    </div>

                    {p.unitPriceInfo && (
                      <span className="text-[10px] text-slate-400 font-bold -mt-1">{p.unitPriceInfo}</span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: p.id,
                          slug: p.slug,
                          name: p.name,
                          brand: p.brand,
                          categorySlug: "beauty-care",
                          categoryName: "Bestseller",
                          storeName: "Cadde Verified Store",
                          price: p.price,
                          originalPrice: p.originalPrice,
                          rating: p.rating,
                          reviewCount: p.reviewCount,
                          imageUrl: p.imageUrl,
                          galleryImages: [p.imageUrl],
                          badges: { freeShipping: true, fastDelivery: true, bestseller: true },
                          description: p.name,
                          specifications: {},
                          stock: 100,
                          reviews: [],
                        })
                      }
                      className="w-full bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold text-xs py-2 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isEn ? "Add to Cart" : "Sepete Ekle"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
