"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MOCK_ADMIN_CUSTOMERS } from "@/lib/admin/admin-repository";
import { AdminCustomer } from "@/lib/admin/admin-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { User, Mail, Phone, Calendar, ArrowLeft, ShoppingBag } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ADMIN_CUSTOMERS_KEY = "cadde-store-admin-customers";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { currency, t } = useLanguage();
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);

  useEffect(() => {
    let custom: AdminCustomer[] = [];
    try {
      const saved = localStorage.getItem(ADMIN_CUSTOMERS_KEY);
      if (saved) custom = JSON.parse(saved);
    } catch (e) {}

    const found = custom.find((c) => c.id === id) || MOCK_ADMIN_CUSTOMERS[0];
    if (found) setCustomer(found);
  }, [id]);

  if (!customer) return null;

  const titleText = t("admin.customers.detailTitle").replace("{name}", customer.name);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/admin/customers" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main">{titleText}</h1>
                  <span className="text-xs text-text-muted">{t("admin.customers.detailSubtitle")}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider">İletişim Bilgileri</span>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Kayıt Tarihi: {customer.joinedDate}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
                <span className="font-extrabold text-indigo-600 uppercase tracking-wider">Alışveriş Özeti</span>
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Sipariş Adedi:</span>
                  <span>{customer.ordersCount} Sipariş</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Toplam Harcama:</span>
                  <span className="text-indigo-600 text-sm font-black">{formatCurrency(customer.totalSpent, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Kayıtlı Adresler:</span>
                  <span>{customer.savedAddressesCount} Adres</span>
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
