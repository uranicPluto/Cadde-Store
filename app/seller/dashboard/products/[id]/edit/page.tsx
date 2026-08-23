"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { ProductForm } from "@/components/seller/product-form";
import { getFullCatalog, DetailedProductMock, mapDbProductToMock } from "@/lib/catalog/product-repository";
import { useLanguage } from "@/lib/i18n/language-context";
import { Footer } from "@/components/layout/footer";
import { Edit2 } from "lucide-react";

export default function EditSellerProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { language, t } = useLanguage();
  const [product, setProduct] = useState<DetailedProductMock | null>(null);
  const [categories, setCategories] = useState<{ id: string; slug: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.categories) setCategories(catData.categories);
        }

        const prodRes = await fetch(`/api/products/${id}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.product) {
            setProduct(mapDbProductToMock(prodData.product, language));
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load product from API, using catalog fallback", e);
      }

      const catalog = getFullCatalog(language);
      const found = catalog.find((p) => p.id === id) || catalog[0];
      if (found) setProduct(found);
    }

    if (id) {
      loadData();
    }
  }, [id, language]);

  const handleUpdateProduct = async (updated: DetailedProductMock) => {
    setErrorMessage(null);
    try {
      const matchedCat = categories.find((c) => c.slug === updated.categorySlug);
      const categoryId = matchedCat?.id;

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: updated.name,
          brand: updated.brand,
          description: updated.description,
          ...(categoryId ? { categoryId } : {}),
          price: updated.price,
          originalPrice: updated.originalPrice,
          stock: updated.stock,
          imageUrl: updated.imageUrl,
          images: updated.galleryImages || [updated.imageUrl],
          colors: updated.attributes?.color || [],
          sizes: updated.attributes?.sizes || [],
        }),
      });

      if (res.ok) {
        router.push("/seller/dashboard/products");
        return;
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "Ürün güncellenirken bir hata oluştu.");
      }
    } catch (e) {
      console.error("Failed to update product", e);
      setErrorMessage("Bağlantı hatası oluştu.");
    }
  };

  if (!product) return null;

  const titleText = t("seller.productForm.editTitle").replace("{name}", product.name);

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
                  <h1 className="text-xl font-black text-text-main">{titleText}</h1>
                  <span className="text-xs text-text-muted">
                    {t("seller.productForm.editSubtitle")}
                  </span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs font-bold text-rose-700">
                {errorMessage}
              </div>
            )}

            <ProductForm initialProduct={product} onSubmit={handleUpdateProduct} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
