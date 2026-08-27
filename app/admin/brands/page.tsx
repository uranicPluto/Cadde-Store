"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/lib/i18n/language-context";
import { MediaPickerModal } from "@/components/admin/media/media-picker-modal";
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  CheckCircle2,
} from "lucide-react";

export default function AdminBrandsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (data.brands && Array.isArray(data.brands)) {
        setBrands(data.brands);
      }
    } catch (e) {
      console.warn("Failed to fetch brands:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSaveBrand = async () => {
    if (!editingBrand?.name) return;
    setSaving(true);
    try {
      const isNew = !editingBrand.id;
      const url = isNew ? "/api/brands" : `/api/brands/${editingBrand.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBrand),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingBrand(null);
        fetchBrands();
      }
    } catch (e) {
      console.error("Save brand error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (res.ok) fetchBrands();
    } catch (e) {
      console.error("Delete brand error:", e);
    }
  };

  const filteredBrands = brands.filter((b) => {
    if (!searchQuery.trim()) return true;
    return b.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Brands & Official Stores" : "Marka & Resmi Mağaza Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage featured brand partnerships, authorized sellers, and verified logos."
                    : "Pazaryerindeki yetkili marka ortaklıklarını, logoları ve vitrin yerleşimlerini yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingBrand({
                  name: "",
                  slug: "",
                  logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
                  featured: true,
                });
                setIsEditModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>{isEn ? "Add Brand" : "Yeni Marka Ekle"}</span>
            </Button>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search brands..." : "Marka adı ara..."}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filteredBrands.length} {isEn ? "brands" : "marka"}
            </span>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between items-center text-center gap-3 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={brand.logoUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex flex-col min-w-0 w-full">
                  <h3 className="font-extrabold text-xs text-slate-900 truncate">{brand.name}</h3>
                  <span className="text-[10px] text-emerald-600 font-bold mt-0.5">Resmi Mağaza</span>
                </div>

                <div className="flex items-center gap-1 pt-2 border-t border-slate-100 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBrand(brand);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Edit / Add Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={editingBrand?.id ? (isEn ? "Edit Brand" : "Markayı Düzenle") : (isEn ? "Add Brand" : "Yeni Marka Ekle")}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Marka Adı *</label>
              <Input
                value={editingBrand?.name || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  setEditingBrand((prev: any) => ({ ...prev, name: val, slug: prev.slug || slug }));
                }}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Logo Görseli</label>
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
                value={editingBrand?.logoUrl || ""}
                onChange={(e) => setEditingBrand((prev: any) => ({ ...prev, logoUrl: e.target.value }))}
                className="text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                {isEn ? "Cancel" : "Vazgeç"}
              </Button>
              <Button
                size="sm"
                disabled={saving || !editingBrand?.name}
                onClick={handleSaveBrand}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-1" />
                <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save Brand" : "Markayı Kaydet"}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setEditingBrand((prev: any) => ({ ...prev, logoUrl: url }))}
        isEn={isEn}
      />
    </div>
  );
}
