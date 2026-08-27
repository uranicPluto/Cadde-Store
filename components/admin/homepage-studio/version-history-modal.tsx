"use client";

import React, { useState, useEffect } from "react";
import { SectionItem } from "@/lib/cms/cms-types";
import { Button } from "@/components/ui/button";
import {
  History,
  RotateCcw,
  X,
  Calendar,
  User,
  Layers,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export interface VersionRecord {
  id: string;
  versionNumber: number;
  snapshotJson: string;
  changeSummary?: string | null;
  authorEmail?: string | null;
  publishedAt: string;
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSnapshot: (sections: SectionItem[], versionNumber: number) => void;
  isEn?: boolean;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  onRestoreSnapshot,
  isEn = false,
}) => {
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<VersionRecord | null>(null);
  const [restoring, setRestoring] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cms/homepage/versions");
      if (!res.ok) throw new Error("Sürüm geçmisi alinamadi.");
      const data = await res.json();
      if (data.versions && Array.isArray(data.versions)) {
        setVersions(data.versions);
        if (data.versions[0]) {
          setSelectedVersion(data.versions[0]);
        }
      }
    } catch (e: any) {
      setError(e.message || "Sürüm geçmisi yüklenirken hata olustu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const parsedSections: SectionItem[] = selectedVersion?.snapshotJson
    ? (() => {
        try {
          return JSON.parse(selectedVersion.snapshotJson);
        } catch {
          return [];
        }
      })()
    : [];

  const handleRestore = async (ver: VersionRecord) => {
    setRestoring(true);
    try {
      const sections: SectionItem[] = JSON.parse(ver.snapshotJson);
      onRestoreSnapshot(sections, ver.versionNumber);
      onClose();
    } catch (e) {
      console.error("Snapshot parse failed during restore:", e);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {isEn ? "Homepage Version History & Snapshots" : "Ana Sayfa Sürüm Geçmisi & Snapshotlar"}
              </h2>
              <p className="text-xs text-slate-400">
                {isEn
                  ? "Browse past published versions and restore any historical snapshot."
                  : "Daha önce yayinlanan sürümleri inceleyin ve istediginiz ana sayfa snapshotini geri yükleyin."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: 2 columns (Snapshot List + Snapshot Preview) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Version Snapshot List */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-950/30">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400">
                {isEn ? "Loading versions..." : "Sürümler yükleniyor..."}
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                {error}
              </div>
            ) : versions.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">
                {isEn ? "No published versions found." : "Henüz yayinlanmis sürüm kaydi bulunmuyor."}
              </div>
            ) : (
              versions.map((ver, idx) => {
                const isSelected = selectedVersion?.id === ver.id;
                const isLatest = idx === 0;

                let secCount = 0;
                try {
                  const arr = JSON.parse(ver.snapshotJson);
                  if (Array.isArray(arr)) secCount = arr.length;
                } catch {}

                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/40"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-black font-mono">
                          v{ver.versionNumber}
                        </span>
                        {isLatest && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {isEn ? "LATEST LIVE" : "CANLI"}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(ver.publishedAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-200 truncate">
                      {ver.changeSummary || (isEn ? "Storefront publish update" : "Vitrin yayin güncellemesi")}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <User className="w-3 h-3 text-slate-500" />
                        {ver.authorEmail || "admin"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-400">
                        <Layers className="w-3 h-3 text-slate-500" />
                        {secCount} {isEn ? "sections" : "bölüm"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Snapshot Inspection & Restoration View */}
          <div className="md:col-span-7 flex flex-col justify-between p-6 overflow-y-auto bg-slate-900">
            {selectedVersion ? (
              <div className="flex flex-col gap-6">
                {/* Version Overview Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">
                        Sürüm #{selectedVersion.versionNumber}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({new Date(selectedVersion.publishedAt).toLocaleString("tr-TR")})
                      </span>
                    </div>
                    <span className="text-xs text-indigo-400 font-bold">
                      {parsedSections.length} {isEn ? "Sections" : "Bölüm"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong>{isEn ? "Summary: " : "Açiklama: "}</strong>
                    {selectedVersion.changeSummary || (isEn ? "Homepage visual update" : "Ana sayfa vitrin güncellemesi")}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{isEn ? "Published by:" : "Yayinlayan:"}</span>
                    <strong className="text-slate-200">{selectedVersion.authorEmail || "Yönetici"}</strong>
                  </div>
                </div>

                {/* Section Composition in this snapshot */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isEn ? "Section Composition in this Snapshot" : "Bu Sürümdeki Bölüm Yapisi"}
                  </span>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {parsedSections.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-200">
                            {sec.titleTR || sec.titleEN || sec.type}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono text-[9px]">
                          {sec.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restore Callout Button */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="text-xs font-bold bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    {isEn ? "Cancel" : "Kapat"}
                  </Button>
                  <Button
                    type="button"
                    disabled={restoring}
                    onClick={() => handleRestore(selectedVersion)}
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    <span>
                      {restoring
                        ? isEn ? "Restoring..." : "Geri Yükleniyor..."
                        : isEn
                        ? `Restore v${selectedVersion.versionNumber} to Canvas`
                        : `v${selectedVersion.versionNumber} Sürümünü Stüdyoya Geri Yükle`}
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-slate-500">
                {isEn ? "Select a version to inspect details." : "Detaylari görmek için sol listeden bir sürüm seçin."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
