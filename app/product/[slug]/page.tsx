"use client";

import React, { useState, useEffect } from "react";
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
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/marketplace/product-card";
import { Toast } from "@/components/ui/toast";
import { Tabs } from "@/components/ui/tabs";
import { ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, MapPin, Tag, CheckCircle } from "lucide-react";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isCollected, setIsCollected] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (slug) {
      fetchDbProductBySlug(slug, language).then((prod) => {
        if (prod) {
          setProduct(prod);
          addRecentlyViewed(prod);
          if (prod.attributes?.color?.[0]) setSelectedColor(prod.attributes.color[0]);
          if (prod.attributes?.sizes?.[0]) setSelectedSize(prod.attributes.sizes[0]);
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
          <div className="text-center font-bold text-slate-500">{isEn ? "Loading product..." : "Ürün bilgileri yükleniyor..."}</div>
        </main>
        <Footer />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      {/* Trendyol-Style Sticky Top Bar on Scroll */}
      {showStickyBar && (
        <div className="fixed top-0 inset-x-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-md z-40 animate-in fade-in slide-in-from-top-2 duration-200 py-2.5 px-4 sm:px-8">
          <div className="max-w-wide mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img src={product.imageUrl} alt="" className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-primary uppercase">{product.brand}</span>
                <span className="text-xs font-bold text-slate-900 truncate">{product.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-rose-600">{formatCurrency(product.price, currency)}</span>
                {product.originalPrice && (
                  <span className="text-[10px] text-slate-400 line-through font-semibold">{formatCurrency(product.originalPrice, currency)}</span>
                )}
              </div>

              {product.attributes?.sizes && product.attributes.sizes.length > 0 && (
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="hidden md:block bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                >
                  {product.attributes.sizes.map((sz) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleBuyNow}
                className="hidden sm:inline-flex font-bold text-xs border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
              >
                {isEn ? "Buy Now" : "Hemen Al"}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                className="font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                <span>{t("productCard.addToCart")}</span>
              </Button>

              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`p-2 rounded-lg border ${favActive ? "bg-rose-50 border-rose-300 text-rose-500" : "bg-white border-slate-200 text-slate-400"}`}
              >
                <Heart className={`w-4 h-4 ${favActive ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative w-full aspect-3/4 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
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
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx ? "border-primary shadow-xs" : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center/Right Column: Product Details & Trendyol Banner Widgets */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-primary uppercase tracking-wider">{product.brand}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-bold">{product.storeName}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{product.name}</h1>

              <div className="flex items-center gap-4">
                <Rating rating={product.rating} reviewCount={product.reviewCount} size="md" />
                <span className="text-slate-300">|</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {t("storeCard.verifiedSeller")}
                </span>
              </div>

              {/* Price Block */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <Price price={product.price} originalPrice={product.originalPrice} size="xl" installmentText="Peşin Fiyatına 3 Taksit Fırsatı" />
              </div>

              {/* Fast Delivery & Address Delivery Date Box */}
              <div className="flex flex-col gap-2 p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-slate-800">
                <div className="flex items-center gap-2 font-extrabold text-amber-900">
                  <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isEn ? "Fast delivery: Ships in 1-2 business day(s)" : "Hızlı teslimat: 24 saat içinde kargoda!"}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{isEn ? "Estimated delivery to your address:" : "Tahmini Teslimat Adresi:"}</span>
                  </span>
                  <span className="text-primary font-bold hover:underline cursor-pointer">
                    {isEn ? "Select Location >" : "Konum Seç >"}
                  </span>
                </div>
              </div>

              {/* Collectable Coupon Ticket Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white font-black text-sm flex flex-col items-center justify-center shadow-xs">
                    <span>300</span>
                    <span className="text-[9px]">TL</span>
                  </div>
                  <div className="flex flex-col text-xs">
                    <span className="font-black text-slate-900">{isEn ? "Special Checkout Coupon" : "Sepette 300 TL İndirim Kuponu"}</span>
                    <span className="text-slate-500 font-medium">{isEn ? "Min. subtotal 1,250 TL • Expires 31.08.2026" : "Min. sepet 1.250 TL • Bitiş: 31.08.2026"}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCollected(!isCollected)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs ${
                    isCollected ? "bg-emerald-600 text-white" : "bg-primary hover:bg-primary/90 text-white"
                  }`}
                >
                  {isCollected ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{isEn ? "Collected" : "Toplandı"}</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-4 h-4" />
                      <span>{isEn ? "Collect" : "Kuponu Al"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Highlighted Feature Specs Grid */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider">{isEn ? "Highlighted Features:" : "Öne Çıkan Özellikler:"}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold">{isEn ? "Fit:" : "Kalıp:"}</span>
                    <span className="font-bold text-slate-900">Slim fit / Regular</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold">{isEn ? "Material:" : "Kumaş:"}</span>
                    <span className="font-bold text-slate-900">%100 Pamuk Dokuma</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold">{isEn ? "Pattern:" : "Desen:"}</span>
                    <span className="font-bold text-slate-900">Düz Sade / Trendy</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold">{isEn ? "Warranty:" : "Garanti:"}</span>
                    <span className="font-bold text-slate-900">2 Yıl Orijinal</span>
                  </div>
                </div>
              </div>

              {/* Variants: Color */}
              {product.attributes?.color && product.attributes.color.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("filters.size")} / Color:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.attributes.color.map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold transition-all ${
                          selectedColor === col ? "bg-slate-900 text-white border-slate-900 shadow-xs" : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("filters.size")}:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.attributes.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`text-xs px-4 py-2 rounded-lg border font-black transition-all ${
                          selectedSize === sz ? "bg-primary text-white border-primary shadow-xs" : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
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
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Adet / Qty:</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-semibold text-slate-500">(Stok: {product.stock} adet)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <Button
                  variant="add-to-cart"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 font-black shadow-md py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  <span>{product.stock > 0 ? t("productCard.addToCart") : "Stok Tükendi"}</span>
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex-1 font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md py-3.5 rounded-xl"
                >
                  <span>{isEn ? "Buy Now" : "Hemen Satın Al"}</span>
                </Button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(product.id)}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    favActive ? "bg-rose-50 border-rose-300 text-rose-500" : "bg-white border-slate-200 text-slate-400 hover:text-rose-500"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${favActive ? "fill-rose-500" : ""}`} />
                </button>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600">
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
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
                  <span className="font-semibold text-slate-500">{key}</span>
                  <span className="font-bold text-slate-900">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="flex flex-col gap-4 max-w-2xl">
              {product.reviews.length === 0 ? (
                <p className="text-xs text-slate-500">Henüz değerlendirme yapılmamış.</p>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <Rating rating={rev.rating} size="sm" />
                    <p className="text-xs text-slate-700 mt-1">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Related Products Grid */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{isEn ? "Similar Items" : "Benzer Ürünler"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
