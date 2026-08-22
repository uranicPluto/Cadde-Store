"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { Store, Star, Tag, Check, Users, ArrowRight, UserCheck, Bell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowedStore {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  rating: number;
  followers: string;
  verified: boolean;
  couponBadge?: string;
  recentProducts: { id: string; name: string; image: string; price: number }[];
}

export default function FollowedStoresPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [stores, setStores] = useState<FollowedStore[]>([
    {
      id: "st-1",
      name: isEn ? "Trend Fashion Store" : "Trend Fashion Mağazası",
      slug: "trend-fashion",
      logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80",
      rating: 9.8,
      followers: "124.5K",
      verified: true,
      couponBadge: isEn ? "50 TL Followers Coupon Available" : "Takipçilere Özel 50 TL İndirim Kuponu",
      recentProducts: [
        {
          id: "p1",
          name: "Desenli Şifon Elbise",
          image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=200&q=80",
          price: 799.90,
        },
        {
          id: "p2",
          name: "Kemerli Keten Elbise",
          image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=200&q=80",
          price: 899.00,
        },
        {
          id: "p3",
          name: "Kaşe Kısa Ceket",
          image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=200&q=80",
          price: 1499.00,
        },
      ],
    },
    {
      id: "st-2",
      name: isEn ? "TechWorld Turkey" : "TechWorld Türkiye",
      slug: "techworld-turkey",
      logoUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=200&q=80",
      rating: 9.6,
      followers: "89.2K",
      verified: true,
      couponBadge: isEn ? "Free Fast Shipping on all Tech" : "Tüm Teknolojik Ürünlerde Ücretsiz Hızlı Kargo",
      recentProducts: [
        {
          id: "p4",
          name: "iPhone 15 Pro Max",
          image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80",
          price: 74999.00,
        },
        {
          id: "p5",
          name: "AirPods Pro (2. Nesil)",
          image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=200&q=80",
          price: 8499.00,
        },
        {
          id: "p6",
          name: "Sony WH-1000XM5",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
          price: 11999.00,
        },
      ],
    },
    {
      id: "st-3",
      name: isEn ? "Sports Market Turkey" : "Spor Market Türkiye",
      slug: "spor-market-turkiye",
      logoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80",
      rating: 9.7,
      followers: "64.1K",
      verified: true,
      couponBadge: isEn ? "10% Extra Cart Discount" : "Sepette Ekstra %10 İndirim Fırsatı",
      recentProducts: [
        {
          id: "p7",
          name: "Nike Air Cushion",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
          price: 2199.00,
        },
        {
          id: "p8",
          name: "Adidas 3-Stripes Hırka",
          image: "https://images.unsplash.com/photo-1578768079052-aa76e52ffe62?auto=format&fit=crop&w=200&q=80",
          price: 1799.00,
        },
      ],
    },
  ]);

  const handleUnfollow = (storeId: string) => {
    if (window.confirm(isEn ? "Do you want to unfollow this store?" : "Bu mağazayı takipten çıkarmak istiyor musunuz?")) {
      setStores(stores.filter((s) => s.id !== storeId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "Followed Stores" : "Takip Edilen Mağazalar" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                  <Store className="w-4 h-4" />
                  <span>{isEn ? "Merchant Hub" : "Mağaza Takip Portalı"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {isEn ? "Followed Stores" : "Takip Edilen Mağazalar"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? "Get instant notifications on new catalog arrivals and exclusive follower coupons from your favorite sellers."
                    : "Takip ettiğiniz mağazaların yeni gelen ürünlerinden ve özel indirim kuponlarından anında haberdar olun."}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-black text-slate-700 shrink-0">
                {stores.length} {isEn ? "Stores Followed" : "Mağaza Takip Ediliyor"}
              </div>
            </div>

            {/* Stores List */}
            <div className="flex flex-col gap-4">
              {stores.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                  <Store className="w-12 h-12 text-slate-300" />
                  <h3 className="text-base font-bold text-slate-900">
                    {isEn ? "No followed stores" : "Henüz bir mağazayı takip etmiyorsunuz"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {isEn
                      ? "Follow your favorite sellers from product pages to unlock exclusive store vouchers and flash deals."
                      : "Sevdiğiniz satıcıları takip ederek özel mağaza kuponları ve flaş indirimleri yakalayabilirsiniz."}
                  </p>
                </div>
              ) : (
                stores.map((st) => (
                  <div
                    key={st.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-4 hover:border-slate-300 transition-colors"
                  >
                    {/* Store Info Row */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={st.logoUrl}
                          alt={st.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-slate-900">{st.name}</h3>
                            {st.verified && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                Onaylı Satıcı
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{st.rating}</span>
                            </span>
                            <span className="flex items-center gap-1 font-semibold">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{st.followers} Takipçi</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Store Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUnfollow(st.id)}
                          className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEn ? "Following" : "Takip Ediliyor"}</span>
                        </button>

                        <Link
                          href={`/seller/${st.slug}`}
                          className="px-4 py-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{isEn ? "Visit Store" : "Mağazayı Gör"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Store Perk Badge */}
                    {st.couponBadge && (
                      <div className="flex items-center gap-2 text-xs font-black text-primary bg-orange-50 border border-orange-200/70 px-3 py-1.5 rounded-xl w-fit">
                        <Tag className="w-4 h-4 shrink-0" />
                        <span>{st.couponBadge}</span>
                      </div>
                    )}

                    {/* Recent Products Thumbnail Strip */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        {isEn ? "Recent Arrivals" : "En Çok Tercih Edilen Ürünleri"}
                      </span>
                      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                        {st.recentProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2 shrink-0 hover:bg-slate-100 transition-colors"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-12 object-cover rounded-lg"
                            />
                            <div className="flex flex-col">
                              <span className="text-[11px] font-extrabold text-slate-800 line-clamp-1 max-w-[120px]">
                                {p.name}
                              </span>
                              <span className="text-xs font-black text-primary">
                                {p.price} TL
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
