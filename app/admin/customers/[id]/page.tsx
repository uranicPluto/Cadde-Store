"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { User, Mail, Phone, Calendar, ArrowLeft, ShoppingBag, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { currency, t } = useLanguage();
  const isEn = t("admin.customers.title") === "Customers";

  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        const data = await res.json();
        if (data.customers) {
          const found = data.customers.find((c: any) => c.id === id);
          if (found) {
            setCustomer(found);
            return;
          }
        }
      }
    } catch (e) {
      console.error("Fetch customer error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const handleToggleBlock = async () => {
    if (!customer) return;
    const nextStatus = customer.status === "blocked" ? "active" : "blocked";
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        setCustomer({ ...customer, status: nextStatus });
        showFeedback(
          nextStatus === "blocked"
            ? "Müşteri hesabı bloke edildi."
            : "Müşteri hesabının blokesi kaldırıldı."
        );
      } else {
        const err = await res.json();
        alert(err.error || "İşlem başarısız.");
      }
    } catch (err) {
      console.error("Toggle block error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <AdminHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 flex justify-center flex-1">
          <div className="animate-spin w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
        <AdminHeader />
        <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center justify-center flex-1 gap-4">
          <User className="w-12 h-12 text-slate-400" />
          <h2 className="text-base font-bold text-slate-700">{isEn ? "Customer not found" : "Müşteri bulunamadı"}</h2>
          <Link href="/admin/customers" className="text-xs font-bold text-indigo-600 underline">
            &larr; {isEn ? "Back to Customers" : "Müşteri Listesine Dön"}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const titleText = t("admin.customers.detailTitle").replace("{name}", customer.name);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

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
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-text-main">{titleText}</h1>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        customer.status === "blocked"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {customer.status === "blocked" ? t("admin.customers.statusBlocked") : t("admin.customers.statusActive")}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">{t("admin.customers.detailSubtitle")}</span>
                </div>
              </div>

              <Button
                variant={customer.status === "blocked" ? "primary" : "outline"}
                size="sm"
                disabled={actionLoading}
                onClick={handleToggleBlock}
                className={customer.status === "blocked" ? "bg-emerald-600 text-white font-bold" : "border-rose-300 text-rose-700 bg-rose-50 font-bold"}
              >
                {customer.status === "blocked" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    <span>{t("admin.customers.btnUnblock")}</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 mr-1" />
                    <span>{t("admin.customers.btnBlock")}</span>
                  </>
                )}
              </Button>
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
                  <span>{customer.phone || "Telefon belirtilmedi"}</span>
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
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Son Sipariş Tarihi:</span>
                  <span>{customer.lastOrderDate}</span>
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
