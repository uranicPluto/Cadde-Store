"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { getFullCatalog } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/marketplace/product-card";
import { Heart, Search, TrendingDown, Crown, Zap, Ticket, Package, Truck, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, favoriteCount } = useFavorites();
  const { language, t } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"favorites" | "collections">("favorites");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fullCatalog = getFullCatalog(language);
  let favoriteProducts = fullCatalog.filter((p) => favorites.includes(p.id));

  if (searchQuery) {
    favoriteProducts = favoriteProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const filterOptions = [
    { id: "price_drop", label: isEn ? "Price drops" : "Fiyatı Düşenler", icon: TrendingDown },
    { id: "plus", label: isEn ? "Cadde Plus" : "Cadde Plus", icon: Crown },
    { id: "flash", label: isEn ? "Flash products" : "Flaş Ürünler", icon: Zap },
    { id: "coupon", label: isEn ? "Coupon deals" : "Kuponlu Ürünler", icon: Ticket },
    { id: "stock", label: isEn ? "In stock" : "Stoktakiler", icon: Package },
    { id: "fast", label: isEn ? "Fast delivery" : "Hızlı Teslimat", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: t("common.allProducts"), href: "/" },
            { label: `${t("common.favorites")} (${favoriteCount})` },
          ]}
        />

        {/* Competitor Screenshot 19 Header: Dual Tabs & Search Input Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("favorites")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-colors ${
                  activeTab === "favorites" ? "bg-primary text-white shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Heart className={`w-4 h-4 ${activeTab === "favorites" ? "fill-white" : ""}`} />
                <span>{isEn ? "Favorites" : "Favorilerim"}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{favoriteCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("collections")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-colors ${
                  activeTab === "collections" ? "bg-primary text-white shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isEn ? "Collections" : "Koleksiyonlarım"}</span>
              </button>
            </div>

            {/* Search Input in Favorites */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isEn ? "Search in Favorites..." : "Favorilerimde Ara..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Filter Pills Row (Competitor Screenshot 19) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {filterOptions.map((opt) => {
              const IconComp = opt.icon;
              const isActive = activeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveFilter(isActive ? null : opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-colors shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorites Grid or Trendyol Empty State (Competitor Screenshot 19) */}
        {favoriteProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs my-4">
            <div className="w-20 h-20 rounded-full bg-orange-100 text-primary flex items-center justify-center shadow-md">
              <Heart className="w-10 h-10 fill-primary text-primary" />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h2 className="text-xl font-black text-slate-900">
                {isEn ? "Hit the heart" : "Kalp simgesine dokunun"}
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {isEn
                  ? "Keep everything you love in one place. Get notified about discounts and stock alerts on your favorite items!"
                  : "Sevdiğiniz tüm ürünleri tek bir yerde toplayın. Fiyat düşüşlerinden ve stok güncellemelerinden anında haberdar olun!"}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/")}
              className="font-black bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl shadow-md mt-2"
            >
              {isEn ? "Continue Shopping" : "Alışverişe Başla"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
