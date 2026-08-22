"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MOCK_ADMIN_CATEGORIES } from "@/lib/admin/admin-repository";
import { AdminCategory } from "@/lib/admin/admin-types";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Grid, Plus, Edit2, Trash2 } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ADMIN_CATEGORIES_KEY = "cadde-store-admin-categories";

export default function AdminCategoriesPage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<AdminCategory>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_CATEGORIES_KEY);
      if (saved) {
        setCategories(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setCategories(MOCK_ADMIN_CATEGORIES);
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      slug: "",
      name: { tr: "", en: "" },
      description: { tr: "", en: "" },
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
      productCount: 0,
      subcategories: [],
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory.slug || !editingCategory.name?.tr) return;

    const fullCat = editingCategory as AdminCategory;
    const index = categories.findIndex((c) => c.id === fullCat.id);
    let updated: AdminCategory[];

    if (index > -1) {
      updated = categories.map((c) => (c.id === fullCat.id ? fullCat : c));
    } else {
      updated = [fullCat, ...categories];
    }

    setCategories(updated);
    setIsModalOpen(false);
    try {
      localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(updated));
    } catch (err) {}
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    try {
      localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(updated));
    } catch (err) {}
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

              <Button variant="primary" size="sm" onClick={handleOpenAdd} className="font-extrabold text-xs bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1" />
                <span>{t("admin.categories.btnAddCategory")}</span>
              </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.categories.thCategory")}</th>
                      <th className="p-3">{t("admin.categories.thSlug")}</th>
                      <th className="p-3">{t("admin.categories.thProductsCount")}</th>
                      <th className="p-3">{t("admin.categories.thSubcategories")}</th>
                      <th className="p-3 text-right">{t("admin.categories.thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={c.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-extrabold text-text-main">{c.name[language]}</span>
                              <span className="text-[10px] text-text-subtle">{c.description[language]}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-indigo-600">{c.slug}</td>
                        <td className="p-3 font-bold">{c.productCount}</td>
                        <td className="p-3 text-text-muted">{c.subcategories.join(", ")}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Category Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory.id ? t("admin.categories.modalEditTitle") : t("admin.categories.modalAddTitle")}>
        <form onSubmit={handleSaveCategory} className="flex flex-col gap-3 text-xs p-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">{t("admin.categories.labelNameTr")}</label>
              <input
                type="text"
                value={editingCategory.name?.tr || ""}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: { tr: e.target.value, en: editingCategory.name?.en || e.target.value } })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold">{t("admin.categories.labelNameEn")}</label>
              <input
                type="text"
                value={editingCategory.name?.en || ""}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: { tr: editingCategory.name?.tr || e.target.value, en: e.target.value } })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold">{t("admin.categories.labelSlug")}</label>
            <input
              type="text"
              value={editingCategory.slug || ""}
              onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold">{t("admin.categories.labelImageUrl")}</label>
            <input
              type="text"
              value={editingCategory.imageUrl || ""}
              onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              {t("admin.categories.cancel")}
            </Button>
            <Button variant="primary" size="sm" type="submit" className="font-bold bg-indigo-600 hover:bg-indigo-700">
              {t("admin.categories.saveCategory")}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
