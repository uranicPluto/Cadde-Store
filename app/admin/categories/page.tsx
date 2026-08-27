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
  Grid,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  Package,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.warn("Failed to fetch categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async () => {
    if (!editingCategory?.nameTr || !editingCategory?.slug) return;
    setSaving(true);
    try {
      const isNew = !editingCategory.id;
      const url = isNew ? "/api/categories" : `/api/categories/${editingCategory.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (e) {
      console.error("Save category error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
    } catch (e) {
      console.error("Delete category error:", e);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.nameTr && c.nameTr.toLowerCase().includes(q)) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
      (c.slug && c.slug.toLowerCase().includes(q))
    );
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
                <Grid className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Categories & Taxonomies" : "Kategori & Taksonomi Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage marketplace categories, hierarchical subcategories, and landing banners."
                    : "Pazaryeri kategorilerini, alt hiyerarşiyi ve kategori vitrin görsellerini yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingCategory({
                  nameTr: "",
                  nameEn: "",
                  slug: "",
                  active: true,
                });
                setIsEditModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>{isEn ? "Create Category" : "Yeni Kategori Ekle"}</span>
            </Button>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search categories..." : "Kategori ara..."}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filteredCategories.length} {isEn ? "categories" : "kategori"}
            </span>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between gap-3 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Grid className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-extrabold text-sm text-slate-900 truncate">{cat.nameTr}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">/category/{cat.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-500 font-bold">
                    {cat.products?.length || 0} {isEn ? "items" : "ürün"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
          title={editingCategory?.id ? (isEn ? "Edit Category" : "Kategoriyi Düzenle") : (isEn ? "New Category" : "Yeni Kategori")}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">TR Kategori Adı *</label>
              <Input
                value={editingCategory?.nameTr || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  setEditingCategory((prev: any) => ({ ...prev, nameTr: val, slug: prev.slug || slug }));
                }}
                className="text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">EN Category Name</label>
              <Input
                value={editingCategory?.nameEn || ""}
                onChange={(e) => setEditingCategory((prev: any) => ({ ...prev, nameEn: e.target.value }))}
                className="text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">URL Slug *</label>
              <Input
                value={editingCategory?.slug || ""}
                onChange={(e) => setEditingCategory((prev: any) => ({ ...prev, slug: e.target.value }))}
                className="text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                {isEn ? "Cancel" : "Vazgeç"}
              </Button>
              <Button
                size="sm"
                disabled={saving || !editingCategory?.nameTr || !editingCategory?.slug}
                onClick={handleSaveCategory}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-1" />
                <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save Category" : "Kategoriyi Kaydet"}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
