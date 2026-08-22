"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getFullCatalog, DetailedProductMock } from "@/lib/catalog/product-repository";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Package, ArrowLeft, Check, X, Tag } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ADMIN_PRODUCTS_KEY = "cadde-store-admin-products";

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { language, currency, t } = useLanguage();
  const [product, setProduct] = useState<DetailedProductMock | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const catalog = getFullCatalog(language);
    const found = catalog.find((p) => p.id === id) || catalog[0];
    if (found) setProduct(found);
  }, [id, language]);

  if (!product) return null;

  const titleText = t("admin.products.detailTitle").replace("{name}", product.name);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/admin/products" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main">{titleText}</h1>
                  <span className="text-xs text-text-muted">{t("admin.products.detailSubtitle")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(true)} className="border-rose-300 text-rose-700 bg-rose-50 font-bold">
                  <X className="w-4 h-4 mr-1" />
                  <span>{t("admin.products.btnReject")}</span>
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push("/admin/products")} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                  <Check className="w-4 h-4 mr-1" />
                  <span>{t("admin.products.btnApprove")}</span>
                </Button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row gap-6">
              <img src={product.imageUrl} alt="" className="w-40 h-48 object-cover rounded-xl border border-slate-200 shrink-0" />
              <div className="flex flex-col gap-2 text-xs flex-1">
                <span className="font-extrabold text-indigo-600 uppercase tracking-widest">{product.brand}</span>
                <h2 className="text-lg font-black text-text-main">{product.name}</h2>
                <div className="flex items-center gap-4 text-text-muted font-semibold">
                  <span>Kategori: <strong>{product.categoryName}</strong></span>
                  <span>•</span>
                  <span>Satıcı: <strong>{product.storeName || "Cadde Store"}</strong></span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xl font-black text-text-main">{formatCurrency(product.price, currency)}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-text-subtle line-through">{formatCurrency(product.originalPrice, currency)}</span>
                  )}
                </div>
                <p className="text-slate-700 font-medium leading-relaxed pt-2 border-t border-slate-100">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title={t("admin.products.rejectModalTitle")}>
        <div className="flex flex-col gap-4 text-xs p-1">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t("admin.products.rejectReasonPlaceholder")}
            className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-rose-500 min-h-[90px]"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
              {t("admin.products.cancel")}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsRejectModalOpen(false)} className="bg-rose-600 hover:bg-rose-700 font-bold">
              {t("admin.products.confirmReject")}
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
