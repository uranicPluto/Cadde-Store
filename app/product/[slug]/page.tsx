"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { getFullCatalog, DetailedProductMock } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { useRecentlyViewed } from "@/lib/recently-viewed/recently-viewed-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoreCard } from "@/components/marketplace/store-card";
import { ProductCard } from "@/components/marketplace/product-card";
import { Toast } from "@/components/ui/toast";
import { Tabs } from "@/components/ui/tabs";
import { ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, Check, Share2, Sparkles } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();

  const catalog = getFullCatalog(language);
  const product = catalog.find((p) => p.slug === slug) || catalog[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(product.attributes?.color?.[0] || "");
  const [selectedSize, setSelectedSize] = useState<string>(product.attributes?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
      if (product.attributes?.color?.[0]) setSelectedColor(product.attributes.color[0]);
      if (product.attributes?.sizes?.[0]) setSelectedSize(product.attributes.sizes[0]);
    }
  }, [slug]);

  const favActive = isFavorite(product.id);
  const gallery = product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : [product.imageUrl];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setToastMsg(t("header.cartSummary", { count: 1 }) + `: ${product.name}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    router.push("/cart");
  };

  const relatedProducts = catalog.filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug).slice(0, 6);
  const fallbackRelated = relatedProducts.length > 0 ? relatedProducts : catalog.filter((p) => p.id !== product.id).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      {/* Toast Feedback Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast type="success" title={t("header.cartSummary", { count: 1 })} message={toastMsg} onClose={() => setToastMsg(null)} />
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-8 flex-1">
        {/* Breadcrumb Trail */}
        <Breadcrumb
          items={[
            { label: product.categoryName, href: `/category/${product.categorySlug}` },
            { label: product.brand, href: `#` },
            { label: product.name },
          ]}
        />

        {/* Product Core Details Container */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative w-full aspect-3/4 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src={gallery[selectedImageIndex] || product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.badges?.bestseller && <Badge variant="bestseller">{t("badges.bestseller")}</Badge>}
                {product.badges?.fastDelivery && <Badge variant="fast-delivery">{t("badges.fastDelivery")}</Badge>}
                {product.badges?.freeShipping && <Badge variant="free-shipping">{t("badges.freeShipping")}</Badge>}
              </div>
            </div>

            {/* Thumbnail Gallery Row */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx ? "border-primary shadow-xs" : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center Column: Product Configuration & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-primary uppercase tracking-widest">{product.brand}</span>
                <span className="text-xs text-text-subtle bg-slate-100 px-2.5 py-1 rounded-full font-semibold">{product.storeName}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main leading-snug">{product.name}</h1>

              <div className="flex items-center gap-4">
                <Rating rating={product.rating} reviewCount={product.reviewCount} size="md" />
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {t("storeCard.verifiedSeller")}
                </span>
              </div>

              {/* Price Block */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <Price price={product.price} originalPrice={product.originalPrice} size="xl" installmentText="3 Taksit x 1.533 TL" />
              </div>

              {/* Variants: Color */}
              {product.attributes?.color && product.attributes.color.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("filters.size")} / Color:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.attributes.color.map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold transition-all ${
                          selectedColor === col ? "bg-slate-900 text-white border-slate-900 shadow-xs" : "bg-white text-text-main border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants: Size */}
              {product.attributes?.sizes && product.attributes.sizes.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("filters.size")}:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.attributes.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`text-xs px-4 py-2 rounded-lg border font-black transition-all ${
                          selectedSize === sz ? "bg-primary text-white border-primary shadow-xs" : "bg-white text-text-main border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Adet / Qty:</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-text-main">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <Button
                  variant="add-to-cart"
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1 font-extrabold shadow-md py-3"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  <span>{t("productCard.addToCart")}</span>
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBuyNow}
                  className="flex-1 font-extrabold bg-slate-900 hover:bg-slate-800 shadow-md py-3"
                >
                  <span>Hemen Satın Al</span>
                </Button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(product.id)}
                  className={`p-3.5 rounded-lg border transition-colors ${
                    favActive ? "bg-rose-50 border-rose-300 text-rose-500" : "bg-white border-slate-200 text-slate-400 hover:text-rose-500"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${favActive ? "fill-rose-500" : ""}`} />
                </button>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-text-muted">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hızlı Kargo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Orijinal Ürün</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>14 Gün İade</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs (Description & Specs & Reviews) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-6">
          <Tabs
            items={[
              { id: "description", label: "Ürün Açıklaması" },
              { id: "specifications", label: "Teknik Özellikler" },
              { id: "reviews", label: `Değerlendirmeler (${product.reviews.length})` },
            ]}
            activeId={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "description" && (
            <div className="text-sm text-slate-700 leading-relaxed max-w-3xl">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="max-w-md border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-50/50">
                  <span className="font-semibold text-text-muted">{key}</span>
                  <span className="font-bold text-text-main">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="flex flex-col gap-4 max-w-2xl">
              {product.reviews.length === 0 ? (
                <p className="text-xs text-text-muted">Henüz değerlendirme yapılmamış.</p>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-text-main">{rev.userName}</span>
                      <span className="text-[10px] text-text-subtle">{rev.date}</span>
                    </div>
                    <Rating rating={rev.rating} size="sm" />
                    <p className="text-xs text-slate-700 mt-1">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Related Products Carousel Grid */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-text-main tracking-tight">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {fallbackRelated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 1 && (
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
            <h2 className="text-xl font-bold text-text-main tracking-tight">Son İncelediğiniz Ürünler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
