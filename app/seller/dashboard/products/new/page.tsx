"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { ProductForm } from "@/components/seller/product-form";
import { DetailedProductMock } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { Footer } from "@/components/layout/footer";
import { PlusCircle } from "lucide-react";

export default function AddSellerProductPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<{ id: string; slug: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (data.categories) {
            setCategories(data.categories);
          }
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    }
    loadCategories();
  }, []);

  const handleCreateProduct = async (newProduct: DetailedProductMock) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Find matching categoryId or use first available
      const matchedCat = categories.find((c) => c.slug === newProduct.categorySlug) || categories[0];
      const categoryId = matchedCat?.id || "cat-kadin";
      const sku = `SKU-${Date.now().toString().slice(-8)}`;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProduct.name,
          brand: newProduct.brand || "Cadde Store",
          description: newProduct.description,
          categoryId,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice,
          stock: newProduct.stock,
          sku,
          imageUrl: newProduct.imageUrl,
          images: newProduct.galleryImages || [newProduct.imageUrl],
          colors: newProduct.attributes?.color || [],
          sizes: newProduct.attributes?.sizes || [],
        }),
      });

      if (res.ok) {
        router.push("/seller/dashboard/products");
        return;
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "Ürün eklenirken bir hata oluştu.");
      }
    } catch (e) {
      console.error("Failed to save new product", e);
      setErrorMessage("Bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
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

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs font-bold text-rose-700">
                {errorMessage}
              </div>
            )}

            <ProductForm onSubmit={handleCreateProduct} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
