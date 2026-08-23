"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Grid, Plus, Edit2, Trash2, RefreshCw, Layers, CheckCircle2, XCircle } from "lucide-react";
import { Footer } from "@/components/layout/footer";

interface CategoryItem {
  id: string;
  slug: string;
  nameTR: string;
  nameEN: string;
  descriptionTR?: string;
  descriptionEN?: string;
  imageUrl?: string;
  parentId?: string | null;
  status: string;
  productCount?: number;
}

export default function AdminCategoriesPage() {
  const { language, t } = useLanguage();
  const isEn = language === "en";

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load categories from API", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleOpenAdd = () => {
    setEditingCategory({
      nameTR: "",
      nameEN: "",
      slug: "",
      descriptionTR: "",
      descriptionEN: "",
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
      parentId: null,
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory.slug || !editingCategory.nameTR) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (editingCategory.id) {
        // PUT update
        const res = await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingCategory),
        });
        if (!res.ok) {
          const data = await res.json();
          setErrorMsg(data.error || "Kategori güncellenemedi.");
          setIsSaving(false);
          return;
        }
      } else {
        // POST create
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingCategory),
        });
        if (!res.ok) {
          const data = await res.json();
          setErrorMsg(data.error || "Kategori eklenemedi.");
          setIsSaving(false);
          return;
        }
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error("Failed to save category", err);
      setErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(isEn ? "Are you sure you want to delete this category?" : "Bu kategoriyi silmek istediğinize emin misiniz?")) {
      return;
    }
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  const handleToggleStatus = async (cat: CategoryItem) => {
    const nextStatus = cat.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, status: nextStatus }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, status: nextStatus } : c))
        );
      }
    } catch (e) {
      console.error("Failed to toggle category status", e);
    }
  };

  const countBadgeText = t("admin.categories.countBadge").replace("{count}", String(categories.length));

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
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Grid className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.categories.title")}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">{t("admin.categories.subtitle")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchCategories}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{isEn ? "Refresh" : "Yenile"}</span>
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAdd}
                  className="font-extrabold text-xs bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>{t("admin.categories.btnAddCategory")}</span>
                </Button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.categories.thCategory")}</th>
                      <th className="p-3">{t("admin.categories.thSlug")}</th>
                      <th className="p-3">{t("admin.categories.thProductsCount")}</th>
                      <th className="p-3">{isEn ? "Status" : "Durum"}</th>
                      <th className="p-3 text-right">{t("admin.categories.thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-text-muted">
                          {isEn ? "No categories found." : "Kategori bulunamadı."}
                        </td>
                      </tr>
                    ) : (
                      categories.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={c.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"}
                                alt=""
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                              <div className="flex flex-col">
                                <span className="font-extrabold text-text-main">
                                  {isEn ? c.nameEN || c.nameTR : c.nameTR}
                                </span>
                                <span className="text-[10px] text-text-subtle">
                                  {isEn ? c.descriptionEN || c.descriptionTR : c.descriptionTR}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-bold text-indigo-600 font-mono">{c.slug}</td>
                          <td className="p-3 font-bold">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-extrabold">
                              {c.productCount || 0}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(c)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold border transition-colors ${
                                c.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {c.status === "active" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{isEn ? "Active" : "Aktif"}</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-slate-400" />
                                  <span>{isEn ? "Inactive" : "Pasif"}</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(c)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(c.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCategory.id
            ? t("admin.categories.modalEditTitle")
            : t("admin.categories.modalAddTitle")
        }
      >
        <form onSubmit={handleSaveCategory} className="flex flex-col gap-3 text-xs p-1">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700 font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">{t("admin.categories.labelNameTr")} *</label>
              <input
                type="text"
                value={editingCategory.nameTR || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingCategory((prev) => ({
                    ...prev,
                    nameTR: val,
                    slug: prev?.id ? prev.slug : generateSlug(val),
                  }));
                }}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold">{t("admin.categories.labelNameEn")} *</label>
              <input
                type="text"
                value={editingCategory.nameEN || ""}
                onChange={(e) =>
                  setEditingCategory((prev) => ({ ...prev, nameEN: e.target.value }))
                }
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">{t("admin.categories.labelSlug")} *</label>
              <input
                type="text"
                value={editingCategory.slug || ""}
                onChange={(e) =>
                  setEditingCategory((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold font-mono text-indigo-600"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold">{isEn ? "Parent Hierarchy" : "Üst Kategori"}</label>
              <select
                value={editingCategory.parentId || ""}
                onChange={(e) =>
                  setEditingCategory((prev) => ({
                    ...prev,
                    parentId: e.target.value ? e.target.value : null,
                  }))
                }
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
              >
                <option value="">{isEn ? "None (Top Level)" : "Yok (Ana Kategori)"}</option>
                {categories
                  .filter((c) => c.id !== editingCategory.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {isEn ? c.nameEN : c.nameTR}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold">{t("admin.categories.labelImageUrl")}</label>
            <input
              type="text"
              value={editingCategory.imageUrl || ""}
              onChange={(e) =>
                setEditingCategory((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">{isEn ? "Description (TR)" : "Açıklama (TR)"}</label>
              <input
                type="text"
                value={editingCategory.descriptionTR || ""}
                onChange={(e) =>
                  setEditingCategory((prev) => ({ ...prev, descriptionTR: e.target.value }))
                }
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold">{isEn ? "Description (EN)" : "Açıklama (EN)"}</label>
              <input
                type="text"
                value={editingCategory.descriptionEN || ""}
                onChange={(e) =>
                  setEditingCategory((prev) => ({ ...prev, descriptionEN: e.target.value }))
                }
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              {t("admin.categories.cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSaving}
              className="font-bold bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving
                ? isEn
                  ? "Saving..."
                  : "Kaydediliyor..."
                : t("admin.categories.saveCategory")}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
