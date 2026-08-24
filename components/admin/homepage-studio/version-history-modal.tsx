"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { HomepageVersionItem } from "@/lib/cms/cms-types";
import { History, RotateCcw, Clock, User, CheckCircle2, AlertCircle } from "lucide-react";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess: () => void;
  isEn?: boolean;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
  isEn = false,
}) => {
  const [versions, setVersions] = useState<HomepageVersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/homepage/versions");
      if (res.ok) {
        const data = await res.json();
        if (data.versions) {
          setVersions(data.versions);
        }
      }
    } catch (e) {
      console.error("Failed to load versions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen]);

  const handleRollback = async (versionId: string, versionNumber: number) => {
    if (
      !confirm(
        isEn
          ? `Roll back homepage to Version v${versionNumber}?`
          : `Ana sayfayı v${versionNumber} sürümüne geri yüklemek istediğinize emin misiniz?`
      )
    ) {
      return;
    }

    setRestoringId(versionId);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/cms/homepage/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });

      if (res.ok) {
        onRestoreSuccess();
        onClose();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Geri yükleme başarısız oldu.");
      }
    } catch (e) {
      console.error("Rollback error:", e);
      setErrorMsg(isEn ? "Failed to restore version." : "Sürüm geri yüklenirken hata oluştu.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Homepage Version History & Rollback" : "Ana Sayfa Sürüm Geçmişi & Geri Yükleme"}
      size="lg"
    >
      <div className="flex flex-col gap-4 text-xs">
        <p className="text-slate-500 font-medium">
          {isEn
            ? "Every time you publish, an immutable snapshot version is created. You can roll back to any past version safely."
            : "Her yayınladığınızda kalıcı bir sürüm anlık görüntüsü oluşturulur. İstediğiniz önceki sürüme güvenle geri dönebilirsiniz."}
        </p>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-400">
            {isEn ? "Loading version history..." : "Sürüm geçmişi yükleniyor..."}
          </div>
        ) : versions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span className="font-bold">{isEn ? "No published versions yet." : "Henüz yayınlanmış bir sürüm bulunmuyor."}</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-1">
            {versions.map((ver, idx) => {
              let sectionCount = 0;
              try {
                const parsed = JSON.parse(ver.snapshotJson);
                sectionCount = Array.isArray(parsed) ? parsed.length : 0;
              } catch (e) {}

              return (
                <div
                  key={ver.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shrink-0 ${
                        idx === 0
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      v{ver.versionNumber}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {isEn ? `Version ${ver.versionNumber}` : `Sürüm ${ver.versionNumber}`}
                        </span>
                        {idx === 0 && (
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {isEn ? "CURRENT LIVE" : "CANLI YAYINDA"}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-600 font-medium">{ver.changeSummary || "Vitrin güncellemesi"}</span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ver.publishedAt).toLocaleString(isEn ? "en-US" : "tr-TR")}
                        </span>
                        {ver.authorEmail && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ver.authorEmail}
                          </span>
                        )}
                        <span>• {sectionCount} {isEn ? "Sections" : "Bölüm"}</span>
                      </div>
                    </div>
                  </div>

                  {idx !== 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={restoringId === ver.id}
                      onClick={() => handleRollback(ver.id, ver.versionNumber)}
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold shrink-0"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 mr-1 ${restoringId === ver.id ? "animate-spin" : ""}`} />
                      <span>{restoringId === ver.id ? (isEn ? "Restoring..." : "Yükleniyor...") : (isEn ? "Restore" : "Geri Yükle")}</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
