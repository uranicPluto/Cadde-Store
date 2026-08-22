"use client";

import React, { useState, useEffect } from "react";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { SellerProductTable } from "@/components/seller/seller-product-table";
import { getFullCatalog, DetailedProductMock } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { Package } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const SELLER_PRODUCTS_KEY = "cadde-store-seller-products";

export default function SellerProductsPage() {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<DetailedProductMock[]>([]);

  useEffect(() => {
    const catalog = getFullCatalog(language);
    let custom: DetailedProductMock[] = [];
    try {
      const saved = localStorage.getItem(SELLER_PRODUCTS_KEY);
      if (saved) custom = JSON.parse(saved);
    } catch (e) {}

    setProducts([...custom, ...catalog]);
  }, [language]);

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    try {
      const customOnly = updated.filter((p) => p.id.startsWith("sp-"));
      localStorage.setItem(SELLER_PRODUCTS_KEY, JSON.stringify(customOnly));
    } catch (e) {}
  };

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
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
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
            </div>

            <SellerProductTable products={products} onDeleteProduct={handleDeleteProduct} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
