"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/utils";
import { History, Trash2, ShoppingBag, ArrowRight, Eye, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  imageUrl: string;
  viewedTime: string;
  group: "today" | "yesterday" | "earlier";
}

export default function BrowsingHistoryPage() {
  const { language, currency } = useLanguage();
  const { addToCart } = useCart();
  const isEn = language === "en";

  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [historyItems, setHistoryItems] = useState<HistoryProduct[]>([
    {
      id: "h-1",
      slug: "apple-iphone-15-pro-max-256gb-dogal-titanyum",
      name: isEn ? "iPhone 15 Pro Max 256GB - Natural Titanium" : "iPhone 15 Pro Max 256GB - Doğal Titanyum",
      brand: "Apple",
      price: 74999.00,
      originalPrice: 79999.00,
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=500&q=80",
      viewedTime: "10 dakika önce",
      group: "today",
    },
    {
      id: "h-2",
      slug: "zara-desenli-sifon-elbise-bordo",
      name: isEn ? "Chiffon Patterned Midi Dress - Burgundy" : "Desenli Şifon Midi Elbise - Bordo",
      brand: "Zara",
      price: 799.90,
      originalPrice: 1199.90,
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80",
      viewedTime: "2 saat önce",
      group: "today",
    },
    {
      id: "h-3",
      slug: "sony-wh-1000xm5-kablosuz-kulaklik",
      name: isEn ? "WH-1000XM5 Wireless ANC Headphones - Black" : "WH-1000XM5 Kablosuz Gürültü Engelleme Kulaklık - Siyah",
      brand: "Sony",
      price: 11999.00,
      originalPrice: 13999.00,
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
      viewedTime: "Dün 16:45",
      group: "yesterday",
    },
    {
      id: "h-4",
      slug: "nike-air-cushion-kosu-ve-yuruyus-spor-ayakkabisi",
      name: isEn ? "Air Cushion Running & Walking Sports Shoes" : "Air Cushion Koşu ve Yürüyüş Spor Ayakkabısı",
      brand: "Nike",
      price: 2199.00,
      originalPrice: 2899.00,
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
      viewedTime: "3 gün önce",
      group: "earlier",
    },
    {
      id: "h-5",
      slug: "magly-building-blocks",
      name: isEn ? "Magnetic Building Blocks - 72 Pieces" : "Manyetik Yapı Blokları Renkli 3D 72 Parça",
      brand: "Magly",
      price: 1784.25,
      originalPrice: 2196.00,
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80",
      viewedTime: "4 gün önce",
      group: "earlier",
    },
  ]);

  const handleClearAll = () => {
    if (window.confirm(isEn ? "Are you sure you want to clear your browsing history?" : "Gezinme geçmişinizi temizlemek istediğinize emin misiniz?")) {
      setHistoryItems([]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setHistoryItems(historyItems.filter((i) => i.id !== id));
  };

  const handleAddToCart = (item: HistoryProduct) => {
    addToCart({
      id: item.id,
      slug: item.slug,
      name: item.name,
      brand: item.brand,
      categorySlug: "general",
      categoryName: item.brand,
      storeName: "Cadde Store",
      price: item.price,
      originalPrice: item.originalPrice,
      rating: item.rating,
      reviewCount: 90,
      imageUrl: item.imageUrl,
      galleryImages: [item.imageUrl],
      badges: { freeShipping: true, fastDelivery: true },
      description: item.name,
      specifications: {},
      stock: 30,
      reviews: [],
    });

    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "Browsing History" : "Gezinme Geçmişim" },
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
                  <History className="w-4 h-4" />
                  <span>{isEn ? "Recently Viewed" : "Son İnceledikleriniz"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {isEn ? "Browsing History" : "Gezinme Geçmişim"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? "Review all items you recently checked out across Cadde Store with 1-click cart addition."
                    : "Cadde Store'da gezinirken incelediğiniz son ürünleri görüntüleyin ve dilediğinizde listenizi yönetin."}
                </p>
              </div>

              {historyItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-2 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isEn ? "Clear Entire History" : "Tüm Geçmişi Temizle"}</span>
                </button>
              )}
            </div>

            {/* History Items List */}
            {historyItems.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                <Eye className="w-12 h-12 text-slate-300" />
                <h3 className="text-base font-bold text-slate-900">
                  {isEn ? "Your browsing history is empty" : "Gezinme geçmişiniz temiz"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  {isEn
                    ? "Products you view will automatically be listed here for quick access."
                    : "İncelediğiniz ürünler daha sonra kolayca bulabilmeniz için burada listelenir."}
                </p>
                <Link
                  href="/"
                  className="mt-2 bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors"
                >
                  {isEn ? "Start Exploring Products" : "Ürünleri Keşfetmeye Başla"}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                  >
                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      title={isEn ? "Remove from history" : "Geçmişten kaldır"}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex flex-col gap-2">
                      <div className="relative w-full h-40 bg-slate-50 rounded-xl overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400">{item.brand}</span>
                        <Link href={`/product/${item.slug}`}>
                          <h3 className="text-xs font-black text-slate-900 line-clamp-2 hover:text-primary transition-colors leading-tight">
                            {item.name}
                          </h3>
                        </Link>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">
                          {item.viewedTime}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-[#f27a1a]">
                          {formatCurrency(item.price, currency)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through font-semibold">
                            {formatCurrency(item.originalPrice, currency)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className={cn(
                          "w-full font-extrabold text-xs py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs",
                          addedItems[item.id]
                            ? "bg-emerald-600 text-white"
                            : "bg-[#f27a1a] hover:bg-[#d9660d] text-white"
                        )}
                      >
                        {addedItems[item.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isEn ? "Added!" : "Eklendi!"}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isEn ? "Add to Cart" : "Sepete Ekle"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
