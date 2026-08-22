"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { ProductForm } from "@/components/seller/product-form";
import { DetailedProductMock } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { Footer } from "@/components/layout/footer";
import { PlusCircle } from "lucide-react";

const SELLER_PRODUCTS_KEY = "cadde-store-seller-products";

export default function AddSellerProductPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleCreateProduct = (newProduct: DetailedProductMock) => {
    try {
      const saved = localStorage.getItem(SELLER_PRODUCTS_KEY);
      const existing: DetailedProductMock[] = saved ? JSON.parse(saved) : [];
      const updated = [newProduct, ...existing];
      localStorage.setItem(SELLER_PRODUCTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save new product", e);
    }
    router.push("/seller/dashboard/products");
  };

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
                <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main">{t("seller.productForm.addTitle")}</h1>
                  <span className="text-xs text-text-muted">
                    {t("seller.productForm.addSubtitle")}
                  </span>
                </div>
              </div>
            </div>

            <ProductForm onSubmit={handleCreateProduct} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
