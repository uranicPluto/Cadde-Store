"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Layers,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  Sliders,
  Globe,
  Calendar,
  Sparkles,
  CheckCircle2,
  FileText,
  Eye,
} from "lucide-react";

interface CmsPageItem {
  id: string;
  slug: string;
  titleTr: string;
  titleEn: string;
  type: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  updatedAt: string;
}

export default function AdminPagesManagerPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === "en";

  const [pages, setPages] = useState<CmsPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPage, setNewPage] = useState({
    titleTr: "",
    titleEn: "",
    slug: "",
    type: "LANDING",
  });
  const [creating, setCreating] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      const data = await res.json();
      if (data.pages && Array.isArray(data.pages)) {
        setPages(data.pages);
      }
    } catch (e) {
      console.warn("Failed to fetch pages:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreatePage = async () => {
    if (!newPage.titleTr || !newPage.slug) return;
    setCreating(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPage,
          sectionsJson: "[]",
          status: "DRAFT",
        }),
      });
      const data = await res.json();
      if (data.page?.id) {
        setIsCreateModalOpen(false);
        router.push(`/admin/pages/${data.page.id}/builder`);
      }
    } catch (e) {
      console.error("Create page error:", e);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicatePage = async (page: CmsPageItem) => {
    try {
      const res = await fetch(`/api/pages/${page.id}/duplicate`, { method: "POST" });
      if (res.ok) fetchPages();
    } catch (e) {
      console.error("Duplicate error:", e);
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (res.ok) fetchPages();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const filteredPages = pages.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.titleTr.toLowerCase().includes(q) ||
      p.titleEn.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
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
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Pages & Multi-Page CMS" : "Sayfa Yönetimi & Çoklu CMS"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Create, design, and manage landing pages, promotional campaigns, and policy documents."
                    : "Kampanya iniş sayfalarını, özel vitrinleri ve kurumsal sayfaları görsel olarak oluşturun."}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>{isEn ? "Create New Page" : "Yeni Sayfa Oluştur"}</span>
            </Button>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search pages by title or slug..." : "Sayfa başlığı veya link ara..."}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filteredPages.length} {isEn ? "pages" : "sayfa"}
            </span>
          </div>

          {/* Pages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between gap-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                      {page.type}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-2">
                      {isEn ? page.titleEn || page.titleTr : page.titleTr}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                      /p/{page.slug}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      page.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {page.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <Link
                    href={`/p/${page.slug}`}
                    target="_blank"
                    className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isEn ? "View" : "Görüntüle"}</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/pages/${page.id}/builder`}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-bold flex items-center gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isEn ? "Visual Builder" : "Görsel Editör"}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDuplicatePage(page)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title={isEn ? "Duplicate" : "Çoğalt"}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePage(page.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title={isEn ? "Delete" : "Sil"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPages.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <Layers className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs font-medium">
                  {isEn ? "No custom pages found." : "Henüz oluşturulmuş sayfa bulunamadı."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create New Page Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={isEn ? "Create New Page" : "Yeni Sayfa Oluştur"}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">TR Sayfa Başlığı *</label>
              <Input
                value={newPage.titleTr}
                onChange={(e) => {
                  const val = e.target.value;
                  const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  setNewPage((prev) => ({ ...prev, titleTr: val, slug: prev.slug || slugified }));
                }}
                placeholder="Örn: Yaz Sezonu İndirimleri"
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">EN Page Title</label>
              <Input
                value={newPage.titleEn}
                onChange={(e) => setNewPage((prev) => ({ ...prev, titleEn: e.target.value }))}
                placeholder="E.g: Summer Season Deals"
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">URL Slug *</label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2 text-xs text-slate-500 rounded-l-lg font-mono">
                  /p/
                </span>
                <Input
                  value={newPage.slug}
                  onChange={(e) => setNewPage((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="yaz-indirimleri"
                  className="rounded-l-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                {isEn ? "Cancel" : "Vazgeç"}
              </Button>
              <Button
                size="sm"
                disabled={creating || !newPage.titleTr || !newPage.slug}
                onClick={handleCreatePage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {creating ? (isEn ? "Creating..." : "Oluşturuluyor...") : isEn ? "Create & Open Builder" : "Oluştur & Editörü Aç"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
