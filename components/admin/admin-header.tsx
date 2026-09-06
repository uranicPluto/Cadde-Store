import React from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ShieldCheck, ExternalLink, Activity, Radio, Bell, Search, Command } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export const AdminHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 py-3 px-6 shadow-lg flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            CS
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base leading-tight tracking-tight text-white flex items-center gap-2">
              Cadde Store <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-widest">PRO ADMIN</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Yönetim ve Kontrol Paneli</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] font-bold text-emerald-400">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Sistem Aktif (v2.4 Pro)</span>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 md:flex">
        <Search className="size-4 text-slate-500" />
        <span className="text-xs font-medium text-slate-500">{t("admin.header.search") || "Search anything"}</span>
        <span className="ml-4 flex items-center gap-1 text-[10px] font-bold text-slate-600"><Command className="size-3" /> K</span>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" aria-label={t("admin.header.notifications") || "Notifications"} className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 transition hover:bg-slate-800"><Bell className="size-4" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-amber-400" /></button>
        <LanguageSwitcher />

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        <Link
          href="/"
          className="text-xs font-black text-slate-200 hover:text-white flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-800 transition-colors shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">{t("admin.header.viewMarketplace")}</span>
        </Link>
      </div>
    </header>
  );
};
