"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import { MediaPickerModal } from "@/components/admin/media/media-picker-modal";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileImage,
  RefreshCw,
} from "lucide-react";

export default function AdminMediaPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.assets && Array.isArray(data.assets)) {
        setAssets(data.assets);
      }
    } catch (e) {
      console.warn("Failed to fetch assets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) fetchAssets();
    } catch (e) {
      console.error("Delete media error:", e);
    }
  };

  const filtered = assets.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.filename && a.filename.toLowerCase().includes(q)) ||
      (a.altTextTr && a.altTextTr.toLowerCase().includes(q))
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
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Media Assets & Usage Manager" : "Görsel Kütüphanesi & Medya Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage uploaded image files, responsive banners, usage references, and asset storage."
                    : "Yüklenen görselleri, afişleri, kullanım referanslarını ve depolamayı yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsPickerOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              <span>{isEn ? "Upload Media" : "Yeni Görsel Yükle"}</span>
            </Button>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search assets..." : "Görsel ara..."}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filtered.length} {isEn ? "assets" : "görsel"}
            </span>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col group hover:shadow-md transition-all"
              >
                <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="max-h-full max-w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="p-3 flex flex-col gap-1">
                  <span className="font-bold text-xs text-slate-900 truncate">{asset.filename}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {asset.width}x{asset.height} • {asset.mimeType}
                  </span>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1 text-xs">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDelete(asset.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <FileImage className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs font-medium">
                  {isEn ? "No media assets uploaded yet." : "Henüz görsel yüklenmedi."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={() => fetchAssets()}
        isEn={isEn}
      />
    </div>
  );
}
