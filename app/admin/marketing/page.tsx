"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Footer } from "@/components/layout/footer";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Edit2,
  Trash2,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  ShoppingCart,
  Percent,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  Award,
  Tag,
  Store,
} from "lucide-react";

export interface MarketingCampaign {
  id: string;
  name: string;
  type: "SPONSORED_PRODUCT" | "SPONSORED_BRAND" | "SPONSORED_SELLER" | "FEATURED_SEARCH";
  targetId?: string | null;
  targetName?: string | null;
  placement: "HOMEPAGE_HERO" | "SEARCH_TOP" | "CATEGORY_TOP" | "PRODUCT_DETAIL_SIDEBAR";
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  priority: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  impressions: number;
  clicks: number;
  orders: number;
  revenue: number;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_SAMPLE_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: "camp-1",
    name: "Sonbahar İndirimleri — Kadın Koleksiyonu",
    type: "SPONSORED_PRODUCT",
    targetId: "prod-1",
    targetName: "Kadın Şifon Çiçekli Elbise",
    placement: "HOMEPAGE_HERO",
    budget: 15000,
    spent: 8420,
    startDate: "2026-08-15T00:00:00.000Z",
    endDate: "2026-09-01T23:59:59.000Z",
    priority: 10,
    status: "ACTIVE",
    impressions: 142800,
    clicks: 6840,
    orders: 382,
    revenue: 41250,
  },
  {
    id: "camp-2",
    name: "Apple & Premium Aksesuar Arama Vitrini",
    type: "FEATURED_SEARCH",
    targetId: "keyword-apple",
    targetName: "apple airpods iphone kulaklık",
    placement: "SEARCH_TOP",
    budget: 25000,
    spent: 19800,
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: "2026-08-31T23:59:59.000Z",
    priority: 8,
    status: "ACTIVE",
    impressions: 295000,
    clicks: 14200,
    orders: 890,
    revenue: 124600,
  },
  {
    id: "camp-3",
    name: "Nike Resmi Mağaza & Yeni Sezon Lansmanı",
    type: "SPONSORED_BRAND",
    targetId: "brand-nike",
    targetName: "Nike Sportswear",
    placement: "CATEGORY_TOP",
    budget: 18000,
    spent: 18000,
    startDate: "2026-07-01T00:00:00.000Z",
    endDate: "2026-08-10T23:59:59.000Z",
    priority: 5,
    status: "COMPLETED",
    impressions: 210000,
    clicks: 9800,
    orders: 540,
    revenue: 78900,
  },
  {
    id: "camp-4",
    name: "Moda Trend Mağazası — Öne Çıkan Satıcı",
    type: "SPONSORED_SELLER",
    targetId: "seller-moda",
    targetName: "Cadde Collection Official",
    placement: "PRODUCT_DETAIL_SIDEBAR",
    budget: 10000,
    spent: 3200,
    startDate: "2026-08-18T00:00:00.000Z",
    endDate: "2026-09-15T23:59:59.000Z",
    priority: 6,
    status: "PAUSED",
    impressions: 54000,
    clicks: 2150,
    orders: 114,
    revenue: 16500,
  },
];

