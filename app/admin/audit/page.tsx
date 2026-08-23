"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  FileText,
  ShieldAlert,
  Filter,
  Clock,
  UserCheck,
  Search,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Tag,
  Layers,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";

export interface AuditLogItem {
  id: string;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadataJson: string;
  ipAddress?: string | null;
  createdAt: string;
}

const ENTITY_TYPE_OPTIONS = [
  { value: "ALL", labelTr: "Tüm Varlıklar (Hepsi)", labelEn: "All Entities" },
  { value: "PRODUCT", labelTr: "PRODUCT (Ürünler)", labelEn: "PRODUCT (Products)" },
  { value: "ORDER", labelTr: "ORDER (Siparişler & Kargo)", labelEn: "ORDER (Orders & Logistics)" },
  { value: "SELLER", labelTr: "SELLER (Satıcı Mağazalar)", labelEn: "SELLER (Merchants)" },
  { value: "CUSTOMER", labelTr: "CUSTOMER (Müşteriler)", labelEn: "CUSTOMER (Customers)" },
  { value: "CATEGORY", labelTr: "CATEGORY (Kategoriler)", labelEn: "CATEGORY (Categories)" },
  { value: "BRAND", labelTr: "BRAND (Markalar)", labelEn: "BRAND (Brands)" },
  { value: "COUPON", labelTr: "COUPON (Kuponlar)", labelEn: "COUPON (Coupons)" },
  { value: "RETURN", labelTr: "RETURN (İadeler & Talepler)", labelEn: "RETURN (Returns)" },
  { value: "CMS_SECTION", labelTr: "CMS_SECTION (Vitrin Bölümleri)", labelEn: "CMS_SECTION (Homepage Sections)" },
  { value: "BANNER", labelTr: "BANNER (Kampanya Bannerları)", labelEn: "BANNER (Banners)" },
  { value: "CAMPAIGN", labelTr: "CAMPAIGN (Pazarlama Reklamları)", labelEn: "CAMPAIGN (Marketing Campaigns)" },
  { value: "NAVIGATION", labelTr: "NAVIGATION (Menü & Linkler)", labelEn: "NAVIGATION (Navigation Items)" },
  { value: "MEDIA", labelTr: "MEDIA (Görsel Kütüphanesi)", labelEn: "MEDIA (Media Assets)" },
  { value: "SETTINGS", labelTr: "SETTINGS (Platform Ayarları)", labelEn: "SETTINGS (Global Settings)" },
];

export default function AdminAuditPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const url = filterType && filterType !== "ALL" ? `/api/admin/audit?entityType=${filterType}` : "/api/admin/audit";
      const res = await fetch(url);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filterType]);

  const toggleExpand = (id: string) => {
    setExpandedLogIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const parseMetadata = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return { raw: jsonStr };
    }
  };

  const renderDiffOrMetadata = (metadata: any) => {
    // Check if diff object is present or if top-level keys have before/after
    const diffObj = metadata?.diff || (metadata && typeof metadata === "object" && Object.values(metadata).some((v: any) => v && typeof v === "object" && ("before" in v || "after" in v)) ? metadata : null);

    if (diffObj && typeof diffObj === "object") {
      const entries = Object.entries(diffObj).filter(([_, val]) => val && typeof val === "object" && ("before" in (val as any) || "after" in (val as any)));

      if (entries.length > 0) {
        return (
          <div className="mt-2.5 p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300">
              <Code2 className="w-3.5 h-3.5" />
              <span>{isEn ? "Audit Trail Field Modifications (Before → After Diff):" : "Değişiklik Detayları (Önceki Değer → Yeni Değer):"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {entries.map(([field, delta]: [string, any]) => (
                <div key={field} className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-xs flex flex-col gap-1 font-mono">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field}</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 line-through">
                      {String(delta.before ?? "null")}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold">
                      {String(delta.after ?? "null")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }

    // Default clean key-value summary
    return (
      <div className="mt-2 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 flex flex-wrap gap-x-4 gap-y-1">
        {Object.entries(metadata).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="text-slate-500">{key}:</span>
            <span className="text-slate-200 font-semibold">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
          </div>
        ))}
      </div>
    );
  };

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.entityType.toLowerCase().includes(query) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(query)) ||
      (log.entityId && log.entityId.toLowerCase().includes(query)) ||
      log.metadataJson.toLowerCase().includes(query)
    );
  });

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
              {/* Header Card */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-white">
                      {isEn ? "Immutable Administrative Security Audit Trail" : "Sistem Denetim & Güvenlik Kayıtları"}
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isEn
                        ? "Immutable audit trail of administrative mutations, before/after diffs, and security events across all entities."
                        : "Yönetici işlemleri, fiyat ve stok değişiklikleri, satıcı onayları ve sistem mutasyonlarının kalıcı kayıtları."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEn ? "Search by action, actor, entity ID, or metadata..." : "İşlem, kullanıcı, varlık ID veya metadatada ara..."}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    {ENTITY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {isEn ? opt.labelEn : opt.labelTr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logs Feed / Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
                {loading ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
                    {isEn ? "Loading security audit records..." : "Denetim kayıtları yükleniyor..."}
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="font-bold text-sm text-slate-300">
                      {isEn ? "No Audit Events Logged" : "Denetim Kaydı Bulunmuyor"}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {isEn ? "Administrative actions and before/after diffs will automatically appear here." : "Yönetici işlemleri gerçekleştiğinde burada listelenecektir."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {filteredLogs.map((log) => {
                      const metadata = parseMetadata(log.metadataJson);
                      const isExpanded = expandedLogIds[log.id];

                      return (
                        <div
                          key={log.id}
                          className="p-4 sm:p-5 flex flex-col gap-2.5 hover:bg-slate-900/40 transition-colors text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded text-[11px]">
                                {log.action}
                              </span>

                              <span className="font-bold text-slate-300 uppercase text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                                {log.entityType}
                              </span>

                              {log.entityId && (
                                <span className="font-mono text-slate-400 text-[10px]">
                                  ID: {log.entityId}
                                </span>
                              )}

                              {log.actorEmail && (
                                <span className="text-slate-300 flex items-center gap-1 text-[11px] font-medium">
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>{log.actorEmail}</span>
                                  <span className="text-slate-500 text-[10px]">({log.actorRole || "ADMIN"})</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0 self-end sm:self-center">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>{new Date(log.createdAt).toLocaleString(isEn ? "en-US" : "tr-TR")}</span>
                            </div>
                          </div>

                          {/* Visual Diff or Formatted Metadata */}
                          {renderDiffOrMetadata(metadata)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
