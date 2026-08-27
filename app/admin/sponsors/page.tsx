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
  ExternalLink,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  TrendingUp,
} from "lucide-react";

interface SponsorItem {
  id: string;
  name: string;
  logoUrl: string;
  linkUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSponsorsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Partial<SponsorItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sponsors");
      const data = await res.json();
      if (data.sponsors && Array.isArray(data.sponsors)) {
        setSponsors(data.sponsors);
      }
    } catch (e) {
      console.warn("Failed to fetch sponsors:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleSaveSponsor = async () => {
    if (!editingSponsor?.name || !editingSponsor?.logoUrl) return;
    setSaving(true);
    try {
      const isNew = !editingSponsor.id;
      const url = isNew ? "/api/sponsors" : `/api/sponsors/${editingSponsor.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSponsor),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingSponsor(null);
        fetchSponsors();
      }
    } catch (e) {
      console.error("Save sponsor error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    try {
      const res = await fetch(`/api/sponsors/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeletingId(null);
        fetchSponsors();
      }
    } catch (e) {
      console.error("Delete sponsor error:", e);
    }
  };

  const filteredSponsors = sponsors.filter((s) => {
    if (!searchQuery.trim()) return true;
    return s.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Sponsors & Brand Partnerships" : "Sponsorlar & Marka Ortaklıkları"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage featured partner brands, campaign sponsors, and priority logo carousels."
                    : "Öne çıkan iş ortağı markaları, kampanya sponsorlarını ve vitrin logolarını yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingSponsor({
                  name: "",
                  logoUrl: "",
                  linkUrl: "",
                  priority: 0,
                  active: true,
                });
                setIsEditModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>{isEn ? "Add New Sponsor" : "Yeni Sponsor Ekle"}</span>
            </Button>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search sponsor name..." : "Sponsor adı ara..."}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filteredSponsors.length} {isEn ? "sponsors" : "sponsor"}
            </span>
          </div>

          {/* Sponsors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between gap-4 hover:shadow-md transition-all ${
                  sponsor.active ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-extrabold text-slate-900 text-sm">{sponsor.name}</h3>
                      {sponsor.linkUrl ? (
                        <a
                          href={sponsor.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <span className="truncate max-w-[150px]">{sponsor.linkUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">Bağlantı yok</span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      sponsor.active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {sponsor.active ? "AKTİF" : "PASİF"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Öncelik: <strong>{sponsor.priority}</strong></span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSponsor(sponsor);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingId(sponsor.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
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
          title={editingSponsor?.id ? (isEn ? "Edit Sponsor" : "Sponsoru Düzenle") : (isEn ? "Add New Sponsor" : "Yeni Sponsor Ekle")}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Sponsor Adı *</label>
              <Input
                value={editingSponsor?.name || ""}
                onChange={(e) => setEditingSponsor((prev) => ({ ...prev, name: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Logo Görseli *</label>
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
                value={editingSponsor?.logoUrl || ""}
                onChange={(e) => setEditingSponsor((prev) => ({ ...prev, logoUrl: e.target.value }))}
                className="text-xs font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Yönlendirme Linki</label>
              <Input
                value={editingSponsor?.linkUrl || ""}
                onChange={(e) => setEditingSponsor((prev) => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="https://... veya /category/..."
                className="text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                {isEn ? "Cancel" : "Vazgeç"}
              </Button>
              <Button
                size="sm"
                disabled={saving || !editingSponsor?.name || !editingSponsor?.logoUrl}
                onClick={handleSaveSponsor}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-1" />
                <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save Sponsor" : "Sponsoru Kaydet"}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setEditingSponsor((prev) => ({ ...prev, logoUrl: url }))}
        isEn={isEn}
      />

      {/* Delete Confirmation */}
      {deletingId && (
        <Modal
          isOpen={!!deletingId}
          onClose={() => setDeletingId(null)}
          title={isEn ? "Delete Sponsor" : "Sponsoru Sil"}
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-600">
              {isEn
                ? "Are you sure you want to delete this sponsor? This action cannot be undone."
                : "Bu sponsoru silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingId(null)}>
                {isEn ? "Cancel" : "Vazgeç"}
              </Button>
              <Button
                size="sm"
                onClick={() => handleDeleteSponsor(deletingId)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                <span>{isEn ? "Delete" : "Sil"}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
