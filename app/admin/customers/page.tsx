"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Users, Search, Mail, Phone, Calendar, ShoppingBag } from "lucide-react";

export default function AdminCustomersPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Mock customer CRM dataset
    setCustomers([
      {
        id: "c_1",
        firstName: "Can",
        lastName: "Öztürk",
        email: "can.ozturk@example.com",
        phone: "+90 532 111 2233",
        ordersCount: 8,
        totalSpent: "14.250 TL",
        joinedAt: "2025-11-10",
      },
      {
        id: "c_2",
        firstName: "Ayşe",
        lastName: "Kaya",
        email: "ayse.kaya@example.com",
        phone: "+90 544 333 4455",
        ordersCount: 4,
        totalSpent: "5.800 TL",
        joinedAt: "2026-01-14",
      },
      {
        id: "c_3",
        firstName: "Mehmet",
        lastName: "Arslan",
        email: "mehmet.arslan@example.com",
        phone: "+90 555 666 7788",
        ordersCount: 12,
        totalSpent: "29.400 TL",
        joinedAt: "2025-06-01",
      },
    ]);
  }, []);

  const filtered = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
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
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Customers & Shopper CRM" : "Müşteri & CRM Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage shopper accounts, purchase history, order volume, and registered addresses."
                    : "Kayıtlı alıcı hesaplarını, sipariş geçmişlerini ve harcama hacimlerini yönetin."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[10px]">
                  <th className="py-3 px-4">Müşteri</th>
                  <th className="py-3 px-4">E-posta</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Sipariş Sayısı</th>
                  <th className="py-3 px-4">Toplam Harcama</th>
                  <th className="py-3 px-4">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.firstName} {c.lastName}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{c.email}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.phone}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{c.ordersCount} sipariş</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">{c.totalSpent}</td>
                    <td className="py-3.5 px-4 text-slate-400">{c.joinedAt}</td>
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
