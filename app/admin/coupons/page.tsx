"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import { Tag, Plus, Trash2, Check, Percent } from "lucide-react";

export default function AdminCouponsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [coupons, setCoupons] = useState([
    { id: "cp_1", code: "CADDE10", discount: "%10 İndirim", minSpend: "500 TL", usageLimit: 1000, used: 342, active: true },
    { id: "cp_2", code: "HOSGELDIN50", discount: "50 TL İndirim", minSpend: "300 TL", usageLimit: 500, used: 218, active: true },
  ]);

  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");

  const handleAddCoupon = () => {
    if (!newCode || !newDiscount) return;
    setCoupons((prev) => [
      ...prev,
      {
        id: `cp_${Date.now()}`,
        code: newCode.toUpperCase(),
        discount: newDiscount,
        minSpend: "250 TL",
        usageLimit: 500,
        used: 0,
        active: true,
      },
    ]);
    setNewCode("");
    setNewDiscount("");
  };

  const handleDelete = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Tag className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Coupons & Promotional Vouchers" : "Kupon & İndirim Kodu Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage coupon codes, minimum spend rules, cart discounts, and redemption usage limits."
                    : "Pazaryeri indirim kuponlarını, sepet indirimlerini ve kullanım limitlerini yönetin."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 flex flex-col gap-1 w-full">
              <label className="text-xs font-bold text-slate-700">Kupon Kodu</label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Örn: YAZ20"
                className="text-xs font-mono uppercase"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1 w-full">
              <label className="text-xs font-bold text-slate-700">İndirim Tutarı / Oranı</label>
              <Input
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                placeholder="Örn: %20 veya 100 TL"
                className="text-xs"
              />
            </div>
            <Button
              onClick={handleAddCoupon}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Kupon Oluştur</span>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[10px]">
                  <th className="py-3 px-4">Kupon Kodu</th>
                  <th className="py-3 px-4">İndirim</th>
                  <th className="py-3 px-4">Min. Sepet</th>
                  <th className="py-3 px-4">Kullanım</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">Sil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((cp) => (
                  <tr key={cp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-indigo-600">{cp.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{cp.discount}</td>
                    <td className="py-3.5 px-4 text-slate-600">{cp.minSpend}</td>
                    <td className="py-3.5 px-4 text-slate-600">{cp.used} / {cp.usageLimit}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        AKTİF
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(cp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
