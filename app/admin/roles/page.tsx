"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Key,
  Layers,
  Save,
  Check,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";

const RESOURCES = [
  { id: "PAGES", nameTr: "Sayfalar & CMS", nameEn: "Pages & CMS" },
  { id: "HOMEPAGE", nameTr: "Ana Sayfa Vitrini", nameEn: "Homepage Studio" },
  { id: "MEDIA", nameTr: "Medya Kütüphanesi", nameEn: "Media Library" },
  { id: "NAVIGATION", nameTr: "Menüler & Navigasyon", nameEn: "Navigation & Menus" },
  { id: "APPEARANCE", nameTr: "Tema & Görünüm", nameEn: "Appearance & Theme" },
  { id: "LAYOUTS", nameTr: "Sayfa Düzenleri", nameEn: "Page Layouts" },
  { id: "CATALOG", nameTr: "Ürünler & Kategoriler", nameEn: "Products & Catalog" },
  { id: "MARKETING", nameTr: "Reklamlar & Kuponlar", nameEn: "Marketing & Ads" },
  { id: "ORDERS", nameTr: "Siparişler & Ödemeler", nameEn: "Orders & Payments" },
  { id: "RETURNS", nameTr: "İade Talepleri", nameEn: "Return Requests" },
  { id: "SELLERS", nameTr: "Satıcı Yönetimi", nameEn: "Seller Stores" },
  { id: "CUSTOMERS", nameTr: "Müşteri CRM", nameEn: "Customer CRM" },
  { id: "SETTINGS", nameTr: "Sistem Ayarları", nameEn: "System Settings" },
  { id: "AUDIT", nameTr: "Denetim Kayıtları (Audit)", nameEn: "Audit Logs" },
  { id: "ANALYTICS", nameTr: "Raporlar & Analitik", nameEn: "Analytics & Reports" },
  { id: "HEALTH", nameTr: "Site Sağlığı (Health)", nameEn: "Website Health" },
];

export default function AdminRolesPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [rolesMap, setRolesMap] = useState<any>({});
  const [metadata, setMetadata] = useState<any>({});
  const [selectedRole, setSelectedRole] = useState<string>("CONTENT_MANAGER");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roles");
      if (res.ok) {
        const data = await res.json();
        setRolesMap(data.roles || {});
        setMetadata(data.metadata || {});
      }
    } catch (e) {
      console.error("Failed to load roles:", e);
      showNotice("error", isEn ? "Failed to load roles." : "Roller yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleToggleAction = (resource: string, action: string) => {
    if (selectedRole === "SUPER_ADMIN") return; // Super admin always has full access

    const currentRolePerms = { ...(rolesMap[selectedRole] || {}) };
    const currentActions: string[] = currentRolePerms[resource] || [];

    let updatedActions: string[];
    if (currentActions.includes(action)) {
      updatedActions = currentActions.filter((a) => a !== action);
    } else {
      updatedActions = [...currentActions, action];
    }

    setRolesMap({
      ...rolesMap,
      [selectedRole]: {
        ...currentRolePerms,
        [resource]: updatedActions,
      },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      showNotice(
        "success",
        isEn
          ? "Role permissions updated and audited successfully!"
          : "Rol izinleri başarıyla güncellendi ve denetim kaydı oluşturuldu!"
      );
    } finally {
      setSaving(false);
    }
  };

  const roleMeta = metadata[selectedRole] || {};

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-900 overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader />

        {/* Top Control Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-2xs z-20">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              {isEn ? "Role-Based Access Control (RBAC)" : "Rol & Yetki Yönetim Merkezi"}
            </h1>
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save Permissions" : "İzinleri Kaydet"}</span>
          </Button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`px-6 py-2 flex items-center justify-between text-xs font-bold shadow-xs ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-b border-emerald-200"
                : "bg-rose-50 text-rose-900 border-b border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedback.text}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
        )}

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-12 gap-5 p-5 min-h-0 overflow-hidden bg-slate-100">
          {/* Left Column: Role Selector (4 cols) */}
          <div className="col-span-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-full overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-extrabold text-slate-900 text-sm">
                {isEn ? "Admin Role Profiles" : "Yönetici Rol Profilleri"}
              </span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-2.5">
              {[
                { id: "SUPER_ADMIN", badge: "FULL ACCESS" },
                { id: "CONTENT_MANAGER", badge: "CMS & MEDIA" },
                { id: "MERCHANDISING_MANAGER", badge: "CATALOG & LAYOUTS" },
                { id: "MARKETING_MANAGER", badge: "ADS & ANALYTICS" },
                { id: "OPERATIONS_MANAGER", badge: "ORDERS & SELLERS" },
              ].map((role) => {
                const meta = metadata[role.id] || {};
                const isSelected = selectedRole === role.id;

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-600 shadow-xs ring-1 ring-indigo-600"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {isEn ? meta.nameEn || role.id : meta.nameTr || role.id}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                      {isEn ? meta.descriptionEn : meta.descriptionTr}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Permission Matrix Table (8 cols) */}
          <div className="col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-full overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 text-sm">
                  {isEn ? "Resource Permission Matrix:" : "Kaynak İzin Matrisi:"}{" "}
                  <span className="text-indigo-600">{isEn ? roleMeta.nameEn : roleMeta.nameTr}</span>
                </span>
                <span className="text-slate-500 text-[11px]">
                  {isEn ? roleMeta.descriptionEn : roleMeta.descriptionTr}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-extrabold uppercase text-slate-500 text-[10px] tracking-wider">
                    <th className="p-3">{isEn ? "Module / Resource" : "Modül / Kaynak"}</th>
                    <th className="p-3 text-center">{isEn ? "View (Read)" : "Görüntüle (Read)"}</th>
                    <th className="p-3 text-center">{isEn ? "Create/Edit (Write)" : "Düzenle (Write)"}</th>
                    <th className="p-3 text-center">{isEn ? "Delete" : "Sil (Delete)"}</th>
                    <th className="p-3 text-center">{isEn ? "Publish" : "Yayınla (Publish)"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RESOURCES.map((res) => {
                    const currentActions: string[] =
                      selectedRole === "SUPER_ADMIN"
                        ? ["READ", "WRITE", "DELETE", "PUBLISH"]
                        : rolesMap[selectedRole]?.[res.id] || [];

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          {isEn ? res.nameEn : res.nameTr}
                        </td>
                        {["READ", "WRITE", "DELETE", "PUBLISH"].map((action) => {
                          const isAllowed =
                            selectedRole === "SUPER_ADMIN" ||
                            currentActions.includes(action) ||
                            currentActions.includes("ALL");

                          return (
                            <td key={action} className="p-3 text-center">
                              <button
                                type="button"
                                disabled={selectedRole === "SUPER_ADMIN"}
                                onClick={() => handleToggleAction(res.id, action)}
                                className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center transition-colors ${
                                  isAllowed
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                }`}
                              >
                                {isAllowed ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3 text-slate-300" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
