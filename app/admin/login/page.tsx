"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const ADMIN_DEMO_USERS = [
  {
    role: "Super Admin",
    email: "admin@cadde-store.com",
    label: "Tam Yetkili Yönetici",
    badge: "SUPER_ADMIN",
  },
  {
    role: "Content Manager",
    email: "content@cadde-store.com",
    label: "Sayfalar & Vitrin CMS",
    badge: "CONTENT",
  },
  {
    role: "Merchandising Manager",
    email: "merchandiser@cadde-store.com",
    label: "Katalog & Ürünler",
    badge: "MERCHANDISING",
  },
  {
    role: "Marketing Manager",
    email: "marketing@cadde-store.com",
    label: "Kampanyalar & Kuponlar",
    badge: "MARKETING",
  },
  {
    role: "Operations Manager",
    email: "operations@cadde-store.com",
    label: "Siparişler & Satıcılar",
    badge: "OPERATIONS",
  },
];

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const { language } = useLanguage();
  const isEn = language === "en";

  const [email, setEmail] = useState("admin@cadde-store.com");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }

      if (data.user?.role !== "ADMIN" && data.user?.role !== "SUPER_ADMIN" && !data.user?.adminRole) {
        throw new Error("Bu hesap yönetici paneline erişim yetkisine sahip değil.");
      }

      // Hard redirect to refresh server-side cookies across App Router
      window.location.href = callbackUrl;
    } catch (err: any) {
      setError(err.message || "Giriş yapılırken bir hata oluştu.");
      setLoading(false);
    }
  };

  const selectAdmin = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword("Password123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-white">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-950/50">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white mt-2">
            Cadde Store Yönetim Paneli
          </h1>
          <p className="text-xs text-slate-400">
            Pazaryeri kontrol ve vitrin stüdyosu yetkili girişi
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Yönetici E-Postası</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9 text-xs bg-slate-950 border-slate-800 text-white h-10 rounded-xl focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Şifre</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 text-xs bg-slate-950 border-slate-800 text-white h-10 rounded-xl focus:border-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-indigo-600/30 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? "Giriş Yapılıyor..." : "Yönetim Paneline Giriş Yap"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Quick Admin Role Selector */}
        <div className="border-t border-slate-800/80 pt-4 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Hızlı Yönetici Rolü Seç</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {ADMIN_DEMO_USERS.map((u) => {
              const isSelected = email === u.email;
              return (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => selectAdmin(u.email)}
                  className={`text-left px-3 py-2 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-indigo-500/20 border-indigo-500 text-white font-bold"
                      : "bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-[11px]">{u.role}</span>
                    <span className="text-[10px] text-slate-400">{u.label}</span>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-400">
                      {u.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
          <Link href="/login" className="hover:text-white transition-colors">
            ← Mağaza Giriş Sayfası
          </Link>
          <Link href="/" className="hover:text-white transition-colors">
            Ana Sayfaya Dön →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400 text-xs">
          Loading admin portal...
        </div>
      }
    >
      <AdminLoginInner />
    </Suspense>
  );
}
