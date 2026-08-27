"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import { Store, Search, CheckCircle2, Star, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminSellersPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sellers");
      const data = await res.json();
      if (data.sellers && Array.isArray(data.sellers)) {
        setSellers(data.sellers);
      }
    } catch (e) {
      console.warn("Failed to fetch sellers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApproveSeller = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/approve`, { method: "POST" });
      if (res.ok) fetchSellers();
    } catch (e) {
      console.error("Approve seller error:", e);
    }
  };

  const filteredSellers = sellers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.storeName && s.storeName.toLowerCase().includes(q)) ||
      (s.companyName && s.companyName.toLowerCase().includes(q))
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
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Store className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Sellers & Merchant Accounts" : "Satıcı & Mağaza Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage marketplace merchants, verification status, commission rates, and payouts."
                    : "Pazaryeri mağazalarını, doğrulama durumlarını ve komisyon oranlarını yönetin."}
                </p>
              </div>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search store name or company..." : "Mağaza veya şirket adı ara..."}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filteredSellers.length} {isEn ? "sellers" : "satıcı"}
            </span>
          </div>

          {/* Sellers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between gap-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base border border-amber-200">
                      <Store className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-extrabold text-sm text-slate-900">{seller.storeName}</h3>
                      <span className="text-[10px] text-slate-400">{seller.companyName || "Şahıs Şirketi"}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      seller.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {seller.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{seller.rating ? seller.rating.toFixed(1) : "5.0"}</span>
                  </div>

                  {seller.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveSeller(seller.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 font-bold"
                    >
                      Onayla
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
