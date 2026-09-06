"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatCurrency } from "@/lib/utils";
import { getSavedOrders } from "@/lib/orders/order-utils";
import type { OrderRecord } from "@/lib/orders/order-types";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileEdit,
  Megaphone,
  Package,
  Plus,
  ShoppingCart,
  Store,
  Users,
  Zap,
} from "lucide-react";

const trend = [42, 58, 65, 80, 95, 110, 145, 184, 168, 196, 212, 238];

export default function AdminDashboardPage() {
  const { language, currency, t } = useLanguage();
  const isEn = language === "en";
  const [range, setRange] = useState("30d");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [metrics, setMetrics] = useState({ totalRevenue: 184500, totalOrders: 382, activeSellers: 15, pendingSellers: 2, totalCustomers: 1243, totalProducts: 45, outOfStockProducts: 2, publishedPages: 8 });

  useEffect(() => {
    setOrders(getSavedOrders());
    fetch(`/api/admin/overview?range=${range}`).then((res) => res.ok ? res.json() : null).then((data) => data?.metrics && setMetrics((current) => ({ ...current, ...data.metrics }))).catch(() => undefined);
  }, [range]);

  const labels = useMemo(() => isEn ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"], [isEn]);
  const copy = {
    eyebrow: isEn ? "Command center" : "Kontrol merkezi",
    intro: isEn ? "A live operating view of your marketplace, storefront content, and growth pipeline." : "Pazar yerinizin, vitrin içeriğinizin ve büyüme hattınızın canlı operasyon görünümü.",
    viewStore: isEn ? "Preview storefront" : "Mağazayı önizle",
    quickActions: isEn ? "Quick actions" : "Hızlı işlemler",
    revenue: isEn ? "Gross merchandise value" : "Brüt işlem hacmi",
    orders: isEn ? "Orders" : "Siparişler",
    sellers: isEn ? "Active sellers" : "Aktif mağazalar",
    customers: isEn ? "Customers" : "Müşteriler",
    performance: isEn ? "Revenue performance" : "Ciro performansı",
    period: isEn ? "Compared with previous period" : "Önceki dönemle karşılaştırma",
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AdminHeader />
      <div className="mx-auto flex w-full max-w-[1680px] gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <AdminSidebar className="hidden w-64 shrink-0 lg:flex" />
        <main className="min-w-0 flex-1 space-y-6">
          <section className="flex flex-col justify-between gap-4 rounded-2xl bg-slate-950 p-6 text-white shadow-xl sm:flex-row sm:items-end">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]">
                <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-indigo-300">{copy.eyebrow}</span>
                <span className="flex items-center gap-1.5 text-emerald-400"><span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> {isEn ? "All systems operational" : "Tüm sistemler aktif"}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("admin.dashboard.title")}</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">{copy.intro}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/cms" className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-indigo-400"><FileEdit className="size-4" /> {isEn ? "Edit homepage" : "Vitrini düzenle"}</Link>
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/15"><ArrowUpRight className="size-4" /> {copy.viewStore}</Link>
            </div>
          </section>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div><p className="text-sm font-black text-slate-900">{isEn ? "Today at a glance" : "Bugünün özeti"}</p><p className="text-xs text-slate-500">{copy.period}</p></div>
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">{[["today", isEn ? "Today" : "Bugün"], ["7d", isEn ? "7 days" : "7 gün"], ["30d", isEn ? "30 days" : "30 gün"], ["90d", isEn ? "90 days" : "90 gün"]].map(([value, label]) => <button key={value} onClick={() => setRange(value)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${range === value ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{label}</button>)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <AdminStatCard title={copy.revenue} value={formatCurrency(metrics.totalRevenue, currency)} change="+18.4%" icon={BarChart3} iconBgColor="bg-emerald-100 text-emerald-600" />
            <AdminStatCard title={copy.orders} value={metrics.totalOrders} change="+12.5%" icon={ShoppingCart} iconBgColor="bg-indigo-100 text-indigo-600" />
            <AdminStatCard title={copy.sellers} value={metrics.activeSellers} change={`${metrics.pendingSellers} ${isEn ? "pending" : "bekliyor"}`} icon={Store} iconBgColor="bg-amber-100 text-amber-600" />
            <AdminStatCard title={copy.customers} value={metrics.totalCustomers} change="+24.8%" icon={Users} iconBgColor="bg-violet-100 text-violet-600" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 text-sm font-black"><Activity className="size-4 text-indigo-600" /> {copy.performance}</h2><p className="mt-1 text-xs text-slate-500">{isEn ? "Monthly GMV, in thousands" : "Aylık ciro, bin üzerinden"}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">+34.2%</span></div>
              <div className="mt-8 flex h-52 items-end gap-2 border-b border-slate-100 px-1">{trend.map((value, index) => <div key={value + index} className="group flex flex-1 flex-col items-center gap-2"><div className="text-[10px] font-bold text-indigo-600 opacity-0 transition group-hover:opacity-100">{value}k</div><div className="w-full rounded-t-lg bg-indigo-500 transition group-hover:bg-indigo-700" style={{ height: `${(value / 250) * 100}%` }} /><span className="text-[10px] font-bold text-slate-400">{labels[index]}</span></div>)}</div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-sm font-black">{copy.quickActions}</h2><Zap className="size-4 text-amber-500" /></div><div className="mt-4 grid gap-2">{[["/admin/products", Package, isEn ? "Add product" : "Ürün ekle"], ["/admin/coupons", Plus, isEn ? "Create coupon" : "Kupon oluştur"], ["/admin/marketing", Megaphone, isEn ? "Launch campaign" : "Kampanya başlat"], ["/admin/cms", FileEdit, isEn ? "Manage sponsor banners" : "Sponsor bannerlarını yönet"]].map(([href, Icon, label]) => <Link key={href as string} href={href as string} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 text-xs font-bold transition hover:border-indigo-200 hover:bg-indigo-50"><span className="flex items-center gap-3"><span className="rounded-lg bg-slate-100 p-2 text-indigo-600"><Icon className="size-4" /></span>{label as string}</span><ChevronRight className="size-4 text-slate-400" /></Link>)}</div></section>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="text-sm font-black">{isEn ? "Recent orders" : "Son siparişler"}</h2><Link href="/admin/orders" className="text-xs font-black text-indigo-600">{isEn ? "View all" : "Tümünü gör"}</Link></div><div className="divide-y divide-slate-100">{orders.length ? orders.slice(0, 5).map((order) => <div key={order.orderId} className="flex items-center justify-between gap-3 py-3 text-xs"><div><p className="font-black">{order.orderNumber}</p><p className="text-slate-500">{order.customerInfo.firstName} {order.customerInfo.lastName}</p></div><span className="font-black">{formatCurrency(order.calculation.grandTotal, currency)}</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">{order.status}</span></div>) : <p className="py-8 text-center text-xs text-slate-500">{isEn ? "No recent orders yet." : "Henüz son sipariş yok."}</p>}</div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-sm font-black"><AlertTriangle className="size-4 text-amber-500" /> {isEn ? "Needs attention" : "İlgi bekleyenler"}</h2><div className="mt-4 flex flex-col gap-3"><Link href="/admin/sellers" className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-black text-amber-950">{metrics.pendingSellers} {isEn ? "seller applications" : "mağaza başvurusu"}</p><p className="mt-1 text-[11px] font-bold text-amber-700">{isEn ? "Review now" : "Şimdi incele"} →</p></Link><Link href="/admin/products" className="rounded-xl border border-rose-200 bg-rose-50 p-3"><p className="text-xs font-black text-rose-950">{metrics.outOfStockProducts} {isEn ? "products out of stock" : "ürün stokta yok"}</p><p className="mt-1 text-[11px] font-bold text-rose-700">{isEn ? "Open inventory" : "Envanteri aç"} →</p></Link><Link href="/admin/cms" className="rounded-xl border border-indigo-200 bg-indigo-50 p-3"><p className="text-xs font-black text-indigo-950">{isEn ? "Homepage draft is ready" : "Vitrin taslağı hazır"}</p><p className="mt-1 text-[11px] font-bold text-indigo-700">{isEn ? "Publish changes" : "Değişiklikleri yayınla"} →</p></Link></div></section>
          </div>
        </main>
      </div>
    </div>
  );
}
