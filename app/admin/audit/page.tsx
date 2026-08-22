"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { FileText, ShieldAlert, Filter, Clock, UserCheck, Search, Activity } from "lucide-react";
import { Footer } from "@/components/layout/footer";

interface AuditLogItem {
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

export default function AdminAuditPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit");
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
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterType === "ALL" || log.entityType === filterType;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.entityId && log.entityId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
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
                      {isEn ? "Administrative Security Audit Trail" : "Sistem Denetim & Güvenlik Kayıtları"}
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isEn
                        ? "Immutable audit trail of administrative events, status changes, seller approvals, and configuration mutations."
                        : "Yönetici işlemleri, satıcı onayları, moderasyon ve sistem ayarı değişikliklerinin kayıtları."}
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
                    placeholder={isEn ? "Search by action or actor..." : "İşlem veya kullanıcı ara..."}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-purple-500"
                  >
                    <option value="ALL">{isEn ? "All Entities" : "Tüm Varlıklar"}</option>
                    <option value="BRAND">BRAND (Marka)</option>
                    <option value="CMS">CMS (Vitrin)</option>
                    <option value="SELLER">SELLER (Satıcı)</option>
                    <option value="PRODUCT">PRODUCT (Ürün)</option>
                    <option value="SETTINGS">SETTINGS (Ayarlar)</option>
                  </select>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
                {loading ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
                    {isEn ? "Loading audit logs..." : "Denetim kayıtları yükleniyor..."}
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="font-bold text-sm text-slate-300">
                      {isEn ? "No Audit Events Logged" : "Denetim Kaydı Bulunmuyor"}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {isEn ? "Administrative actions will automatically appear here." : "Yönetici işlemleri gerçekleştiğinde burada listelenecektir."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-[11px]">
                              {log.action}
                            </span>
                            <span className="font-bold text-slate-300 uppercase text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                              {log.entityType}
                            </span>
                            {log.actorEmail && (
                              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                {log.actorEmail} ({log.actorRole})
                              </span>
                            )}
                          </div>

                          <p className="text-slate-400 font-mono text-[11px] break-all">
                            Metadata: {log.metadataJson}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0 self-end sm:self-center">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(log.createdAt).toLocaleString(isEn ? "en-US" : "tr-TR")}</span>
                        </div>
                      </div>
                    ))}
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
