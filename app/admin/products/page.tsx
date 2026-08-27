"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/lib/i18n/language-context";
import { MediaPickerModal } from "@/components/admin/media/media-picker-modal";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Check,
  X,
  Store,
  Grid,
  TrendingUp,
} from "lucide-react";

export default function AdminProductsPage() {
  const { language, currency } = useLanguage();
  const isEn = language === "en";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (e) {
      console.warn("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async () => {
    if (!editingProduct?.nameTr || !editingProduct?.price) return;
    setSaving(true);
    try {
      const isNew = !editingProduct.id;
      const url = isNew ? "/api/products" : `/api/products/${editingProduct.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingProduct,
          price: Number(editingProduct.price),
          stock: Number(editingProduct.stock || 0),
        }),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (e) {
      console.error("Save product error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
    } catch (e) {
      console.error("Delete product error:", e);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.nameTr && p.nameTr.toLowerCase().includes(q)) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Products & Inventory Catalog" : "Ürün & Stok Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage marketplace product listings, stock levels, pricing, variants, and merchant allocations."
                    : "Pazaryeri ürünlerini, stok adetlerini, fiyatlandırmayı ve satıcı atamalarını yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingProduct({
                  nameTr: "",
                  nameEn: "",
                  price: 299,
                  stock: 50,
                  sku: `SKU-${Date.now().toString().slice(-6)}`,
                  images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"],
                  active: true,
                });
                setIsEditModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>{isEn ? "Add Stock Product" : "Yeni Ürün Ekle"}</span>
            </Button>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search by product name or SKU..." : "Ürün adı veya SKU ara..."}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filteredProducts.length} {isEn ? "products listed" : "ürün listeleniyor"}
            </span>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-4">{isEn ? "Product" : "Ürün"}</th>
                    <th className="py-3 px-4">{isEn ? "SKU" : "SKU Kodu"}</th>
                    <th className="py-3 px-4">{isEn ? "Price" : "Fiyat"}</th>
                    <th className="py-3 px-4">{isEn ? "Stock" : "Stok"}</th>
                    <th className="py-3 px-4">{isEn ? "Status" : "Durum"}</th>
                    <th className="py-3 px-4 text-right">{isEn ? "Actions" : "İşlemler"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={prod.images && prod.images[0] ? prod.images[0] : "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80"}
                              alt={prod.nameTr}
                              className="max-h-full max-w-full object-cover rounded"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-slate-900 truncate max-w-xs">{prod.nameTr}</span>
                            <span className="text-[10px] text-slate-400 truncate">{prod.nameEn || prod.category?.nameTr || "Genel"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{prod.sku || "-"}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{formatCurrency(prod.price || 0, currency)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${prod.stock <= 5 ? "text-rose-600" : "text-slate-700"}`}>
                          {prod.stock || 0} adet
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {prod.active !== false ? "AKTİF" : "PASİF"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(prod);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title={isEn ? "Edit" : "Düzenle"}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title={isEn ? "Delete" : "Sil"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {isEn ? "No products found." : "Katalogda ürün bulunamadı."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Edit / Add Product Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={editingProduct?.id ? (isEn ? "Edit Product" : "Ürünü Düzenle") : (isEn ? "Add Stock Product" : "Yeni Ürün Ekle")}
          size="lg"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">TR Ürün Adı *</label>
                <Input
                  value={editingProduct?.nameTr || ""}
                  onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, nameTr: e.target.value }))}
                  placeholder="Örn: Oversize Pamuklu Tişört"
                  className="text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">EN Product Name</label>
                <Input
                  value={editingProduct?.nameEn || ""}
                  onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="E.g: Oversized Cotton T-Shirt"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Fiyat (TL) *</label>
                <Input
                  type="number"
                  value={editingProduct?.price || 0}
                  onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, price: e.target.value }))}
                  className="text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Stok Adedi *</label>
                <Input
                  type="number"
                  value={editingProduct?.stock || 0}
                  onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, stock: e.target.value }))}
                  className="text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">SKU Kodu</label>
                <Input
                  value={editingProduct?.sku || ""}
                  onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, sku: e.target.value }))}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Product Image Selection */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Ürün Görseli</label>
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{isEn ? "Media Library / Upload" : "Kütüphaneden Seç / Yükle"}</span>
                </button>
              </div>

              <Input
                value={editingProduct?.images && editingProduct.images[0] ? editingProduct.images[0] : ""}
                onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, images: [e.target.value] }))}
                className="text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                {isEn ? "Cancel" : "Vazgeç"}
              </Button>
              <Button
                size="sm"
                disabled={saving || !editingProduct?.nameTr || !editingProduct?.price}
                onClick={handleSaveProduct}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-1" />
                <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save Product" : "Ürünü Kaydet"}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setEditingProduct((prev: any) => ({ ...prev, images: [url] }))}
        isEn={isEn}
      />
    </div>
  );
}
