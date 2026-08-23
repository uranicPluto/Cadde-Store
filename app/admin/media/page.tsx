"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Footer } from "@/components/layout/footer";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  Eye,
  Grid,
  List,
  CheckCircle2,
  FileImage,
  UploadCloud,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  Info,
} from "lucide-react";

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  altTextTr?: string | null;
  altTextEn?: string | null;
  tags?: string | null; // JSON string or comma-separated
  referenceCount: number;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt?: string;
}

const DEFAULT_SAMPLE_MEDIA: MediaAsset[] = [
  {
    id: "med-1",
    filename: "autumn-hero-banner-1200x500.webp",
    url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    mimeType: "image/webp",
    sizeBytes: 245760,
    width: 1200,
    height: 500,
    altTextTr: "Sonbahar Kadın Moda Festivali",
    altTextEn: "Autumn Women Fashion Festival",
    tags: "hero, banner, women, fashion, autumn",
    referenceCount: 4,
    uploadedBy: "admin@cadde.store",
    createdAt: "2026-08-20T10:15:00.000Z",
  },
  {
    id: "med-2",
    filename: "nike-air-max-sneaker-front.jpg",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    mimeType: "image/jpeg",
    sizeBytes: 184320,
    width: 800,
    height: 800,
    altTextTr: "Nike Air Max Kırmızı Spor Ayakkabı",
    altTextEn: "Nike Air Max Red Sneaker",
    tags: "product, shoe, nike, sports",
    referenceCount: 12,
    uploadedBy: "seller-nike@cadde.store",
    createdAt: "2026-08-18T14:22:00.000Z",
  },
  {
    id: "med-3",
    filename: "apple-macbook-pro-m3.png",
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    mimeType: "image/png",
    sizeBytes: 412900,
    width: 800,
    height: 600,
    altTextTr: "Apple MacBook Pro Uzay Grisi",
    altTextEn: "Apple MacBook Pro Space Gray",
    tags: "electronics, apple, laptop",
    referenceCount: 6,
    uploadedBy: "admin@cadde.store",
    createdAt: "2026-08-15T09:00:00.000Z",
  },
  {
    id: "med-4",
    filename: "coffee-maker-kitchen-deluxe.jpg",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    mimeType: "image/jpeg",
    sizeBytes: 156000,
    width: 800,
    height: 800,
    altTextTr: "Karaca Filtre Kahve Makinesi",
    altTextEn: "Karaca Deluxe Coffee Machine",
    tags: "kitchen, home, coffee",
    referenceCount: 3,
    uploadedBy: "seller-karaca@cadde.store",
    createdAt: "2026-08-12T11:45:00.000Z",
  },
  {
    id: "med-5",
    filename: "cadde-store-vector-logo.svg",
    url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    mimeType: "image/svg+xml",
    sizeBytes: 18400,
    width: 400,
    height: 120,
    altTextTr: "Cadde Store Resmi Logo",
    altTextEn: "Cadde Store Official Vector Logo",
    tags: "branding, logo, vector",
    referenceCount: 28,
    uploadedBy: "admin@cadde.store",
    createdAt: "2026-08-01T08:00:00.000Z",
  },
];

