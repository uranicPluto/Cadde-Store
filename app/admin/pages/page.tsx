"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Edit,
  Copy,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  FileText,
  History,
  Calendar,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Check,
  X,
  Globe,
  Layout,
  BookOpen,
  HelpCircle,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CmsPageItem {
  id: string;
  slug: string;
  titleTr: string;
  titleEn: string;
  type: string;
  status: string;
  sectionsJson: string;
  metaTitleTr?: string | null;
  metaTitleEn?: string | null;
  metaDescriptionTr?: string | null;
  metaDescriptionEn?: string | null;
  schedulePublishAt?: string | null;
  scheduleUnpublishAt?: string | null;
  publishedVersionId?: string | null;
  createdAt: string;
  updatedAt: string;
  versions?: any[];
}

const PRESET_TEMPLATES = [
  {
    id: "campaign-landing",
    nameTr: "Kampanya & Promosyon Vitrini",
    nameEn: "Campaign & Promotion Showcase",
    type: "CAMPAIGN",
    descriptionTr: "Görsel Hero, Flaş Fırsatlar, 4'lü Ürün Izgarası ve Güven Rozetleri.",
    descriptionEn: "Visual Hero banner, Flash deals, 4-column product grid and trust badges.",
    icon: Megaphone,
    sections: [
      {
        id: "sec-hero",
        type: "HERO",
        titleTR: "Büyük Sezon İndirimi Başladı!",
        titleEN: "Big Seasonal Sale Has Started!",
        orderIndex: 0,
        active: true,
        configJson: {
          subtitleTR: "Binlerce üründe %50'ye varan dev indirim fırsatlarını kaçırmayın.",
          subtitleEN: "Up to 50% discount on thousands of curated items.",
          bgGradient: "from-indigo-900 via-purple-900 to-slate-900",
          primaryCtaTextTR: "İndirimleri Keşfet",
          primaryCtaTextEN: "Explore Discounts",
          primaryCtaLink: "/category/kadin",
          badgeTR: "FIRSAT HAFTASI",
          badgeEN: "DEAL OF THE WEEK",
        },
      },
      {
        id: "sec-deals",
        type: "PRODUCT_GRID",
        titleTR: "Öne Çıkan Kampanya Ürünleri",
        titleEN: "Featured Campaign Products",
        orderIndex: 1,
        active: true,
        configJson: {
          limit: 8,
          columns: 4,
          source: "DISCOUNT",
          subtitleTR: "En çok ilgi gören indirimli seçkiler",
          subtitleEN: "Top rated discounted selections",
        },
      },
      {
        id: "sec-trust",
        type: "TRUST_BADGES",
        orderIndex: 2,
        active: true,
        configJson: {},
      },
    ],
  },
  {
    id: "faq-center",
    nameTr: "Sıkça Sorulan Sorular & Yardım",
    nameEn: "FAQ & Help Center",
    type: "STATIC",
    descriptionTr: "Arama özellikli interaktif soru-cevap akordeonu ve destek kartı.",
    descriptionEn: "Searchable interactive Q&A accordion with direct support panel.",
    icon: HelpCircle,
    sections: [
      {
        id: "sec-faq",
        type: "FAQ_ACCORDION",
        titleTR: "Sıkça Sorulan Sorular",
        titleEN: "Frequently Asked Questions",
        orderIndex: 0,
        active: true,
        configJson: {
          subtitleTR: "Sipariş, kargo, iade ve ödeme süreçleriyle ilgili merak ettikleriniz",
          subtitleEN: "Everything you need to know about orders, shipping, and returns",
        },
      },
    ],
  },
  {
    id: "contact-support",
    nameTr: "İletişim & Canlı Destek",
    nameEn: "Contact & Live Support",
    type: "STATIC",
    descriptionTr: "Müşteri iletişim formu, şirket koordinatları ve çalışma saatleri.",
    descriptionEn: "Customer inquiry form, corporate office coordinates and support hours.",
    icon: Globe,
    sections: [
      {
        id: "sec-contact",
        type: "CONTACT_FORM",
        titleTR: "Cadde Store İletişim Merkezi",
        titleEN: "Cadde Store Support Center",
        orderIndex: 0,
        active: true,
        configJson: {
          subtitleTR: "Sorularınız ve iş ortaklığı talepleriniz için bize ulaşın.",
          subtitleEN: "Reach out to our team for questions or vendor inquiries.",
        },
      },
    ],
  },
  {
    id: "policy-legal",
    nameTr: "Politika & Yasal Sözleşme",
    nameEn: "Policy & Legal Document",
    type: "POLICY",
    descriptionTr: "Gizlilik, Kullanım Koşulları, KVKK ve İade politikaları için zengin metin şablonu.",
    descriptionEn: "Rich typography format for Privacy, Terms of Service, KVKK, and Shipping policies.",
    icon: BookOpen,
    sections: [
      {
        id: "sec-rich",
        type: "RICH_CONTENT",
        titleTR: "Yasal Bilgilendirme ve Koşullar",
        titleEN: "Legal Terms & Compliance",
        orderIndex: 0,
        active: true,
        configJson: {
          customHtmlTR: "<p>Bu sayfada yer alan kullanım şartları ve bilgilendirmeler Cadde Store platformunun resmi yasal kurallarını içerir.</p>",
          customHtmlEN: "<p>The terms and conditions detailed here constitute the official legal framework of Cadde Store.</p>",
        },
      },
    ],
  },
  {
    id: "blank-canvas",
    nameTr: "Boş Sayfa (Özel Tasarım)",
    nameEn: "Blank Canvas (Custom)",
    type: "CUSTOM",
    descriptionTr: "Sıfırdan blok ekleyerek özel sayfa kurgulayın.",
    descriptionEn: "Build from scratch by adding modular section blocks.",
    icon: Layout,
    sections: [],
  },
];

