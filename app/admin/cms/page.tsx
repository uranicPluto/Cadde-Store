"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
  Image as ImageIcon,
  Link2,
  Calendar,
  Sparkles,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";

interface BannerItem {
  id: string;
  sectionId?: string | null;
  titleTR?: string | null;
  titleEN?: string | null;
  subtitleTR?: string | null;
  subtitleEN?: string | null;
  imageUrlDesktop: string;
  imageUrlMobile?: string | null;
  targetType: string;
  targetValue: string;
  badgeTextTR?: string | null;
  badgeTextEN?: string | null;
  orderIndex: number;
  active: boolean;
}

interface SectionItem {
  id: string;
  titleTR: string;
  titleEN: string;
  type: string;
  orderIndex: number;
  active: boolean;
  configJson: string;
  banners: BannerItem[];
}

export default function AdminCmsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [editingSection, setEditingSection] = useState<Partial<SectionItem>>({});
  const [editingBanner, setEditingBanner] = useState<Partial<BannerItem>>({});
  const [targetSectionId, setTargetSectionId] = useState<string>("");
  const [previewBanner, setPreviewBanner] = useState<BannerItem | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/sections?all=true");
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
      }
    } catch (e) {
      console.error("Failed to load CMS data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const handleOpenAddSection = () => {
    setEditingSection({
      titleTR: "",
      titleEN: "",
      type: "HERO",
      orderIndex: sections.length,
      active: true,
      configJson: "{}",
    });
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (section: SectionItem) => {
    setEditingSection({ ...section });
    setIsSectionModalOpen(true);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm(isEn ? "Delete this section and all its banners?" : "Bu bölümü ve altındaki tüm bannerları silmek istediğinize emin misiniz?")) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/cms/sections?id=${sectionId}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback(isEn ? "Section deleted successfully" : "Vitrin bölümü başarıyla silindi");
        await fetchCmsData();
      }
    } catch (err) {
      console.error("Delete section error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSectionActive = async (section: SectionItem) => {
    try {
      setActionLoading(true);
      await fetch("/api/cms/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: section.id, active: !section.active }),
      });
      showFeedback(
        !section.active
          ? isEn ? "Section published live" : "Bölüm yayına alındı"
          : isEn ? "Section moved to draft" : "Bölüm taslağa alındı"
      );
      await fetchCmsData();
    } catch (err) {
      console.error("Toggle section active error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveSection = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const currentSection = sections[currentIndex];
    const targetSection = sections[targetIndex];

    try {
      setActionLoading(true);
      await Promise.all([
        fetch("/api/cms/sections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: currentSection.id, orderIndex: targetIndex }),
        }),
        fetch("/api/cms/sections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: targetSection.id, orderIndex: currentIndex }),
        }),
      ]);
      await fetchCmsData();
      showFeedback(isEn ? "Section order updated" : "Bölüm sıralaması güncellendi");
    } catch (err) {
      console.error("Move section error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAddBanner = (sectionId: string) => {
    const targetSection = sections.find((s) => s.id === sectionId);
    const bannerCount = targetSection?.banners?.length || 0;

    setTargetSectionId(sectionId);
    setEditingBanner({
      sectionId,
      titleTR: "",
      titleEN: "",
      subtitleTR: "",
      subtitleEN: "",
      imageUrlDesktop: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      imageUrlMobile: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
      targetType: "CATEGORY",
      targetValue: "/category/women",
      badgeTextTR: "Yeni Fırsat",
      badgeTextEN: "New Deal",
      orderIndex: bannerCount,
      active: true,
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (banner: BannerItem) => {
    setEditingBanner({ ...banner });
    setIsBannerModalOpen(true);
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm(isEn ? "Delete this banner?" : "Bu banner'ı silmek istediğinize emin misiniz?")) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/cms/banners?id=${bannerId}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback(isEn ? "Banner deleted" : "Banner silindi");
        await fetchCmsData();
      }
    } catch (err) {
      console.error("Delete banner error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBannerActive = async (banner: BannerItem) => {
    try {
      setActionLoading(true);
      await fetch("/api/cms/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, active: !banner.active }),
      });
      showFeedback(
        !banner.active
          ? isEn ? "Banner activated" : "Banner aktif edildi"
          : isEn ? "Banner deactivated" : "Banner pasife alındı"
      );
      await fetchCmsData();
    } catch (err) {
      console.error("Toggle banner active error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveBanner = async (section: SectionItem, currentBannerIndex: number, direction: "up" | "down") => {
    const targetBannerIndex = direction === "up" ? currentBannerIndex - 1 : currentBannerIndex + 1;
    if (targetBannerIndex < 0 || targetBannerIndex >= section.banners.length) return;

    const currentBanner = section.banners[currentBannerIndex];
    const targetBanner = section.banners[targetBannerIndex];

    try {
      setActionLoading(true);
      await Promise.all([
        fetch("/api/cms/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: currentBanner.id, orderIndex: targetBannerIndex }),
        }),
        fetch("/api/cms/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: targetBanner.id, orderIndex: currentBannerIndex }),
        }),
      ]);
      await fetchCmsData();
      showFeedback(isEn ? "Banner order updated" : "Banner sıralaması güncellendi");
    } catch (err) {
      console.error("Move banner error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection.titleTR || !editingSection.titleEN) return;

    try {
      setActionLoading(true);
      if (editingSection.id) {
        await fetch("/api/cms/sections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingSection),
        });
        showFeedback(isEn ? "Section updated" : "Bölüm güncellendi");
      } else {
        await fetch("/api/cms/sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingSection),
        });
        showFeedback(isEn ? "Section created" : "Bölüm oluşturuldu");
      }
      await fetchCmsData();
      setIsSectionModalOpen(false);
    } catch (err) {
      console.error("Save section error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner.imageUrlDesktop || !editingBanner.targetValue) return;

    try {
      setActionLoading(true);
      if (editingBanner.id) {
        await fetch("/api/cms/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingBanner),
        });
        showFeedback(isEn ? "Banner updated" : "Banner güncellendi");
      } else {
        await fetch("/api/cms/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingBanner),
        });
        showFeedback(isEn ? "Banner created" : "Banner oluşturuldu");
      }
      await fetchCmsData();
      setIsBannerModalOpen(false);
    } catch (err) {
      console.error("Save banner error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <div>
        <AdminHeader />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <AdminSidebar />
            </div>

            <div className="md:col-span-3 space-y-6">
              {/* Toast Feedback */}
              {feedbackMessage && (
                <div className="bg-emerald-600/90 border border-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>{feedbackMessage}</span>
                  </div>
                </div>
              )}

              {/* Header Card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold text-white">
                        {isEn ? "Homepage CMS & Merchandising Studio" : "Ana Sayfa CMS & Vitrin Yönetimi"}
                      </h1>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isEn
                          ? "Design, schedule, and reorder public homepage banners, hero carousels, and promotional strips without code changes."
                          : "Geliştirici müdahalesi olmadan vitrin bannerlarını, hero slaytlarını ve kampanya şeritlerini anında yönetin."}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleOpenAddSection}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isEn ? "Add New CMS Section" : "Yeni Vitrin Bölümü Ekle"}</span>
                </Button>
              </div>

              {/* CMS Sections & Banners List */}
              {loading ? (
                <div className="bg-slate-950 p-12 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
                  {isEn ? "Loading CMS layout..." : "Vitrin yerleşimi yükleniyor..."}
                </div>
              ) : sections.length === 0 ? (
                <div className="bg-slate-950 p-12 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                  <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="font-bold text-sm text-slate-300">
                    {isEn ? "No CMS Sections Configured" : "Henüz Vitrin Bölümü Eklenmemiş"}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {isEn ? "Click '+ Add New CMS Section' to get started." : "Başlamak için '+ Yeni Vitrin Bölümü Ekle' butonuna tıklayın."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sections.map((section, idx) => (
                    <div
                      key={section.id}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-md space-y-4"
                    >
                      {/* Section Header */}
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          {/* Reorder Buttons for Section */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0 || actionLoading}
                              onClick={() => handleMoveSection(idx, "up")}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                              title={isEn ? "Move Section Up" : "Yukarı Taşı"}
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === sections.length - 1 || actionLoading}
                              onClick={() => handleMoveSection(idx, "down")}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                              title={isEn ? "Move Section Down" : "Aşağı Taşı"}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs font-black flex items-center justify-center border border-slate-700">
                            {idx + 1}
                          </span>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-extrabold text-white">
                                {isEn ? section.titleEN : section.titleTR}
                              </h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                                {section.type}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleSectionActive(section)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors border ${
                                  section.active
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                }`}
                              >
                                {section.active ? (isEn ? "Live ✓" : "Yayında ✓") : (isEn ? "Draft / Hidden" : "Taslak / Gizli")}
                              </button>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              Sıra: {section.orderIndex} | Section ID: {section.id}
                            </p>
                          </div>
                        </div>

                        {/* Section Action Controls */}
                        <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                          <Button
                            onClick={() => handleOpenAddBanner(section.id)}
                            size="sm"
                            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isEn ? "Add Banner" : "Banner Ekle"}</span>
                          </Button>

                          <Button
                            onClick={() => handleOpenEditSection(section)}
                            size="sm"
                            variant="outline"
                            className="bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{isEn ? "Edit" : "Düzenle"}</span>
                          </Button>

                          <Button
                            onClick={() => handleDeleteSection(section.id)}
                            size="sm"
                            variant="outline"
                            className="bg-slate-900 hover:bg-red-950 border-slate-700 hover:border-red-800 text-slate-400 hover:text-red-400 text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Section Banners Carousel / List */}
                      {section.banners.length === 0 ? (
                        <div className="p-6 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                          {isEn ? "No banners attached to this section. Click '+ Add Banner'." : "Bu bölüme henüz banner eklenmedi. '+ Banner Ekle'ye tıklayın."}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {section.banners.map((banner, bIdx) => (
                            <div
                              key={banner.id}
                              className={`group bg-slate-900 border ${banner.active ? "border-slate-800" : "border-rose-900/50 opacity-75"} rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between`}
                            >
                              <div>
                                {/* Banner Image Preview */}
                                <div className="relative aspect-16/9 bg-slate-950 overflow-hidden">
                                  <img
                                    src={banner.imageUrlDesktop}
                                    alt={banner.titleTR || "Banner"}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  {banner.badgeTextTR && (
                                    <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow-md uppercase">
                                      {isEn ? banner.badgeTextEN || banner.badgeTextTR : banner.badgeTextTR}
                                    </span>
                                  )}
                                  <div className="absolute top-2 right-2 flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleBannerActive(banner)}
                                      className={`text-[9px] font-black px-1.5 py-0.5 rounded backdrop-blur-md shadow-xs ${
                                        banner.active
                                          ? "bg-emerald-600/90 text-white"
                                          : "bg-rose-600/90 text-white"
                                      }`}
                                    >
                                      {banner.active ? (isEn ? "ACTIVE" : "AKTİF") : (isEn ? "INACTIVE" : "PASİF")}
                                    </button>
                                  </div>

                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPreviewBanner(banner);
                                        setIsPreviewOpen(true);
                                      }}
                                      className="text-[11px] font-bold text-white flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md hover:bg-black/80 cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>{isEn ? "Preview Full" : "Önizle"}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Banner Details */}
                                <div className="p-3.5 space-y-1.5">
                                  <h4 className="text-xs font-bold text-white truncate">
                                    {isEn ? banner.titleEN || banner.titleTR || "Untitled" : banner.titleTR || banner.titleEN || "Başlıksız"}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 line-clamp-1">
                                    {isEn ? banner.subtitleEN || banner.subtitleTR : banner.subtitleTR || banner.subtitleEN}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono pt-1">
                                    <Link2 className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{banner.targetType}: {banner.targetValue}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions & Reordering */}
                              <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                  <span>Sıra: {banner.orderIndex}</span>
                                  <div className="flex items-center ml-1">
                                    <button
                                      type="button"
                                      disabled={bIdx === 0 || actionLoading}
                                      onClick={() => handleMoveBanner(section, bIdx, "up")}
                                      className="p-0.5 rounded text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                                      title={isEn ? "Move Up" : "Yukarı Taşı"}
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={bIdx === section.banners.length - 1 || actionLoading}
                                      onClick={() => handleMoveBanner(section, bIdx, "down")}
                                      className="p-0.5 rounded text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                                      title={isEn ? "Move Down" : "Aşağı Taşı"}
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditBanner(banner)}
                                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                    title={isEn ? "Edit Banner" : "Düzenle"}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBanner(banner.id)}
                                    className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                    title={isEn ? "Delete Banner" : "Sil"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Section Create/Edit Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={editingSection?.id ? (isEn ? "Edit Homepage Section" : "Vitrin Bölümünü Düzenle") : (isEn ? "Add New CMS Section" : "Yeni Vitrin Bölümü Ekle")}
      >
        <form onSubmit={handleSaveSection} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Turkish Title *" : "Türkçe Bölüm Başlığı *"}
              </label>
              <input
                type="text"
                required
                value={editingSection.titleTR || ""}
                onChange={(e) => setEditingSection((p) => ({ ...p, titleTR: e.target.value }))}
                placeholder="Örn: Ana Sayfa Vitrin Hero"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "English Title *" : "İngilizce Bölüm Başlığı *"}
              </label>
              <input
                type="text"
                required
                value={editingSection.titleEN || ""}
                onChange={(e) => setEditingSection((p) => ({ ...p, titleEN: e.target.value }))}
                placeholder="Ex: Main Homepage Hero"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Section Type *" : "Bölüm Tipi *"}
              </label>
              <select
                value={editingSection.type || "HERO"}
                onChange={(e) => setEditingSection((p) => ({ ...p, type: e.target.value }))}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="HERO">HERO — Ana Slider / Carousel</option>
                <option value="BANNER_STRIP">BANNER_STRIP — İkili/Üçlü Kampanya Şeridi</option>
                <option value="FLASH_DEALS">FLASH_DEALS — Süreli Flaş İndirimler</option>
                <option value="PRODUCT_CAROUSEL">PRODUCT_CAROUSEL — Özel Ürün Vitrini</option>
                <option value="CATEGORY_GRID">CATEGORY_GRID — Kategori Izgarası</option>
                <option value="BRAND_STRIP">BRAND_STRIP — Öne Çıkan Markalar</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Display Order Position" : "Sıralama Pozisyonu"}
              </label>
              <input
                type="number"
                value={editingSection.orderIndex ?? 0}
                onChange={(e) => setEditingSection((p) => ({ ...p, orderIndex: Number(e.target.value) }))}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editingSection.active ?? true}
                onChange={(e) => setEditingSection((p) => ({ ...p, active: e.target.checked }))}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <span className="font-bold text-slate-200">
                {isEn ? "Publish Immediately on Homepage" : "Ana Sayfada Hemen Yayınla"}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSectionModalOpen(false)}
              className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
            >
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              type="submit"
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5"
            >
              {isEn ? "Save Section" : "Bölümü Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Banner Create/Edit Modal */}
      <Modal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        title={editingBanner?.id ? (isEn ? "Edit Campaign Banner" : "Kampanya Bannerını Düzenle") : (isEn ? "Add Campaign Banner" : "Yeni Kampanya Bannerı Ekle")}
      >
        <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Banner Title (TR)" : "Banner Başlığı (Türkçe)"}
              </label>
              <input
                type="text"
                value={editingBanner.titleTR || ""}
                onChange={(e) => setEditingBanner((p) => ({ ...p, titleTR: e.target.value }))}
                placeholder="Örn: Büyük Sonbahar Fırsatları"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Banner Title (EN)" : "Banner Başlığı (İngilizce)"}
              </label>
              <input
                type="text"
                value={editingBanner.titleEN || ""}
                onChange={(e) => setEditingBanner((p) => ({ ...p, titleEN: e.target.value }))}
                placeholder="Ex: Big Autumn Sale Deals"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Subtitle (TR)" : "Alt Başlık (Türkçe)"}
              </label>
              <input
                type="text"
                value={editingBanner.subtitleTR || ""}
                onChange={(e) => setEditingBanner((p) => ({ ...p, subtitleTR: e.target.value }))}
                placeholder="Örn: Seçili Ürünlerde Net %50 İndirim"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Subtitle (EN)" : "Alt Başlık (İngilizce)"}
              </label>
              <input
                type="text"
                value={editingBanner.subtitleEN || ""}
                onChange={(e) => setEditingBanner((p) => ({ ...p, subtitleEN: e.target.value }))}
                placeholder="Ex: Flat 50% Off Selected Collections"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              {isEn ? "Desktop Image URL (1200x500 or 16:9) *" : "Masaüstü Görsel URL (1200x500 / 16:9) *"}
            </label>
            <input
              type="url"
              required
              value={editingBanner.imageUrlDesktop || ""}
              onChange={(e) => setEditingBanner((p) => ({ ...p, imageUrlDesktop: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              {isEn ? "Mobile Image URL (Optional)" : "Mobil Görsel URL (Opsiyonel)"}
            </label>
            <input
              type="url"
              value={editingBanner.imageUrlMobile || ""}
              onChange={(e) => setEditingBanner((p) => ({ ...p, imageUrlMobile: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Target Destination Type *" : "Hedef Yönlendirme Tipi *"}
              </label>
              <select
                value={editingBanner.targetType || "CATEGORY"}
                onChange={(e) => setEditingBanner((p) => ({ ...p, targetType: e.target.value }))}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="CATEGORY">Kategori Sayfası (Örn: /category/women)</option>
                <option value="BRAND">Marka Sayfası (Örn: /search?brand=Nike)</option>
                <option value="SELLER">Satıcı Mağazası (Örn: /seller/cadde-store)</option>
                <option value="PRODUCT">Doğrudan Ürün Sayfası</option>
                <option value="URL">Özel URL / Kampanya Bağlantısı</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Target Path or URL *" : "Hedef URL / Yol *"}
              </label>
              <input
                type="text"
                required
                value={editingBanner.targetValue || ""}
                onChange={(e) => setEditingBanner((p) => ({ ...p, targetValue: e.target.value }))}
                placeholder="Örn: /category/women veya /search?q=ayakkabi"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Badge Text (TR)" : "Rozet Metni (Türkçe)"}
              </label>
              <input
                type="text"
                value={editingBanner.badgeTextTR || ""}
                onChange={(e) => setEditingBanner((p) => ({ ...p, badgeTextTR: e.target.value }))}
                placeholder="Örn: Sınırlı Süre, Vade Farksız Taksit"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Badge Text (EN)" : "Rozet Metni (İngilizce)"}
              </label>
              <input
                type="text"
                value={editingBanner.badgeTextEN || ""}
                onChange={(e) => setEditingBanner((p) => ({ ...p, badgeTextEN: e.target.value }))}
                placeholder="Ex: Limited Time Deal"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Display Order Position" : "Sıralama Pozisyonu"}
              </label>
              <input
                type="number"
                value={editingBanner.orderIndex ?? 0}
                onChange={(e) => setEditingBanner((p) => ({ ...p, orderIndex: Number(e.target.value) }))}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBanner.active ?? true}
                  onChange={(e) => setEditingBanner((p) => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <span className="font-bold text-slate-200">
                  {isEn ? "Banner Active" : "Banner Aktif"}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBannerModalOpen(false)}
              className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
            >
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              type="submit"
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5"
            >
              {isEn ? "Save Banner" : "Banner'ı Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Live Preview Modal */}
      {previewBanner && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={isEn ? "Live Banner Preview" : "Canlı Banner Vitrin Önizlemesi"}
        >
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <img
                src={previewBanner.imageUrlDesktop}
                alt={previewBanner.titleTR || "Preview"}
                className="w-full aspect-16/9 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                {previewBanner.badgeTextTR && (
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded w-fit uppercase mb-2">
                    {isEn ? previewBanner.badgeTextEN || previewBanner.badgeTextTR : previewBanner.badgeTextTR}
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {isEn ? previewBanner.titleEN || previewBanner.titleTR : previewBanner.titleTR || previewBanner.titleEN}
                </h2>
                <p className="text-sm text-slate-200 mt-1 max-w-xl">
                  {isEn ? previewBanner.subtitleEN || previewBanner.subtitleTR : previewBanner.subtitleTR || previewBanner.subtitleEN}
                </p>
                <div className="mt-4">
                  <span className="bg-white text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg inline-block">
                    {isEn ? "Explore Now →" : "Fırsatı İncele →"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Hedef Yönlendirme: <strong className="text-indigo-400">{previewBanner.targetType}: {previewBanner.targetValue}</strong></span>
              <span className="text-emerald-400 font-bold">✓ Piksel & Renk Standartları Onaylı</span>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
}
