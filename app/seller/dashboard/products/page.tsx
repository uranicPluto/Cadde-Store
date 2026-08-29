"use client";

import React, { useState, useEffect } from "react";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { SellerProductTable } from "@/components/seller/seller-product-table";
import { getFullCatalog, DetailedProductMock, mapDbProductToMock } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { Package, AlertTriangle, RefreshCw } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function SellerProductsPage() {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<DetailedProductMock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // 1. Get seller's own ID from session
      let sellerId: string | null = null;
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        sellerId = meData?.user?.sellerId || null;
      }

      // 2. Fetch scoped products
      const url = sellerId ? `/api/products?sellerId=${encodeURIComponent(sellerId)}` : "/api/products";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          const mapped = data.products.map((p: any) => mapDbProductToMock(p, language));
          setProducts(mapped);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch products from API, using catalog fallback", e);
    }

    const catalog = getFullCatalog(language);
    setProducts(catalog);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [language]);

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return;
      }
    } catch (e) {
      console.error("Failed to delete product from API", e);
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const lowStockCount = products.filter((p) => p.stock < 5).length;
  const countBadgeText = t("seller.products.countBadge").replace("{count}", String(products.length));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <SellerHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <SellerSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Area */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("seller.products.title")}</span>
                    <span className="text-xs bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {t("seller.products.subtitle")}
                  </span>
                </div>
              </div>

              <button
                onClick={fetchProducts}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>{language === "en" ? "Refresh" : "Yenile"}</span>
              </button>
            </div>

            {/* Low Stock Alert Indicator */}
            {lowStockCount > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-1">
                  <div>
                    <span className="font-extrabold">
                      {language === "en" ? "Low Stock Alert!" : "Kritik Stok Uyarısı!"}
                    </span>
                    <span className="ml-1 text-amber-700">
                      {language === "en"
                        ? `${lowStockCount} products have fewer than 5 units in stock.`
                        : `${lowStockCount} ürününüzün stok miktarı 5 adedin altına düştü.`}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md w-fit">
                    {language === "en" ? "Action Required" : "Stok Güncelleyin"}
                  </span>
                </div>
              </div>
            )}

            <SellerProductTable products={products} onDeleteProduct={handleDeleteProduct} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