export default function AdminPagesListPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [pages, setPages] = useState<CmsPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Feedback notice
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("campaign-landing");
  const [newSlug, setNewSlug] = useState("");
  const [newTitleTr, setNewTitleTr] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newType, setNewType] = useState("CUSTOM");
  const [creating, setCreating] = useState(false);

  // Schedule Modal
  const [schedulePageItem, setSchedulePageItem] = useState<CmsPageItem | null>(null);
  const [schedulePublishDate, setSchedulePublishDate] = useState("");
  const [scheduleUnpublishDate, setScheduleUnpublishDate] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Version History Modal
  const [versionPageItem, setVersionPageItem] = useState<CmsPageItem | null>(null);
  const [versionsList, setVersionsList] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  const showNotice = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.pages)) {
          setPages(data.pages);
        }
      }
    } catch (e) {
      console.error("Failed to fetch pages:", e);
      showNotice("error", isEn ? "Failed to load pages." : "Sayfalar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [isEn]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Filtered pages list
  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      !searchQuery ||
      page.titleTr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "ALL" || page.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || page.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: pages.length,
    published: pages.filter((p) => p.status === "PUBLISHED").length,
    scheduled: pages.filter((p) => p.status === "SCHEDULED").length,
    drafts: pages.filter((p) => p.status === "DRAFT").length,
    policy: pages.filter((p) => p.type === "POLICY" || p.type === "STATIC").length,
  };

  // 1. Create Page handler
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug || !newTitleTr || !newTitleEn) {
      showNotice("error", isEn ? "Please fill in all required fields." : "Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setCreating(true);
    try {
      const template = PRESET_TEMPLATES.find((t) => t.id === selectedTemplate) || PRESET_TEMPLATES[0];
      const sectionsJson = JSON.stringify(template.sections || []);

      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, ""),
          titleTr: newTitleTr.trim(),
          titleEn: newTitleEn.trim(),
          type: template.type || newType || "CUSTOM",
          status: "DRAFT",
          sectionsJson,
          metaTitleTr: `${newTitleTr.trim()} | Cadde Store`,
          metaTitleEn: `${newTitleEn.trim()} | Cadde Store`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotice("success", isEn ? "Page created successfully!" : "Sayfa başarıyla oluşturuldu!");
        setIsCreateModalOpen(false);
        setNewSlug("");
        setNewTitleTr("");
        setNewTitleEn("");
        await loadPages();
      } else {
        showNotice("error", data.error || (isEn ? "Failed to create page." : "Sayfa oluşturulamadı."));
      }
    } catch (e: any) {
      showNotice("error", e.message || "Bir hata oluştu.");
    } finally {
      setCreating(false);
    }
  };

  // 2. Duplicate Page handler
  const handleDuplicatePage = async (page: CmsPageItem) => {
    try {
      const res = await fetch(`/api/pages/${page.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice("success", isEn ? `"${page.titleEn}" duplicated!` : `"${page.titleTr}" çoğaltıldı!`);
        await loadPages();
      } else {
        showNotice("error", data.error || "Kopyalama başarısız.");
      }
    } catch (e: any) {
      showNotice("error", e.message || "Kopyalama hatası.");
    }
  };

  // 3. Publish / Unpublish Toggle
  const handleTogglePublish = async (page: CmsPageItem) => {
    const isCurrentlyPublished = page.status === "PUBLISHED";
    const action = isCurrentlyPublished ? "unpublish" : "publish";

    try {
      const res = await fetch(`/api/pages/${page.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, changeSummary: isCurrentlyPublished ? "Taslağa alındı" : "Yayınlandı" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice(
          "success",
          isCurrentlyPublished
            ? (isEn ? "Page set to draft." : "Sayfa taslak durumuna alındı.")
            : (isEn ? "Page published successfully!" : "Sayfa başarıyla yayınlandı!")
        );
        await loadPages();
      } else {
        showNotice("error", data.error || "İşlem başarısız.");
      }
    } catch (e: any) {
      showNotice("error", e.message || "Yayınlama hatası.");
    }
  };

  // 4. Delete Page handler
  const handleDeletePage = async (page: CmsPageItem) => {
    const confirmText = isEn
      ? `Are you sure you want to delete "${page.titleEn}" (/p/${page.slug})?`
      : `"${page.titleTr}" (/p/${page.slug}) sayfasını silmek istediğinizden emin misiniz?`;

    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice("success", isEn ? "Page deleted." : "Sayfa silindi.");
        await loadPages();
      } else {
        showNotice("error", data.error || "Silme başarısız.");
      }
    } catch (e: any) {
      showNotice("error", e.message || "Silme hatası.");
    }
  };

  // 5. Open Version History Modal
  const handleOpenVersions = async (page: CmsPageItem) => {
    setVersionPageItem(page);
    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/pages/${page.id}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersionsList(data.versions || []);
      }
    } catch (e) {
      console.error("Failed to load versions:", e);
    } finally {
      setLoadingVersions(false);
    }
  };

  // 6. Rollback to Version
  const handleRollback = async (versionId: string) => {
    if (!versionPageItem) return;
    if (!window.confirm(isEn ? "Restore this version?" : "Bu versiyona geri dönmek istiyor musunuz?")) return;

    setRollingBack(true);
    try {
      const res = await fetch(`/api/pages/${versionPageItem.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice("success", isEn ? "Version restored to draft!" : "Versiyon geri yüklendi!");
        setVersionPageItem(null);
        await loadPages();
      } else {
        showNotice("error", data.error || "Geri yükleme başarısız.");
      }
    } catch (e: any) {
      showNotice("error", e.message || "Hata oluştu.");
    } finally {
      setRollingBack(false);
    }
  };

  // 7. Save Scheduling Dates
  const handleSaveSchedule = async () => {
    if (!schedulePageItem) return;
    setSavingSchedule(true);
    try {
      const res = await fetch(`/api/pages/${schedulePageItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: schedulePublishDate ? "SCHEDULED" : schedulePageItem.status,
          schedulePublishAt: schedulePublishDate ? new Date(schedulePublishDate).toISOString() : null,
          scheduleUnpublishAt: scheduleUnpublishDate ? new Date(scheduleUnpublishDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice("success", isEn ? "Schedule updated!" : "Yayınlama takvimi güncellendi!");
        setSchedulePageItem(null);
        await loadPages();
      } else {
        showNotice("error", data.error || "Takvim güncellenemedi.");
      }
    } catch (e: any) {
      showNotice("error", e.message || "Takvim hatası.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const getSectionCount = (sectionsJson: string) => {
    try {
      const parsed = JSON.parse(sectionsJson || "[]");
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <AdminHeader />

      <div className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        <AdminSidebar className="w-full md:w-64 shrink-0" />

        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-md">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" />
                <span>{isEn ? "Website CMS" : "Web Sitesi İçerik Yönetimi"}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {isEn ? "Multi-Page CMS & Page Studio" : "Çoklu Sayfa Yönetimi & Sayfa Stüdyosu"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isEn
                  ? "Build, edit, duplicate, schedule, and publish landing pages, policy pages, and custom marketing campaigns."
                  : "Açılış sayfaları, politika metinleri ve özel kampanya sayfalarını oluşturun, düzenleyin, zamanlayın ve yayınlayın."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shrink-0"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>{isEn ? "New Page" : "Yeni Sayfa Oluştur"}</span>
              </Button>
            </div>
          </div>

          {/* Feedback Notice */}
          {notice && (
            <div
              className={cn(
                "p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-bold shadow-md",
                notice.type === "success"
                  ? "bg-emerald-950/80 border border-emerald-700 text-emerald-300"
                  : "bg-rose-950/80 border border-rose-700 text-rose-300"
              )}
            >
              <div className="flex items-center gap-2">
                {notice.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{notice.message}</span>
              </div>
              <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">{isEn ? "Total Pages" : "Toplam Sayfa"}</span>
              <span className="text-2xl font-black text-white">{stats.total}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">{isEn ? "Live Published" : "Yayında"}</span>
              <span className="text-2xl font-black text-emerald-400">{stats.published}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase">{isEn ? "Scheduled" : "Zamanlanmış"}</span>
              <span className="text-2xl font-black text-amber-400">{stats.scheduled}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">{isEn ? "Drafts" : "Taslak"}</span>
              <span className="text-2xl font-black text-slate-300">{stats.drafts}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-indigo-400 uppercase">{isEn ? "Policy / Legal" : "Politika & Yasal"}</span>
              <span className="text-2xl font-black text-indigo-400">{stats.policy}</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder={isEn ? "Search by title or slug..." : "Başlık veya adres (slug) ile ara..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-700 text-xs text-white placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-bold">
                {["ALL", "LANDING", "CAMPAIGN", "STATIC", "POLICY", "CUSTOM"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-colors",
                      typeFilter === t
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {t === "ALL"
                      ? (isEn ? "All Types" : "Tümü")
                      : t}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">{isEn ? "All Statuses" : "Tüm Durumlar"}</option>
                <option value="PUBLISHED">{isEn ? "Published" : "Yayında"}</option>
                <option value="SCHEDULED">{isEn ? "Scheduled" : "Zamanlanmış"}</option>
                <option value="DRAFT">{isEn ? "Draft" : "Taslak"}</option>
                <option value="ARCHIVED">{isEn ? "Archived" : "Arşiv"}</option>
              </select>
            </div>
          </div>

          {/* Pages Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-xs font-bold">
                {isEn ? "Loading pages..." : "Sayfalar yükleniyor..."}
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-3">
                <FileText className="w-10 h-10 text-slate-600" />
                <span className="text-sm font-bold text-slate-300">
                  {isEn ? "No pages found matching your filters." : "Filtrelerle eşleşen sayfa bulunamadı."}
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                  variant="outline"
                  className="border-slate-700 text-xs text-slate-300"
                >
                  {isEn ? "Clear Filters" : "Filtreleri Temizle"}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">{isEn ? "Page Title & URL" : "Sayfa Başlığı & URL"}</th>
                      <th className="px-4 py-3.5">{isEn ? "Type" : "Tür"}</th>
                      <th className="px-4 py-3.5">{isEn ? "Status" : "Durum"}</th>
                      <th className="px-4 py-3.5">{isEn ? "Sections" : "Bölüm"}</th>
                      <th className="px-4 py-3.5">{isEn ? "Schedule" : "Takvim"}</th>
                      <th className="px-4 py-3.5">{isEn ? "Updated" : "Güncellendi"}</th>
                      <th className="px-5 py-3.5 text-right">{isEn ? "Actions" : "İşlemler"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-200 font-medium">
                    {filteredPages.map((page) => {
                      const sectionCount = getSectionCount(page.sectionsJson);
                      const isPublished = page.status === "PUBLISHED";
                      const isScheduled = page.status === "SCHEDULED";
                      const isPolicy = page.type === "POLICY" || page.type === "STATIC";

                      return (
                        <tr key={page.id} className="hover:bg-slate-900/60 transition-colors">
                          {/* Title & Slug */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-white text-sm">
                                {isEn ? page.titleEn : page.titleTr}
                              </span>
                              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                                <span>/p/{page.slug}</span>
                                <Link
                                  href={`/p/${page.slug}`}
                                  target="_blank"
                                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center"
                                  title={isEn ? "Open public page" : "Canlı sayfayı aç"}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-extrabold uppercase",
                                page.type === "CAMPAIGN" && "bg-amber-950 text-amber-400 border border-amber-800",
                                page.type === "LANDING" && "bg-indigo-950 text-indigo-400 border border-indigo-800",
                                page.type === "POLICY" && "bg-purple-950 text-purple-400 border border-purple-800",
                                page.type === "STATIC" && "bg-slate-800 text-slate-300 border border-slate-700",
                                page.type === "CUSTOM" && "bg-blue-950 text-blue-400 border border-blue-800"
                              )}
                            >
                              {page.type}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1",
                                isPublished && "bg-emerald-950 text-emerald-400 border border-emerald-800",
                                isScheduled && "bg-amber-950 text-amber-400 border border-amber-800",
                                page.status === "DRAFT" && "bg-slate-800 text-slate-400 border border-slate-700",
                                page.status === "ARCHIVED" && "bg-rose-950 text-rose-400 border border-rose-800"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  isPublished && "bg-emerald-400 animate-pulse",
                                  isScheduled && "bg-amber-400",
                                  page.status === "DRAFT" && "bg-slate-500",
                                  page.status === "ARCHIVED" && "bg-rose-500"
                                )}
                              />
                              <span>{page.status}</span>
                            </span>
                          </td>

                          {/* Sections Count */}
                          <td className="px-4 py-4">
                            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-bold text-slate-300">
                              {sectionCount} {isEn ? "blocks" : "blok"}
                            </span>
                          </td>

                          {/* Schedule Dates */}
                          <td className="px-4 py-4 text-[11px] text-slate-400">
                            {page.schedulePublishAt ? (
                              <div className="flex flex-col">
                                <span className="text-amber-400 font-bold">
                                  {new Date(page.schedulePublishAt).toLocaleDateString("tr-TR")}
                                </span>
                                {page.scheduleUnpublishAt && (
                                  <span className="text-slate-500 text-[10px]">
                                    → {new Date(page.scheduleUnpublishAt).toLocaleDateString("tr-TR")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* Updated */}
                          <td className="px-4 py-4 text-[11px] text-slate-400">
                            {new Date(page.updatedAt).toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Open Builder */}
                              <Link href={`/admin/pages/${page.id}/builder`}>
                                <Button
                                  size="sm"
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] h-7 px-2.5 shadow-xs"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  <span>{isEn ? "Builder" : "Düzenle"}</span>
                                </Button>
                              </Link>

                              {/* Toggle Publish */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTogglePublish(page)}
                                className={cn(
                                  "h-7 px-2 text-[11px] border-slate-700 font-bold",
                                  isPublished
                                    ? "text-amber-400 hover:bg-amber-950/40"
                                    : "text-emerald-400 hover:bg-emerald-950/40"
                                )}
                                title={isPublished ? "Taslağa Al" : "Yayınla"}
                              >
                                {isPublished ? <Archive className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              </Button>

                              {/* Schedule Modal Trigger */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSchedulePageItem(page);
                                  setSchedulePublishDate(
                                    page.schedulePublishAt ? new Date(page.schedulePublishAt).toISOString().slice(0, 16) : ""
                                  );
                                  setScheduleUnpublishDate(
                                    page.scheduleUnpublishAt ? new Date(page.scheduleUnpublishAt).toISOString().slice(0, 16) : ""
                                  );
                                }}
                                className="h-7 px-2 text-[11px] border-slate-700 text-slate-300 hover:text-white"
                                title="Yayınlama Takvimi"
                              >
                                <Calendar className="w-3 h-3" />
                              </Button>

                              {/* Version History */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenVersions(page)}
                                className="h-7 px-2 text-[11px] border-slate-700 text-slate-300 hover:text-white"
                                title="Versiyon Geçmişi"
                              >
                                <History className="w-3 h-3" />
                              </Button>

                              {/* Duplicate */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDuplicatePage(page)}
                                className="h-7 px-2 text-[11px] border-slate-700 text-slate-300 hover:text-white"
                                title="Kopya Oluştur"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>

                              {/* Delete */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePage(page)}
                                className="h-7 px-2 text-[11px] border-rose-900 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                                title="Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =========================================================================
          CREATE NEW PAGE MODAL
          ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isEn ? "Create New Storefront Page" : "Yeni Vitrin Sayfası Oluştur"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEn ? "Select a template preset or blank canvas." : "Bir şablon seçin veya boş tuval ile başlayın."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="flex flex-col gap-5">
              {/* Template Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  {isEn ? "Choose Template Preset" : "Şablon Seçimi"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_TEMPLATES.map((tmpl) => {
                    const IconComp = tmpl.icon;
                    const isSelected = selectedTemplate === tmpl.id;

                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => {
                          setSelectedTemplate(tmpl.id);
                          setNewType(tmpl.type);
                        }}
                        className={cn(
                          "cursor-pointer p-3.5 rounded-xl border transition-all flex flex-col gap-2",
                          isSelected
                            ? "bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComp className={cn("w-4 h-4", isSelected ? "text-indigo-400" : "text-slate-400")} />
                            <span className="font-bold text-xs text-white">
                              {isEn ? tmpl.nameEn : tmpl.nameTr}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isEn ? tmpl.descriptionEn : tmpl.descriptionTr}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isEn ? "Page Title (Turkish) *" : "Sayfa Başlığı (Türkçe) *"}
                  </label>
                  <Input
                    required
                    placeholder="Örn: Yaz Sezonu İndirimleri"
                    value={newTitleTr}
                    onChange={(e) => {
                      setNewTitleTr(e.target.value);
                      if (!newSlug) {
                        setNewSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/ğ/g, "g")
                            .replace(/ü/g, "u")
                            .replace(/ş/g, "s")
                            .replace(/ı/g, "i")
                            .replace(/ö/g, "o")
                            .replace(/ç/g, "c")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "")
                        );
                      }
                    }}
                    className="bg-slate-900 border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isEn ? "Page Title (English) *" : "Sayfa Başlığı (İngilizce) *"}
                  </label>
                  <Input
                    required
                    placeholder="e.g. Summer Season Discounts"
                    value={newTitleEn}
                    onChange={(e) => setNewTitleEn(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              {/* Slug / URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isEn ? "URL Slug (Storefront path: /p/[slug]) *" : "URL Adresi (Slug) *"}
                </label>
                <div className="flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                  <span className="shrink-0 font-mono text-slate-500">cadde.store/p/</span>
                  <input
                    required
                    type="text"
                    placeholder="yaz-kampanyasi"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="w-full bg-transparent font-mono text-white focus:outline-none ml-1"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-slate-700 text-xs text-slate-300"
                >
                  {isEn ? "Cancel" : "Vazgeç"}
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                >
                  {creating
                    ? (isEn ? "Creating..." : "Oluşturuluyor...")
                    : (isEn ? "Create & Open Studio" : "Oluştur & Stüdyoda Aç")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCHEDULE MODAL
          ========================================================================= */}
      {schedulePageItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">
                  {isEn ? "Schedule Page Activation" : "Yayınlama Takvimi"}
                </h3>
              </div>
              <button onClick={() => setSchedulePageItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              {isEn
                ? `Set start and end dates for "${schedulePageItem.titleEn}".`
                : `"${schedulePageItem.titleTr}" sayfası için başlangıç ve bitiş tarihlerini belirleyin.`}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isEn ? "Publish Date & Time (Start)" : "Yayın Başlangıç Tarihi"}
                </label>
                <Input
                  type="datetime-local"
                  value={schedulePublishDate}
                  onChange={(e) => setSchedulePublishDate(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isEn ? "Unpublish Date & Time (Expiration - Optional)" : "Yayın Bitiş Tarihi (Opsiyonel)"}
                </label>
                <Input
                  type="datetime-local"
                  value={scheduleUnpublishDate}
                  onChange={(e) => setScheduleUnpublishDate(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSchedulePageItem(null)}
                className="border-slate-700 text-xs text-slate-300"
              >
                {isEn ? "Cancel" : "Vazgeç"}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                {savingSchedule ? (isEn ? "Saving..." : "Kaydediliyor...") : (isEn ? "Save Schedule" : "Takvimi Kaydet")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VERSION HISTORY MODAL
          ========================================================================= */}
      {versionPageItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isEn ? "Version History & Rollback" : "Versiyon Geçmişi & Geri Yükleme"}
                  </h3>
                  <span className="text-[11px] text-slate-400">{versionPageItem.titleTr}</span>
                </div>
              </div>
              <button onClick={() => setVersionPageItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
              {loadingVersions ? (
                <div className="py-12 text-center text-xs text-slate-400 font-bold">
                  {isEn ? "Loading versions..." : "Versiyonlar yükleniyor..."}
                </div>
              ) : versionsList.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  {isEn ? "No published snapshots found for this page." : "Bu sayfa için henüz kaydedilmiş bir versiyon bulunmuyor."}
                </div>
              ) : (
                versionsList.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          v{ver.versionNumber}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {ver.changeSummary || `Versiyon ${ver.versionNumber}`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ver.createdAt).toLocaleString("tr-TR")} {ver.publishedBy && `• ${ver.publishedBy}`}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleRollback(ver.id)}
                      disabled={rollingBack}
                      variant="outline"
                      className="border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-200 h-7"
                    >
                      <RotateCcw className="w-3 h-3 mr-1 text-amber-400" />
                      <span>{isEn ? "Restore" : "Geri Yükle"}</span>
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVersionPageItem(null)}
                className="border-slate-700 text-xs text-slate-300"
              >
                {isEn ? "Close" : "Kapat"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
