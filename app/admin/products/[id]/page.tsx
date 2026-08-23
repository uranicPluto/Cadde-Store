"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Package,
  ArrowLeft,
  Check,
  X,
  Tag,
  Store,
  Layers,
  Star,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Save,
  Flame,
  Truck,
  Sparkles,
  Zap,
  DollarSign,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { language, currency, t } = useLanguage();
  const isEn = language === "en";

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Edit Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    originalPrice: 0,
    stock: 100,
    sku: "",
    brand: "",
    category: "",
    description: "",
    imageUrl: "",
    isBestseller: false,
    isFreeShipping: false,
    isFastDelivery: false,
    isSponsored: false,
  });

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          initProduct(data.product);
          return;
        }
      }

      // Try slug lookup
      const slugRes = await fetch(`/api/products?slug=${id}`);
      if (slugRes.ok) {
        const slugData = await slugRes.json();
        if (slugData.product) {
          initProduct(slugData.product);
        }
      }
    } catch (e) {
      console.error("Failed to load product detail:", e);
    } finally {
      setLoading(false);
    }
  };

  const initProduct = (prod: any) => {
    setProduct(prod);
    setFormData({
      title: prod.title || prod.name || "",
      price: prod.price || 0,
      originalPrice: prod.originalPrice || prod.price || 0,
      stock: prod.stock ?? 100,
      sku: prod.sku || prod.id || "",
      brand: prod.brand || "",
      category: prod.category?.nameTR || prod.category?.nameEN || prod.categorySlug || "Genel",
      description: prod.description || "",
      imageUrl: prod.imageUrl || prod.images?.[0] || "",
      isBestseller: Boolean(prod.isBestseller || prod.badges?.includes("Çok Satan") || prod.badges?.includes("Bestseller")),
      isFreeShipping: Boolean(prod.freeShipping || prod.isFreeShipping || prod.badges?.includes("Kargo Bedava")),
      isFastDelivery: Boolean(prod.fastDelivery || prod.isFastDelivery || prod.badges?.includes("Hızlı Teslimat")),
      isSponsored: Boolean(prod.isSponsored || prod.badges?.includes("Sponsorlu")),
    });
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const handleUpdateStatus = async (newStatus: "ACTIVE" | "REJECTED" | "INACTIVE") => {
    if (!product) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          status: newStatus,
          rejectReason: newStatus === "REJECTED" ? rejectReason : undefined,
        }),
      });

      if (!res.ok) {
        await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: product.id,
            status: newStatus,
          }),
        });
      }

      // Log Audit mutation
      await fetch("/api/admin/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PRODUCT_STATUS_UPDATE",
          entity: "Product",
          entityId: product.id,
          details: `Admin changed status of ${product.title || product.name} to ${newStatus}`,
          actorEmail: "admin@cadde.store",
        }),
      }).catch(() => {});

      showFeedback(
        newStatus === "ACTIVE"
          ? isEn ? "Product approved and published" : "Ürün onaylandı ve yayına alındı"
          : isEn ? "Product rejected" : "Ürün reddedildi"
      );
      setProduct({ ...product, status: newStatus });
      setIsRejectModalOpen(false);
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!product) return;
    try {
      setActionLoading(true);

      const oldPrice = product.price;
      const newPrice = formData.price;

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          title: formData.title,
          name: formData.title,
          price: formData.price,
          originalPrice: formData.originalPrice,
          stock: formData.stock,
          sku: formData.sku,
          brand: formData.brand,
          description: formData.description,
          imageUrl: formData.imageUrl,
          isBestseller: formData.isBestseller,
          isFreeShipping: formData.isFreeShipping,
          isFastDelivery: formData.isFastDelivery,
          isSponsored: formData.isSponsored,
        }),
      });

      // If price changed, create audit log entry
      if (oldPrice !== newPrice) {
        await fetch("/api/admin/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "PRODUCT_PRICE_UPDATE",
            entity: "Product",
            entityId: product.id,
            details: `Admin updated price for "${formData.title}" from ₺${oldPrice} to ₺${newPrice}`,
            actorEmail: "admin@cadde.store",
          }),
        }).catch(() => {});
      }

      setProduct({
        ...product,
        name: formData.title,
        title: formData.title,
        price: formData.price,
        originalPrice: formData.originalPrice,
        stock: formData.stock,
        sku: formData.sku,
        brand: formData.brand,
        description: formData.description,
        imageUrl: formData.imageUrl,
        isBestseller: formData.isBestseller,
        isFreeShipping: formData.isFreeShipping,
        isFastDelivery: formData.isFastDelivery,
        isSponsored: formData.isSponsored,
      });

      setIsEditing(false);
      showFeedback(isEn ? "Product saved successfully" : "Ürün başarıyla kaydedildi");
    } catch (err) {
      console.error("Save product error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <AdminHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 flex justify-center flex-1">
          <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <AdminHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center justify-center flex-1 gap-4">
          <Package className="w-12 h-12 text-slate-400" />
          <h2 className="text-base font-bold text-slate-700">{isEn ? "Product not found" : "Ürün bulunamadı"}</h2>
          <Link href="/admin/products" className="text-xs font-bold text-indigo-600 underline">
            &larr; {isEn ? "Back to Products" : "Ürünler Listesine Dön"}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/admin/products" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-text-main line-clamp-1">{product.title || product.name}</h1>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                        product.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : product.status === "PENDING_REVIEW"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {product.status || "ACTIVE"}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    SKU: {product.sku || product.id} • {isEn ? "ID:" : "Ürün No:"} {product.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={isEditing ? "outline" : "primary"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="font-bold text-xs"
                >
                  {isEditing ? (isEn ? "Cancel Edit" : "Vazgeç") : (isEn ? "Edit Product" : "Ürünü Düzenle")}
                </Button>

                {isEditing && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={actionLoading}
                    onClick={handleSaveProduct}
                    className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs shadow-xs flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isEn ? "Save Changes" : "Kaydet"}</span>
                  </Button>
                )}

                {product.status !== "REJECTED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRejectModalOpen(true)}
                    className="border-rose-300 text-rose-700 bg-rose-50 font-bold text-xs"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    <span>{isEn ? "Reject" : "Reddet"}</span>
                  </Button>
                )}

                {product.status !== "ACTIVE" && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus("ACTIVE")}
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>{isEn ? "Approve" : "Onayla"}</span>
                  </Button>
                )}

                <Link
                  href={`/product/${product.slug || product.id}`}
                  target="_blank"
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-xs font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isEn ? "Storefront" : "Sitede Gör"}</span>
                </Link>
              </div>
            </div>

            {/* Editable Form or Read-Only Overview */}
            {isEditing ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-5 text-xs">
                <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>{isEn ? "Edit Product Details & Commercial Pricing" : "Ürün Detayları ve Ticari Fiyatlandırma"}</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">{isEn ? "Product Title *" : "Ürün Başlığı *"}</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">{isEn ? "Brand *" : "Marka *"}</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">{isEn ? "Sale Price (TL) *" : "Satış Fiyatı (TL) *"}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-black text-indigo-700 outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">{isEn ? "Market / Original Price (TL)" : "Piyasa / Liste Fiyatı (TL)"}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">{isEn ? "Stock Quantity" : "Stok Adedi"}</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">{isEn ? "SKU / Barcode" : "SKU / Barkod"}</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="font-bold text-slate-700">{isEn ? "Primary Image URL" : "Kapak Görsel URL"}</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="font-bold text-slate-700">{isEn ? "Description" : "Açıklama"}</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600 min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                {/* Badges Toggles */}
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                  <label className="font-bold text-slate-800">{isEn ? "Product Badges & Merchandising Flags" : "Ürün Rozetleri ve Vitrin Bayrakları"}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isBestseller}
                        onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-bold text-slate-700">{isEn ? "Bestseller" : "Çok Satan"}</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFreeShipping}
                        onChange={(e) => setFormData({ ...formData, isFreeShipping: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-bold text-slate-700">{isEn ? "Free Shipping" : "Kargo Bedava"}</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFastDelivery}
                        onChange={(e) => setFormData({ ...formData, isFastDelivery: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-bold text-slate-700">{isEn ? "Fast Delivery" : "Hızlı Teslimat"}</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isSponsored}
                        onChange={(e) => setFormData({ ...formData, isSponsored: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-bold text-slate-700">{isEn ? "Sponsored" : "Sponsorlu"}</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              /* Product Details Overview */
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row gap-6">
                <img
                  src={product.imageUrl || product.images?.[0]}
                  alt=""
                  className="w-48 h-56 object-cover rounded-xl border border-slate-200 shrink-0"
                />
                <div className="flex flex-col gap-2.5 text-xs flex-1">
                  <span className="font-extrabold text-indigo-600 uppercase tracking-widest text-[11px]">{product.brand}</span>
                  <h2 className="text-lg font-black text-text-main">{product.title || product.name}</h2>

                  <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
                    <span>
                      {isEn ? "Category:" : "Kategori:"} <strong>{product.category?.nameTR || product.category?.nameEN || product.categorySlug || "Genel"}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {isEn ? "Seller:" : "Satıcı:"} <strong>{product.seller?.storeName || product.storeName || "Cadde Store Official"}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {isEn ? "Stock:" : "Stok:"} <strong>{product.stock ?? 100} {isEn ? "units" : "adet"}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-2xl font-black text-text-main">{formatCurrency(product.price, currency)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatCurrency(product.originalPrice, currency)}
                      </span>
                    )}
                  </div>

                  {/* Badges Display */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {formData.isBestseller && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-black flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        <span>{isEn ? "Bestseller" : "Çok Satan"}</span>
                      </span>
                    )}
                    {formData.isFreeShipping && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-black flex items-center gap-1">
                        <Truck className="w-3 h-3 text-emerald-600" />
                        <span>{isEn ? "Free Shipping" : "Kargo Bedava"}</span>
                      </span>
                    )}
                    {formData.isFastDelivery && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-black flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-600" />
                        <span>{isEn ? "Fast Delivery" : "Hızlı Teslimat"}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-slate-700 font-medium leading-relaxed pt-3 border-t border-slate-100">
                    {product.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={isEn ? "Reject Product Submission" : "Ürün Başvurusunu Reddet"}
      >
        <div className="flex flex-col gap-4 text-xs p-1">
          <label className="font-bold text-slate-700">
            {isEn ? "Reason for Rejection (Will be notified to Seller) *" : "Reddetme Gerekçesi (Satıcıya bildirilecektir) *"}
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={isEn ? "e.g. Inappropriate images or misleading price" : "Örn: Eksik ürün açıklaması veya yetersiz görsel kalitesi"}
            className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-rose-500 min-h-[100px] resize-none"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={actionLoading}
              onClick={() => handleUpdateStatus("REJECTED")}
              className="bg-rose-600 hover:bg-rose-700 font-bold text-white"
            >
              {isEn ? "Confirm Rejection" : "Reddetmeyi Onayla"}
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
