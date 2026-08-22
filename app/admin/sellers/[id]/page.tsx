"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSellerBySlug } from "@/lib/sellers/seller-repository";
import { SellerProfile } from "@/lib/sellers/seller-types";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin, Mail, Phone, ArrowLeft, Star, Users } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ADMIN_SELLERS_KEY = "cadde-store-admin-sellers";

export default function AdminSellerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { language, t } = useLanguage();
  const [seller, setSeller] = useState<SellerProfile | null>(null);

  useEffect(() => {
    let custom: SellerProfile[] = [];
    try {
      const saved = localStorage.getItem(ADMIN_SELLERS_KEY);
      if (saved) custom = JSON.parse(saved);
    } catch (e) {}

    const found = custom.find((s) => s.slug === id || s.id === id) || getSellerBySlug(id);
    if (found) setSeller(found);
  }, [id]);

  const handleToggleVerification = (verified: boolean) => {
    if (!seller) return;
    const updated = { ...seller, verified };
    setSeller(updated);
    try {
      const saved = localStorage.getItem(ADMIN_SELLERS_KEY);
      let list: SellerProfile[] = saved ? JSON.parse(saved) : [];
      const idx = list.findIndex((s) => s.id === seller.id);
      if (idx > -1) list[idx] = updated;
      else list.push(updated);
      localStorage.setItem(ADMIN_SELLERS_KEY, JSON.stringify(list));
    } catch (e) {}
  };

  if (!seller) return null;

  const titleText = t("admin.sellers.detailTitle").replace("{name}", seller.name);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/admin/sellers" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main">{titleText}</h1>
                  <span className="text-xs text-text-muted">{t("admin.sellers.detailSubtitle")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {seller.verified ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleVerification(false)}
                    className="border-rose-300 text-rose-700 bg-rose-50 font-bold"
                  >
                    {t("admin.sellers.btnSuspend")}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleToggleVerification(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                  >
                    {t("admin.sellers.btnApprove")}
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 text-xs">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider">{t("admin.sellers.sellerInfo")}</span>
                <div className="flex items-center gap-3">
                  <img src={seller.logo} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-text-main">{seller.name}</span>
                    <span className="text-text-muted">{seller.joinedDate} tarihinden beri üye</span>
                  </div>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed pt-2">{seller.description[language]}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 text-xs">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider">{t("admin.sellers.contactInfo")}</span>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{seller.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{seller.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{seller.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
