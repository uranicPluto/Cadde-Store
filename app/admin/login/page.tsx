"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AdminLoginPage() {
  const router = useRouter();
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

      if (data.user?.role !== "ADMIN" && data.user?.role !== "SUPER_ADMIN") {
        // If not an admin role
        const adminRoles = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "MERCHANDISING_MANAGER", "OPERATIONS_MANAGER", "MARKETING_MANAGER"];
        if (!adminRoles.includes(data.user?.role)) {
          throw new Error("Bu hesap yönetici paneline erişim yetkisine sahip değil.");
        }
      }

      // Hard redirect to refresh server-side cookies across App Router
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || "Giriş yapılırken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 text-white">
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
                className="pl-9 text-xs bg-slate-950 border-slate-800 text-white"
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
                className="pl-9 text-xs bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs h-10 rounded-xl shadow-lg shadow-indigo-600/30 transition-all mt-2"
          >
            {loading ? "Giriş Yapılıyor..." : "Yönetim Paneline Giriş Yap"}
          </Button>
        </form>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col gap-1 text-[11px] text-slate-400">
          <span className="font-bold text-slate-300">Geliştirici / Demo Hesabı:</span>
          <span>E-Posta: <strong className="text-slate-200">admin@cadde-store.com</strong></span>
          <span>Şifre: <strong className="text-slate-200">Password123!</strong></span>
        </div>
      </div>
    </div>
  );
}
