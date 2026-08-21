"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { ProductForm } from "@/components/seller/product-form";
import { getFullCatalog, DetailedProductMock } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { Footer } from "@/components/layout/footer";
import { Edit2 } from "lucide-react";

const SELLER_PRODUCTS_KEY = "cadde-store-seller-products";

export default function EditSellerProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { language } = useLanguage();
  const [product, setProduct] = useState<DetailedProductMock | null>(null);

  useEffect(() => {
    const catalog = getFullCatalog(language);
    let custom: DetailedProductMock[] = [];
    try {
      const saved = localStorage.getItem(SELLER_PRODUCTS_KEY);
      if (saved) custom = JSON.parse(saved);
    } catch (e) {}

    const found = [...custom, ...catalog].find((p) => p.id === id) || catalog[0];
    if (found) setProduct(found);
  }, [id, language]);

  const handleUpdateProduct = (updated: DetailedProductMock) => {
    try {
      const saved = localStorage.getItem(SELLER_PRODUCTS_KEY);
      const existing: DetailedProductMock[] = saved ? JSON.parse(saved) : [];
      const index = existing.findIndex((p) => p.id === updated.id);
      let list: DetailedProductMock[];

      if (index > -1) {
        list = existing.map((p) => (p.id === updated.id ? updated : p));
      } else {
        list = [updated, ...existing];
      }
      localStorage.setItem(SELLER_PRODUCTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Failed to update product", e);
    }
    router.push("/seller/dashboard/products");
  };

  if (!product) return null;

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
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main">Ürün Düzenle: {product.name}</h1>
                  <span className="text-xs text-text-muted">
                    Fiyat, stok, görsel veya varyant bilgilerini güncelleyin.
                  </span>
                </div>
              </div>
            </div>

            <ProductForm initialProduct={product} onSubmit={handleUpdateProduct} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
