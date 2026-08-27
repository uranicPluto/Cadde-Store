"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatCurrency } from "@/lib/utils";
import { RotateCcw, Search, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export default function AdminReturnsPage() {
  const { language, currency } = useLanguage();
  const isEn = language === "en";

  const [returns, setReturns] = useState<any[]>([]);

  useEffect(() => {
    // Mock sample returns
    setReturns([
      {
        id: "ret_1",
        returnNumber: "RET-94812",
        orderNumber: "CS-83910",
        customerName: "Ahmet Yılmaz",
        productName: "Nike Air Max Pulse (42 Numara)",
        amount: 4299,
        reason: "Beden küçük geldi",
        status: "PENDING_APPROVAL",
        createdAt: "2026-08-25T14:30:00Z",
      },
      {
        id: "ret_2",
        returnNumber: "RET-94813",
        orderNumber: "CS-83911",
        customerName: "Elif Demir",
        productName: "Oversize Pamuklu Gömlek (M)",
        amount: 799,
        reason: "Renk beklendiği gibi değil",
        status: "APPROVED",
        createdAt: "2026-08-24T11:15:00Z",
      },
    ]);
  }, []);

  const handleUpdateReturnStatus = (id: string, newStatus: string) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Returns & Refunds Management" : "İade & Değişim Talepleri"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage customer return authorizations, merchant inspection, and payment refunds."
                    : "Müşteri iade ve değişim taleplerini, kargo onaylarını ve para iadelerini yönetin."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[10px]">
                  <th className="py-3 px-4">İade No</th>
                  <th className="py-3 px-4">Sipariş</th>
                  <th className="py-3 px-4">Müşteri</th>
                  <th className="py-3 px-4">Ürün</th>
                  <th className="py-3 px-4">Tutar</th>
                  <th className="py-3 px-4">Sebep</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">Onay / Red</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{ret.returnNumber}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">#{ret.orderNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{ret.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-700">{ret.productName}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatCurrency(ret.amount, currency)}</td>
                    <td className="py-3.5 px-4 text-slate-500">{ret.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateReturnStatus(ret.id, "APPROVED")}
                          className="px-2 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md"
                        >
                          Onayla
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateReturnStatus(ret.id, "REJECTED")}
                          className="px-2 py-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md"
                        >
                          Reddet
                        </button>
                      </div>
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
