"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  X,
  ExternalLink,
  Trash2,
  Sparkles,
  Layers,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileImage,
  RefreshCw,
} from "lucide-react";

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: any) => void;
  currentUrl?: string;
  title?: string;
  isEn?: boolean;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentUrl = "",
  title,
  isEn: propIsEn,
}) => {
  const { language } = useLanguage();
  const isEn = propIsEn !== undefined ? propIsEn : language === "en";

  const [activeTab, setActiveTab] = useState<"library" | "upload" | "url">("library");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssetUrl, setSelectedAssetUrl] = useState(currentUrl);
  const [customUrl, setCustomUrl] = useState(currentUrl);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media?limit=50");
      const data = await res.json();
      if (data.assets && Array.isArray(data.assets)) {
        setAssets(data.assets);
      }
    } catch (e) {
      console.warn("Failed to fetch media assets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedAssetUrl(currentUrl);
      setCustomUrl(currentUrl);
      fetchAssets();
      setUploadError(null);
      setUploadSuccess(false);
    }
  }, [isOpen, currentUrl]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(isEn ? "File size exceeds 10MB limit." : "Dosya boyutu 10MB sınırını aşıyor.");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/") && file.type !== "video/mp4") {
      setUploadError(isEn ? "Only image files and MP4 videos are allowed." : "Yalnızca görsel dosyaları ve MP4 videoları yüklenebilir.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altTextTr", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("altTextEn", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("tags", JSON.stringify(["upload", "editor"]));

      setUploadProgress(50);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(85);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadProgress(100);
      setUploadSuccess(true);
      if (data.asset?.url) {
        setSelectedAssetUrl(data.asset.url);
        onSelect(data.asset.url, data.asset);
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || (isEn ? "Upload failed" : "Yükleme başarısız"));
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (activeTab === "url") {
      if (customUrl.trim()) {
        onSelect(customUrl.trim());
        onClose();
      }
    } else {
      if (selectedAssetUrl) {
        const found = assets.find((a) => a.url === selectedAssetUrl);
        onSelect(selectedAssetUrl, found);
        onClose();
      }
    }
  };

  const filteredAssets = assets.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.filename && a.filename.toLowerCase().includes(q)) ||
      (a.altTextTr && a.altTextTr.toLowerCase().includes(q)) ||
      (a.altTextEn && a.altTextEn.toLowerCase().includes(q))
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || (isEn ? "Select or Upload Image" : "Görsel Seç veya Yükle")}
      size="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === "library"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isEn ? "Media Library" : "Görsel Kütüphanesi"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === "upload"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isEn ? "Upload New File" : "Yeni Dosya Yükle"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === "url"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isEn ? "Direct URL / CDN" : "Harici URL / CDN"}</span>
          </button>
        </div>

        {/* TAB 1: MEDIA LIBRARY */}
        {activeTab === "library" && (
          <div className="flex flex-col gap-3">
            {/* Search toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? "Search media by name or tag..." : "Görsel adı veya etiket ara..."}
                  className="pl-8 text-xs h-8"
                />
              </div>
              <button
                type="button"
                onClick={fetchAssets}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"
                title={isEn ? "Refresh" : "Yenile"}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto p-1">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssetUrl === asset.url;

                return (
                  <div
                    key={asset.id || asset.url}
                    onClick={() => setSelectedAssetUrl(asset.url)}
                    className={`relative rounded-xl border-2 overflow-hidden aspect-square cursor-pointer group bg-slate-50 transition-all ${
                      isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-600/30 scale-[0.98]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={asset.url}
                      alt={asset.altTextTr || asset.filename || "Media"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />

                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs p-1 text-[9px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {asset.filename || "Image"}
                    </div>
                  </div>
                );
              })}

              {filteredAssets.length === 0 && !loading && (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <FileImage className="w-8 h-8 mx-auto opacity-30 mb-1" />
                  <span className="text-xs">{isEn ? "No media assets found." : "Kütüphanede görsel bulunamadı."}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DRAG & DROP FILE UPLOAD */}
        {activeTab === "upload" && (
          <div className="flex flex-col gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Upload className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-slate-800">
                  {isEn ? "Click to upload or drag & drop" : "Yüklemek için tıklayın veya dosyayı sürükleyin"}
                </span>
                <span className="text-xs text-slate-500">PNG, JPG, WEBP, GIF, SVG veya MP4 (Maks. 10MB)</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                accept="image/*,video/mp4"
                className="hidden"
              />
            </div>

            {uploading && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                  <span>{isEn ? "Uploading..." : "Yükleniyor..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isEn ? "Uploaded and selected successfully!" : "Görsel başarıyla yüklendi ve seçildi!"}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIRECT URL / CDN */}
        {activeTab === "url" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                {isEn ? "Image URL / CDN Link" : "Görsel Linki / CDN Adresi"}
              </label>
              <Input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="text-xs font-mono"
              />
            </div>

            {customUrl && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-500">Önizleme:</span>
                <div className="w-full h-40 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={customUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium truncate max-w-[300px]">
            {selectedAssetUrl ? (
              <span className="truncate flex items-center gap-1 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{selectedAssetUrl}</span>
              </span>
            ) : (
              <span>{isEn ? "No image selected" : "Görsel seçilmedi"}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSelect}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              disabled={activeTab === "url" ? !customUrl : !selectedAssetUrl}
            >
              <Check className="w-4 h-4 mr-1" />
              <span>{isEn ? "Select Image" : "Görseli Seç"}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
