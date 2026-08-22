"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { getSellerBySlug } from "@/lib/sellers/seller-repository";
import { getFullCatalog } from "@/lib/catalog/product-repository";
import { sortProducts, SortOption } from "@/lib/catalog/sorting";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/marketplace/product-card";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { ShieldCheck, MapPin, Users, Search, ArrowUpDown } from "lucide-react";

export default function SellerStorefrontPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { language, t } = useLanguage();
  const seller = getSellerBySlug(slug);

  const fullCatalog = getFullCatalog(language);
  const sellerProducts = fullCatalog.filter((p) => p.storeName === seller?.name || p.brand === "Zara");
  const displayProducts = sellerProducts.length > 0 ? sellerProducts : fullCatalog.slice(0, 6);

  const [activeTab, setActiveTab] = useState("products");
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recommended");

  const matched = search.trim()
    ? displayProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : displayProducts;

  const finalProducts = sortProducts(matched, sortOption);

  if (!seller) return null;

  const tabProductsLabel = t("seller.storefront.tabProducts").replace("{count}", String(displayProducts.length));
  const tabReviewsLabel = t("seller.storefront.tabReviews").replace("{count}", String(seller.reviews.length));
  const tabAboutLabel = t("seller.storefront.tabAbout");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t("common.allProducts"), href: "/" },
            { label: t("seller.header.sellerPortal") },
            { label: seller.name },
          ]}
        />

        {/* Storefront Hero Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          <div className="h-44 sm:h-56 w-full relative bg-slate-900 overflow-hidden">
            <img src={seller.banner} alt="" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>

          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden shrink-0">
                <img src={seller.logo} alt={seller.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-text-main">{seller.name}</h1>
                  {seller.verified && (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {t("seller.storefront.verifiedSeller")}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-muted">
                  <Rating rating={seller.rating} reviewCount={seller.reviewCount} size="sm" />
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <strong>{seller.followers.toLocaleString()}</strong> {t("seller.storefront.followers")}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {seller.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="primary" size="md" className="font-extrabold px-6 shadow-xs">
                {t("seller.storefront.followStore")}
              </Button>
              <Button variant="outline" size="md" className="font-bold">
                {t("seller.storefront.askSeller")}
              </Button>
            </div>
          </div>
        </div>

        {/* Store Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <Tabs
            items={[
              { id: "products", label: tabProductsLabel },
              { id: "reviews", label: tabReviewsLabel },
              { id: "about", label: tabAboutLabel },
            ]}
            activeId={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Products Tab Content */}
        {activeTab === "products" && (
          <div className="flex flex-col gap-4">
            {/* Filter & Sort Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("seller.storefront.searchPlaceholder")}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted ml-auto">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-text-main font-bold outline-none"
                >
                  <option value="recommended">{t("seller.storefront.sortRecommended")}</option>
                  <option value="bestselling">{t("seller.storefront.sortBestselling")}</option>
                  <option value="price_asc">{t("seller.storefront.sortPriceAsc")}</option>
                  <option value="price_desc">{t("seller.storefront.sortPriceDesc")}</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {finalProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === "reviews" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col gap-4 max-w-3xl">
            <h2 className="text-base font-extrabold text-text-main">{t("seller.storefront.reviewsTitle")}</h2>
            {seller.reviews.length === 0 ? (
              <p className="text-xs text-text-muted">{t("seller.storefront.noReviewsYet")}</p>
            ) : (
              seller.reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-text-main">{rev.userName}</span>
                    <span className="text-[10px] text-text-subtle">{rev.date}</span>
                  </div>
                  <Rating rating={rev.rating} size="sm" />
                  <span className="text-[11px] font-bold text-primary">{rev.productName}</span>
                  <p className="text-xs text-slate-700">{rev.comment}</p>

                  {rev.reply && (
                    <div className="mt-2 p-3 bg-primary-light/40 border border-primary/20 rounded-lg text-xs flex flex-col gap-1">
                      <span className="font-extrabold text-primary">
                        {t("seller.storefront.sellerReply").replace("{date}", rev.replyDate || "")}
                      </span>
                      <p className="text-slate-800">{rev.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* About Seller Tab Content */}
        {activeTab === "about" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col gap-6 max-w-3xl">
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-extrabold text-text-main">{t("seller.storefront.aboutTitle")}</h2>
              <p className="text-xs text-slate-700 leading-relaxed">{seller.description[language]}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                <span className="font-bold text-text-muted">{t("seller.storefront.shippingPolicyTitle")}</span>
                <p className="text-slate-700">{seller.shippingPolicy[language]}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
                <span className="font-bold text-text-muted">{t("seller.storefront.returnPolicyTitle")}</span>
                <p className="text-slate-700">{seller.returnPolicy[language]}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