export default function AdminMediaPage() {
  const { language, t } = useLanguage();
  const isEn = language === "en";

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [mimeFilter, setMimeFilter] = useState<string>("ALL");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [newAsset, setNewAsset] = useState<Partial<MediaAsset>>({
    filename: "",
    url: "",
    mimeType: "image/jpeg",
    sizeBytes: 150000,
    width: 800,
    height: 600,
    altTextTr: "",
    altTextEn: "",
    tags: "",
    referenceCount: 0,
  });

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        if (data.assets && data.assets.length > 0) {
          setAssets(data.assets);
          return;
        }
      }
      setAssets(DEFAULT_SAMPLE_MEDIA);
    } catch (e) {
      console.warn("Media fetch error, using sample data:", e);
      setAssets(DEFAULT_SAMPLE_MEDIA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showFeedback(isEn ? "Media URL copied to clipboard!" : "Görsel URL'si panoya kopyalandı!");
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.filename || !newAsset.url) return;

    try {
      setActionLoading(true);
      const payload = {
        ...newAsset,
        sizeBytes: Number(newAsset.sizeBytes || 100000),
        width: Number(newAsset.width || 800),
        height: Number(newAsset.height || 600),
        referenceCount: 0,
        uploadedBy: "admin@cadde.store",
      };

      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const localCreated: MediaAsset = {
          ...(payload as MediaAsset),
          id: `med-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setAssets([localCreated, ...assets]);
      } else {
        await fetchMedia();
      }

      showFeedback(isEn ? "Asset registered in library" : "Yeni görsel kütüphaneye eklendi");
      setIsAddModalOpen(false);
      setNewAsset({
        filename: "",
        url: "",
        mimeType: "image/jpeg",
        sizeBytes: 150000,
        width: 800,
        height: 600,
        altTextTr: "",
        altTextEn: "",
        tags: "",
      });
    } catch (err) {
      console.error("Create media asset error:", err);
      showFeedback(isEn ? "Failed to add asset" : "Görsel eklenemedi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAsset = async (id: string, filename: string) => {
    if (!confirm(isEn ? `Delete asset "${filename}"?` : `"${filename}" dosyasını kütüphaneden silmek istediğinize emin misiniz?`)) return;
    try {
      setActionLoading(true);
      await fetch(`/api/media/${id}`, { method: "DELETE" });
      setAssets(assets.filter((a) => a.id !== id));
      showFeedback(isEn ? "Asset deleted" : "Görsel silindi");
    } catch (err) {
      console.error("Delete media error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.filename.toLowerCase().includes(search.toLowerCase()) ||
      (a.altTextTr && a.altTextTr.toLowerCase().includes(search.toLowerCase())) ||
      (a.tags && a.tags.toLowerCase().includes(search.toLowerCase()));

    const matchesMime = mimeFilter === "ALL" || a.mimeType === mimeFilter;

    return matchesSearch && matchesMime;
  });

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
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{isEn ? "Centralized Media & Visual Asset Library" : "Medya & Görsel Kütüphanesi"}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {assets.length} {isEn ? "Assets" : "Görsel"}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {isEn
                      ? "Search, preview, and copy URLs for high-resolution banners, product images, and brand logos."
                      : "Banner, ürün ve marka görsellerini arayın, önizleyin ve platform genelinde kullanmak için URL kopyalayın."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>{isEn ? "Add / Upload Asset" : "Yeni Görsel Ekle"}</span>
                </Button>
              </div>
            </div>

            {/* Filter & View Mode Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                <div className="relative flex-1 sm:max-w-xs">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isEn ? "Search by filename, tags..." : "Dosya adı, etiket ara..."}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="w-44">
                  <select
                    value={mimeFilter}
                    onChange={(e) => setMimeFilter(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="ALL">{isEn ? "All File Types" : "Tüm Dosya Tipleri"}</option>
                    <option value="image/jpeg">JPEG (.jpg, .jpeg)</option>
                    <option value="image/png">PNG (.png)</option>
                    <option value="image/webp">WEBP (.webp)</option>
                    <option value="image/svg+xml">SVG Vector (.svg)</option>
                  </select>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === "grid" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-400 hover:text-slate-700"
                  }`}
                  title={isEn ? "Grid View" : "Izgara Görünümü"}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === "table" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-400 hover:text-slate-700"
                  }`}
                  title={isEn ? "Table View" : "Tablo Görünümü"}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Asset Content: Grid vs Table */}
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                {isEn ? "Loading media assets..." : "Medya kütüphanesi yükleniyor..."}
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
                <FileImage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-sm text-slate-700">{isEn ? "No media assets found" : "Görsel bulunamadı"}</p>
                <p className="mt-1 text-slate-400">
                  {isEn ? "Try adjusting your search or upload a new asset." : "Farklı bir arama yapın veya yeni bir görsel ekleyin."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail Preview */}
                      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                        <img
                          src={asset.url}
                          alt={asset.altTextTr || asset.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-[9px] px-2 py-0.5 rounded backdrop-blur-xs">
                          {asset.mimeType.replace("image/", "").toUpperCase()}
                        </span>

                        <span className="absolute top-2 right-2 bg-indigo-600 text-white font-black text-[9px] px-2 py-0.5 rounded shadow-xs">
                          {asset.referenceCount} {isEn ? "uses" : "kullanım"}
                        </span>

                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewAsset(asset)}
                            className="p-2 rounded-lg bg-white/90 text-slate-900 hover:bg-white transition-colors"
                            title={isEn ? "View Preview" : "Önizle"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(asset.url)}
                            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                            title={isEn ? "Copy URL" : "URL Kopyala"}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-3.5 flex flex-col gap-1.5 text-xs">
                        <span className="font-extrabold text-slate-900 truncate" title={asset.filename}>
                          {asset.filename}
                        </span>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{asset.width && asset.height ? `${asset.width}x${asset.height} px` : "—"}</span>
                          <span>{formatFileSize(asset.sizeBytes)}</span>
                        </div>

                        {asset.tags && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate pt-1">
                            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{asset.tags}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(asset.url)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isEn ? "Copy URL" : "URL Kopyala"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(asset.id, asset.filename)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title={isEn ? "Delete" : "Sil"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{isEn ? "Thumbnail & Filename" : "Görsel & Dosya Adı"}</th>
                      <th className="p-3">{isEn ? "MIME & Dimensions" : "Tip & Boyut"}</th>
                      <th className="p-3">{isEn ? "File Size" : "Boyut (KB)"}</th>
                      <th className="p-3">{isEn ? "References" : "Kullanım"}</th>
                      <th className="p-3">{isEn ? "Upload Date" : "Yükleme Tarihi"}</th>
                      <th className="p-3 text-right">{isEn ? "Actions" : "İşlemler"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={asset.url}
                              alt=""
                              className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0 cursor-pointer"
                              onClick={() => setPreviewAsset(asset)}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-slate-900 truncate max-w-xs">{asset.filename}</span>
                              <span className="text-[10px] text-slate-400 truncate">{asset.altTextTr || asset.altTextEn || "—"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-col font-mono text-[11px]">
                            <span className="font-bold text-slate-700">{asset.mimeType}</span>
                            <span className="text-slate-400">{asset.width && asset.height ? `${asset.width}x${asset.height} px` : "—"}</span>
                          </div>
                        </td>

                        <td className="p-3 font-semibold text-slate-700">{formatFileSize(asset.sizeBytes)}</td>

                        <td className="p-3">
                          <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded">
                            {asset.referenceCount} {isEn ? "places" : "yerde"}
                          </span>
                        </td>

                        <td className="p-3 text-slate-500 text-[11px]">
                          {new Date(asset.createdAt).toLocaleDateString("tr-TR")}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(asset.url)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                              title={isEn ? "Copy URL" : "URL Kopyala"}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewAsset(asset)}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                              title={isEn ? "Preview" : "Önizle"}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAsset(asset.id, asset.filename)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                              title={isEn ? "Delete" : "Sil"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add New Asset Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEn ? "Register New Media Asset" : "Yeni Görsel Varlığı Ekle"}
      >
        <form onSubmit={handleCreateAsset} className="flex flex-col gap-4 text-xs p-1">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">{isEn ? "File Name *" : "Dosya Adı *"}</label>
            <input
              type="text"
              required
              value={newAsset.filename || ""}
              onChange={(e) => setNewAsset({ ...newAsset, filename: e.target.value })}
              placeholder="Örn: summer-sale-campaign-banner.jpg"
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">{isEn ? "Direct Image URL *" : "Görsel Doğrudan URL'si *"}</label>
            <input
              type="url"
              required
              value={newAsset.url || ""}
              onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "MIME Type" : "Dosya Formatı"}</label>
              <select
                value={newAsset.mimeType || "image/jpeg"}
                onChange={(e) => setNewAsset({ ...newAsset, mimeType: e.target.value })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              >
                <option value="image/jpeg">image/jpeg</option>
                <option value="image/png">image/png</option>
                <option value="image/webp">image/webp</option>
                <option value="image/svg+xml">image/svg+xml</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Width (px)" : "Genişlik (px)"}</label>
              <input
                type="number"
                value={newAsset.width ?? 1200}
                onChange={(e) => setNewAsset({ ...newAsset, width: parseInt(e.target.value) || 0 })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Height (px)" : "Yükseklik (px)"}</label>
              <input
                type="number"
                value={newAsset.height ?? 500}
                onChange={(e) => setNewAsset({ ...newAsset, height: parseInt(e.target.value) || 0 })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Alt Text (TR)" : "Alt Açıklama (Türkçe)"}</label>
              <input
                type="text"
                value={newAsset.altTextTr || ""}
                onChange={(e) => setNewAsset({ ...newAsset, altTextTr: e.target.value })}
                placeholder="Örn: Yaz Sezonu İndirim Afişi"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">{isEn ? "Tags (comma separated)" : "Etiketler (virgülle ayırın)"}</label>
              <input
                type="text"
                value={newAsset.tags || ""}
                onChange={(e) => setNewAsset({ ...newAsset, tags: e.target.value })}
                placeholder="banner, summer, sale, fashion"
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
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
              {isEn ? "Save to Library" : "Kütüphaneye Ekle"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lightbox / Preview Modal */}
      <Modal
        isOpen={Boolean(previewAsset)}
        onClose={() => setPreviewAsset(null)}
        title={previewAsset?.filename || "Preview"}
      >
        {previewAsset && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-[60vh]">
              <img src={previewAsset.url} alt="" className="max-w-full max-h-[55vh] object-contain" />
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold">{isEn ? "Dimensions:" : "Çözünürlük:"}</span>{" "}
                <strong>{previewAsset.width}x{previewAsset.height} px</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">{isEn ? "Size:" : "Boyut:"}</span>{" "}
                <strong>{formatFileSize(previewAsset.sizeBytes)}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">MIME:</span>{" "}
                <strong className="font-mono">{previewAsset.mimeType}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">{isEn ? "References:" : "Kullanım:"}</span>{" "}
                <strong>{previewAsset.referenceCount} {isEn ? "places" : "nokta"}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyUrl(previewAsset.url)}
                className="font-bold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isEn ? "Copy Public URL" : "URL Kopyala"}</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setPreviewAsset(null)}
                className="bg-indigo-600 text-white font-bold"
              >
                {isEn ? "Close" : "Kapat"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