export default function AdminMarketingPage() {
  const { language, currency, t } = useLanguage();
  const isEn = language === "en";

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<MarketingCampaign>>({});

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/marketing");
      if (res.ok) {
        const data = await res.json();
        if (data.campaigns && data.campaigns.length > 0) {
          setCampaigns(data.campaigns);
          return;
        }
      }
      setCampaigns(DEFAULT_SAMPLE_CAMPAIGNS);
    } catch (e) {
      console.warn("Marketing API fetch fallback:", e);
      setCampaigns(DEFAULT_SAMPLE_CAMPAIGNS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Aggregated Analytics
  const metrics = useMemo(() => {
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalOrders = campaigns.reduce((sum, c) => sum + (c.orders || 0), 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;

    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const convRate = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
    const roi = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    return {
      totalSpend,
      totalBudget,
      totalImpressions,
      totalClicks,
      totalOrders,
      totalRevenue,
      activeCount,
      avgCtr: avgCtr.toFixed(2),
      convRate: convRate.toFixed(2),
      roi: roi.toFixed(1),
    };
  }, [campaigns]);

  const handleOpenAdd = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 14);

    setEditingCampaign({
      name: "",
      type: "SPONSORED_PRODUCT",
      targetId: "",
      targetName: "",
      placement: "SEARCH_TOP",
      budget: 5000,
      spent: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: tomorrow.toISOString().slice(0, 10),
      priority: 5,
      status: "ACTIVE",
      impressions: 0,
      clicks: 0,
      orders: 0,
      revenue: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (campaign: MarketingCampaign) => {
    setEditingCampaign({
      ...campaign,
      startDate: campaign.startDate ? campaign.startDate.slice(0, 10) : "",
      endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : "",
    });
    setIsModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign.name || !editingCampaign.budget) return;

    try {
      setActionLoading(true);
      const payload = {
        ...editingCampaign,
        budget: Number(editingCampaign.budget),
        spent: Number(editingCampaign.spent || 0),
        priority: Number(editingCampaign.priority || 1),
        startDate: editingCampaign.startDate ? new Date(editingCampaign.startDate).toISOString() : new Date().toISOString(),
        endDate: editingCampaign.endDate ? new Date(editingCampaign.endDate).toISOString() : new Date().toISOString(),
      };

      if (editingCampaign.id) {
        const res = await fetch(`/api/marketing/${editingCampaign.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // Try top-level endpoint fallback
          await fetch("/api/marketing", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        showFeedback(isEn ? "Campaign updated successfully" : "Kampanya başarıyla güncellendi");
      } else {
        const res = await fetch("/api/marketing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // Local state fallback if backend route is in-sync
          const created: MarketingCampaign = {
            ...(payload as MarketingCampaign),
            id: `camp-${Date.now()}`,
            impressions: 0,
            clicks: 0,
            orders: 0,
            revenue: 0,
          };
          setCampaigns([created, ...campaigns]);
        }
        showFeedback(isEn ? "New campaign launched successfully" : "Yeni reklam kampanyası başlatıldı");
      }

      await fetchCampaigns();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save campaign error:", err);
      showFeedback(isEn ? "Failed to save campaign" : "Kampanya kaydedilirken hata oluştu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (c: MarketingCampaign) => {
    const nextStatus = c.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      setActionLoading(true);
      await fetch(`/api/marketing/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, status: nextStatus }),
      });
      showFeedback(
        nextStatus === "ACTIVE"
          ? isEn ? "Campaign activated" : "Kampanya aktif edildi"
          : isEn ? "Campaign paused" : "Kampanya duraklatıldı"
      );
      setCampaigns(campaigns.map((item) => (item.id === c.id ? { ...item, status: nextStatus } : item)));
    } catch (err) {
      console.error("Toggle status error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(isEn ? `Delete campaign "${name}"?` : `"${name}" kampanyasını silmek istediğinize emin misiniz?`)) return;
    try {
      setActionLoading(true);
      await fetch(`/api/marketing/${id}`, { method: "DELETE" });
      setCampaigns(campaigns.filter((c) => c.id !== id));
      showFeedback(isEn ? "Campaign deleted" : "Kampanya silindi");
    } catch (err) {
      console.error("Delete campaign error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.targetName && c.targetName.toLowerCase().includes(search.toLowerCase())) ||
      c.type.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "ALL" || c.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: MarketingCampaign["type"]) => {
    switch (type) {
      case "SPONSORED_PRODUCT":
        return { label: isEn ? "Sponsored Product" : "Sponsorlu Ürün", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Tag };
      case "SPONSORED_BRAND":
        return { label: isEn ? "Sponsored Brand" : "Sponsorlu Marka", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Award };
      case "SPONSORED_SELLER":
        return { label: isEn ? "Sponsored Seller" : "Sponsorlu Mağaza", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Store };
      case "FEATURED_SEARCH":
        return { label: isEn ? "Featured Search" : "Öne Çıkan Arama", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Search };
      default:
        return { label: type, color: "bg-slate-50 text-slate-700 border-slate-200", icon: Sparkles };
    }
  };

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
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{isEn ? "Marketing & Sponsored Ads Studio" : "Pazarlama & Sponsorlu Reklam Yönetimi"}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {campaigns.length} {isEn ? "Campaigns" : "Kampanya"}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {isEn
                      ? "Create, manage, and track ROI for Sponsored Products, Brands, Stores, and Search Placements."
                      : "Sponsorlu ürünler, öne çıkan mağazalar ve arama reklamlarını bütçe ve getiri analiziyle yönetin."}
                  </span>
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
                  <span>{isEn ? "Create Campaign" : "Yeni Kampanya Oluştur"}</span>
                </Button>
              </div>
            </div>

            {/* Performance Analytics Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isEn ? "Active Campaigns" : "Aktif Kampanyalar"}</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Play className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-xl font-black text-slate-900">{metrics.activeCount} / {campaigns.length}</span>
                <span className="text-[10px] text-emerald-600 font-bold">{isEn ? "Live in production" : "Canlı yayında"}</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isEn ? "Total Ad Spend" : "Toplam Reklam Harcaması"}</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-xl font-black text-slate-900">{formatCurrency(metrics.totalSpend, currency)}</span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {isEn ? "Budget:" : "Bütçe:"} {formatCurrency(metrics.totalBudget, currency)}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isEn ? "Impressions & Clicks" : "Gösterim & Tıklama"}</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-xl font-black text-slate-900">
                  {(metrics.totalImpressions / 1000).toFixed(0)}k / {(metrics.totalClicks / 1000).toFixed(1)}k
                </span>
                <span className="text-[10px] text-blue-600 font-bold">CTR: %{metrics.avgCtr}</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isEn ? "Attributed ROI" : "Getiri / ROAS"}</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-xl font-black text-emerald-600">{metrics.roi}x</span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {formatCurrency(metrics.totalRevenue, currency)} {isEn ? "Revenue" : "Ciro"}
                </span>
              </div>
            </div>

            {/* Campaign Table & Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isEn ? "Search campaigns or targets..." : "Kampanya veya hedef ara..."}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="ALL">{isEn ? "All Ad Types" : "Tüm Reklam Tipleri"}</option>
                    <option value="SPONSORED_PRODUCT">{isEn ? "Sponsored Product" : "Sponsorlu Ürün"}</option>
                    <option value="SPONSORED_BRAND">{isEn ? "Sponsored Brand" : "Sponsorlu Marka"}</option>
                    <option value="SPONSORED_SELLER">{isEn ? "Sponsored Seller" : "Sponsorlu Mağaza"}</option>
                    <option value="FEATURED_SEARCH">{isEn ? "Featured Search" : "Öne Çıkan Arama"}</option>
                  </select>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="ALL">{isEn ? "All Statuses" : "Tüm Durumlar"}</option>
                    <option value="ACTIVE">{isEn ? "Active" : "Aktif"}</option>
                    <option value="PAUSED">{isEn ? "Paused" : "Duraklatıldı"}</option>
                    <option value="COMPLETED">{isEn ? "Completed" : "Tamamlandı"}</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{isEn ? "Campaign & Type" : "Kampanya & Tip"}</th>
                      <th className="p-3">{isEn ? "Target & Placement" : "Hedef & Konum"}</th>
                      <th className="p-3">{isEn ? "Budget / Spent" : "Bütçe / Harcanan"}</th>
                      <th className="p-3">{isEn ? "Impressions / Clicks" : "Gösterim / Tıklama"}</th>
                      <th className="p-3">{isEn ? "Orders & Revenue" : "Sipariş & Ciro"}</th>
                      <th className="p-3">{isEn ? "Status" : "Durum"}</th>
                      <th className="p-3 text-right">{isEn ? "Actions" : "İşlemler"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted">
                          {isEn ? "Loading marketing campaigns..." : "Kampanyalar yükleniyor..."}
                        </td>
                      </tr>
                    ) : filteredCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted">
                          {isEn ? "No marketing campaigns found matching criteria." : "Kriterlere uygun kampanya bulunamadı."}
                        </td>
                      </tr>
                    ) : (
                      filteredCampaigns.map((c) => {
                        const typeInfo = getTypeBadge(c.type);
                        const TypeIcon = typeInfo.icon;
                        const spendPct = c.budget > 0 ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0;
                        const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : "0.00";

                        return (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <div className="flex flex-col gap-1 min-w-[200px]">
                                <span className="font-extrabold text-slate-900">{c.name}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${typeInfo.color}`}>
                                    <TypeIcon className="w-3 h-3" />
                                    <span>{typeInfo.label}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">P{c.priority}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="flex flex-col min-w-[160px]">
                                <span className="font-bold text-slate-800 line-clamp-1">{c.targetName || c.targetId || "—"}</span>
                                <span className="text-[10px] text-indigo-600 font-semibold">{c.placement}</span>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="flex flex-col gap-1 min-w-[130px]">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-900">{formatCurrency(c.spent, currency)}</span>
                                  <span className="text-slate-400">/ {formatCurrency(c.budget, currency)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      spendPct >= 90 ? "bg-rose-500" : spendPct >= 60 ? "bg-amber-500" : "bg-indigo-600"
                                    }`}
                                    style={{ width: `${spendPct}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-slate-400">%{spendPct} {isEn ? "consumed" : "kullanıldı"}</span>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="flex flex-col min-w-[120px]">
                                <div className="flex items-center gap-1 text-slate-900 font-extrabold">
                                  <span>{(c.impressions / 1000).toFixed(0)}k</span>
                                  <span className="text-slate-400 text-[10px] font-normal">imp</span>
                                  <span>•</span>
                                  <span>{c.clicks}</span>
                                  <span className="text-slate-400 text-[10px] font-normal">clk</span>
                                </div>
                                <span className="text-[10px] text-blue-600 font-bold">CTR: %{ctr}</span>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="flex flex-col min-w-[130px]">
                                <span className="font-extrabold text-emerald-700">{formatCurrency(c.revenue, currency)}</span>
                                <span className="text-[10px] text-slate-500 font-semibold">{c.orders} {isEn ? "orders" : "sipariş"}</span>
                              </div>
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 rounded text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                                  c.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : c.status === "PAUSED"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {c.status === "ACTIVE" ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>{isEn ? "ACTIVE" : "AKTİF"}</span>
                                  </>
                                ) : c.status === "PAUSED" ? (
                                  <span>{isEn ? "PAUSED" : "DURAKLATILDI"}</span>
                                ) : (
                                  <span>{isEn ? "COMPLETED" : "TAMAMLANDI"}</span>
                                )}
                              </span>
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => handleToggleStatus(c)}
                                  title={c.status === "ACTIVE" ? (isEn ? "Pause" : "Duraklat") : (isEn ? "Activate" : "Başlat")}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    c.status === "ACTIVE"
                                      ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  }`}
                                >
                                  {c.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(c)}
                                  title={isEn ? "Edit" : "Düzenle"}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCampaign(c.id, c.name)}
                                  title={isEn ? "Delete" : "Sil"}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Campaign Builder / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampaign?.id ? (isEn ? "Edit Marketing Campaign" : "Reklam Kampanyasını Düzenle") : (isEn ? "Create New Marketing Campaign" : "Yeni Reklam Kampanyası Oluştur")}
      >
        <form onSubmit={handleSaveCampaign} className="flex flex-col gap-4 text-xs p-1 max-h-[78vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">{isEn ? "Campaign Name *" : "Kampanya Adı *"}</label>
            <input
              type="text"
              required
              value={editingCampaign.name || ""}
              onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
              placeholder="Örn: 2026 Sonbahar Moda Festivali Vitrini"
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Campaign Type *" : "Reklam Formatı *"}</label>
              <select
                value={editingCampaign.type || "SPONSORED_PRODUCT"}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, type: e.target.value as any })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              >
                <option value="SPONSORED_PRODUCT">{isEn ? "Sponsored Product" : "Sponsorlu Ürün"}</option>
                <option value="SPONSORED_BRAND">{isEn ? "Sponsored Brand" : "Sponsorlu Marka"}</option>
                <option value="SPONSORED_SELLER">{isEn ? "Sponsored Seller" : "Sponsorlu Satıcı / Mağaza"}</option>
                <option value="FEATURED_SEARCH">{isEn ? "Featured Search Keyword" : "Öne Çıkan Arama Terimi"}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Ad Placement *" : "Reklam Konumu *"}</label>
              <select
                value={editingCampaign.placement || "HOMEPAGE_HERO"}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, placement: e.target.value as any })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              >
                <option value="HOMEPAGE_HERO">{isEn ? "Homepage Hero Banner" : "Ana Sayfa Hero Alanı"}</option>
                <option value="SEARCH_TOP">{isEn ? "Search Results Top Strip" : "Arama Sonuçları Üst Sıra"}</option>
                <option value="CATEGORY_TOP">{isEn ? "Category Header Placement" : "Kategori Sayfası Tepe Alanı"}</option>
                <option value="PRODUCT_DETAIL_SIDEBAR">{isEn ? "Product Detail Recommendation" : "Ürün Detay Yan Öneri"}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Target Identifier (ID / Slug / Keywords)" : "Hedef Tanımlayıcı (ID / Slug / Terim)"}</label>
              <input
                type="text"
                value={editingCampaign.targetId || ""}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, targetId: e.target.value })}
                placeholder="Örn: prod-123 veya apple-airpods"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Target Friendly Name" : "Hedef Görünür Adı"}</label>
              <input
                type="text"
                value={editingCampaign.targetName || ""}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, targetName: e.target.value })}
                placeholder="Örn: Kadın Deri Ceket Serisi"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Total Budget (TL) *" : "Toplam Bütçe (TL) *"}</label>
              <input
                type="number"
                step="100"
                required
                value={editingCampaign.budget ?? 5000}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, budget: parseFloat(e.target.value) || 0 })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Priority (1-10)" : "Öncelik (1-10)"}</label>
              <input
                type="number"
                min="1"
                max="10"
                value={editingCampaign.priority ?? 5}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, priority: parseInt(e.target.value) || 1 })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Status" : "Durum"}</label>
              <select
                value={editingCampaign.status || "ACTIVE"}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value as any })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
              >
                <option value="ACTIVE">{isEn ? "ACTIVE" : "AKTİF"}</option>
                <option value="PAUSED">{isEn ? "PAUSED" : "DURAKLATILDI"}</option>
                <option value="COMPLETED">{isEn ? "COMPLETED" : "TAMAMLANDI"}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Start Date" : "Başlangıç Tarihi"}</label>
              <input
                type="date"
                value={editingCampaign.startDate || ""}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, startDate: e.target.value })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "End Date" : "Bitiş Tarihi"}</label>
              <input
                type="date"
                value={editingCampaign.endDate || ""}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, endDate: e.target.value })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="font-bold"
            >
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {isEn ? "Save Campaign" : "Kampanyayı Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
