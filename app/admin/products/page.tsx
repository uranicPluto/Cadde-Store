"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getFullCatalog, DetailedProductMock } from "@/lib/catalog/product-repository";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Package,
  Search,
  Check,
  X,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Flame,
  Truck,
  Zap,
  CheckCircle2,
  Ban,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Footer } from "@/components/layout/footer";

const ADMIN_PRODUCTS_KEY = "cadde-store-admin-products";

export default function AdminProductsPage() {
  const { language, currency, t } = useLanguage();
  const isEn = language === "en";

  const [products, setProducts] = useState<DetailedProductMock[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<DetailedProductMock>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const loadProducts = () => {
    const catalog = getFullCatalog(language);
    try {
      const saved = localStorage.getItem(ADMIN_PRODUCTS_KEY);
      if (saved) {
        setProducts(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setProducts(catalog);
  };

  useEffect(() => {
    loadProducts();
  }, [language]);

  const saveProductsList = (updated: DetailedProductMock[]) => {
    setProducts(updated);
    try {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleOpenAdd = () => {
    setEditingProduct({
      id: `p-${Date.now()}`,
      slug: "",
      name: "",
      brand: "Cadde Collection",
      categorySlug: "women",
      categoryName: isEn ? "Women's Fashion" : "Kadın Giyim",
      storeName: "Cadde Store Official",
      price: 499.90,
      originalPrice: 799.90,
      stock: 100,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      galleryImages: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"],
      description: isEn ? "High quality marketplace product." : "Yüksek kaliteli pazar yeri ürünü.",
      specifications: {
        [isEn ? "Material" : "Materyal"]: "100% Cotton",
        [isEn ? "Origin" : "Menşei"]: "Türkiye",
      },
      rating: 4.8,
      reviewCount: 24,
      reviews: [],
      badges: {
        bestseller: true,
        fastDelivery: true,
        freeShipping: true,
      },
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: DetailedProductMock) => {
    setEditingProduct({ ...p });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.name || !editingProduct.price) return;

    const slug = editingProduct.slug || editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const newProd = {
      ...editingProduct,
      slug,
      id: editingProduct.id || `p-${Date.now()}`,
      categorySlug: editingProduct.categorySlug || "women",
      categoryName: editingProduct.categoryName || (isEn ? "Women's Fashion" : "Kadın Giyim"),
      galleryImages: editingProduct.galleryImages || [editingProduct.imageUrl || ""],
      specifications: editingProduct.specifications || {},
      reviews: editingProduct.reviews || [],
      rating: editingProduct.rating || 4.8,
      reviewCount: editingProduct.reviewCount || 1,
      stock: editingProduct.stock || 100,
    } as DetailedProductMock;

    const updated = [newProd, ...products];
    saveProductsList(updated);
    showFeedback(isEn ? "New product added to catalog" : "Yeni ürün kataloğa eklendi");
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.id) return;

    const updated = products.map((p) => (p.id === editingProduct.id ? ({ ...p, ...editingProduct } as DetailedProductMock) : p));
    saveProductsList(updated);
    showFeedback(isEn ? "Product updated successfully" : "Ürün başarıyla güncellendi");
    setIsEditModalOpen(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (!confirm(isEn ? `Delete ${name} from platform catalog?` : `${name} ürününü katalogdan silmek istediğinize emin misiniz?`)) {
      return;
    }
    const updated = products.filter((p) => p.id !== id);
    saveProductsList(updated);
    showFeedback(isEn ? "Product deleted" : "Ürün silindi");
  };

  const handleToggleBestseller = (id: string) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, badges: { ...p.badges, bestseller: !p.badges?.bestseller } } : p
    );
    saveProductsList(updated);
    showFeedback(isEn ? "Bestseller badge updated" : "Çok satan rozeti güncellendi");
  };

  const categories = Array.from(new Set(products.map((p) => p.categoryName || p.categorySlug)));

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      (p.storeName && p.storeName.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || p.categoryName === categoryFilter || p.categorySlug === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "BESTSELLER" && p.badges?.bestseller) ||
      (statusFilter === "FREESHIP" && p.badges?.freeShipping);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const countBadgeText = t("admin.products.countBadge").replace("{count}", String(filtered.length));

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
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.products.title")}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">{t("admin.products.subtitle")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAdd}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>{isEn ? "Add New Product" : "Yeni Ürün Ekle"}</span>
                </Button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.products.searchPlaceholder")}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="ALL">{isEn ? "All Categories" : "Tüm Kategoriler"}</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="ALL">{isEn ? "All Badges & Status" : "Tüm Durumlar"}</option>
                    <option value="BESTSELLER">{isEn ? "Bestsellers" : "Çok Satanlar"}</option>
                    <option value="FREESHIP">{isEn ? "Free Cargo" : "Ücretsiz Kargo"}</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.products.thProduct")}</th>
                      <th className="p-3">{t("admin.products.thSeller")}</th>
                      <th className="p-3">{t("admin.products.thCategory")}</th>
                      <th className="p-3">{t("admin.products.thPrice")}</th>
                      <th className="p-3">{t("admin.products.thStock")}</th>
                      <th className="p-3">{isEn ? "Badges" : "Rozetler"}</th>
                      <th className="p-3 text-right">{t("admin.products.thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted">
                          {t("admin.products.noProductsFound")}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt=""
                                className="w-10 h-12 object-cover rounded border border-slate-200 shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-extrabold text-primary text-[11px] uppercase">{p.brand}</span>
                                <Link
                                  href={`/product/${p.slug}`}
                                  target="_blank"
                                  className="font-bold text-text-main line-clamp-1 hover:underline"
                                >
                                  {p.name}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{p.storeName || "Cadde Store"}</td>
                          <td className="p-3 font-semibold text-text-muted">{p.categoryName || p.categorySlug}</td>
                          <td className="p-3 font-black text-text-main">
                            <div className="flex flex-col">
                              <span>{formatCurrency(p.price, currency)}</span>
                              {p.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  {formatCurrency(p.originalPrice, currency)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-bold">{p.stock} Adet</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {p.badges?.bestseller && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-black">
                                  Çok Satan
                                </span>
                              )}
                              {p.badges?.freeShipping && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-black">
                                  Kargo Bedava
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleBestseller(p.id)}
                                title={isEn ? "Toggle Bestseller" : "Çok Satan Durumunu Değiştir"}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  p.badges?.bestseller
                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                    : "text-slate-400 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <Flame className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                title={isEn ? "Edit" : "Düzenle"}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                href={`/product/${p.slug}`}
                                target="_blank"
                                title={isEn ? "Preview on site" : "Sitede Gör"}
                                className="p-1.5 text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                title={isEn ? "Delete" : "Sil"}
                                className="p-1.5 text-rose-500 hover:text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? (isEn ? "Edit Product" : "Ürünü Düzenle") : (isEn ? "Add New Product" : "Yeni Ürün Ekle")}
      >
        <form
          onSubmit={isEditModalOpen ? handleSaveEdit : handleSaveAdd}
          className="flex flex-col gap-4 text-xs p-1 max-h-[75vh] overflow-y-auto"
        >
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">{isEn ? "Product Title *" : "Ürün Başlığı *"}</label>
            <input
              type="text"
              required
              value={editingProduct.name || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Brand *" : "Marka *"}</label>
              <input
                type="text"
                required
                value={editingProduct.brand || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Seller / Store Name" : "Satıcı Mağaza Adı"}</label>
              <input
                type="text"
                value={editingProduct.storeName || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, storeName: e.target.value })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Selling Price (TL) *" : "Satış Fiyatı (TL) *"}</label>
              <input
                type="number"
                step="0.01"
                required
                value={editingProduct.price ?? ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Original Price (TL)" : "Piyasa Fiyatı (TL)"}</label>
              <input
                type="number"
                step="0.01"
                value={editingProduct.originalPrice ?? ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseFloat(e.target.value) || undefined })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Stock Quantity" : "Stok Adedi"}</label>
              <input
                type="number"
                value={editingProduct.stock ?? 100}
                onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">{isEn ? "Main Image URL *" : "Ana Görsel URL *"}</label>
            <input
              type="url"
              required
              value={editingProduct.imageUrl || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">{isEn ? "Description" : "Açıklama"}</label>
            <textarea
              rows={3}
              value={editingProduct.description || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600 resize-none"
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProduct.badges?.bestseller ?? false}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    badges: { ...editingProduct.badges, bestseller: e.target.checked },
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span>{isEn ? "Bestseller Badge" : "Çok Satan Rozeti"}</span>
            </label>

            <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProduct.badges?.freeShipping ?? false}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    badges: { ...editingProduct.badges, freeShipping: e.target.checked },
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span>{isEn ? "Free Shipping Badge" : "Ücretsiz Kargo Rozeti"}</span>
            </label>

            <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProduct.badges?.fastDelivery ?? false}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    badges: { ...editingProduct.badges, fastDelivery: e.target.checked },
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span>{isEn ? "Fast Delivery Badge" : "Hızlı Teslimat Rozeti"}</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="font-bold"
            >
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {isEn ? "Save Product" : "Ürünü Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
