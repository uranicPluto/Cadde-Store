"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { getFullCatalog } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/marketplace/product-card";
import { EmptyState } from "@/components/marketplace/empty-state";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, favoriteCount } = useFavorites();
  const { language, t } = useLanguage();

  const fullCatalog = getFullCatalog(language);
  const favoriteProducts = fullCatalog.filter((p) => favorites.includes(p.id));

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

        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 fill-rose-600" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                <span>{t("common.favorites")}</span>
                <span className="text-xs bg-rose-600 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                  {favoriteCount} Ürün
                </span>
              </h1>
              <span className="text-xs text-text-muted">
                Beğendiğiniz ürünleri daha sonra satın almak veya fiyat takibi yapmak için saklayın.
              </span>
            </div>
          </div>
        </div>

        {/* Favorites Grid or Empty State */}
        {favoriteProducts.length === 0 ? (
          <EmptyState
            type="no-favorites"
            title={language === "en" ? "You don't have any favorites yet" : "Henüz Favoriniz Yok"}
            description={
              language === "en"
                ? "Explore our latest collection and save items you love!"
                : "Sezonun en çok tercih edilen ürünlerini keşfedin ve sevdiklerinizi favorilerinize ekleyin!"
            }
            actionText={language === "en" ? "Start Shopping" : "Alışverişe Başla"}
            onActionClick={() => router.push("/")}
          />
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
