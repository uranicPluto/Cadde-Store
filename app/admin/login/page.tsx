"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const { language } = useLanguage();
  const isEn = language === "en";

  const [email, setEmail] = useState("admin@cadde-store.com");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        if (data.user.role !== "ADMIN") {
          setError(
            isEn
              ? "Access denied. Only administrators can log in here."
              : "Erişim reddedildi. Bu panele sadece yöneticiler giriş yapabilir."
          );
          setLoading(false);
          return;
        }

        // Successfully logged in as Admin, navigate to target admin route
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(data.error || (isEn ? "Login failed." : "Giriş başarısız."));
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(isEn ? "Connection error during login." : "Giriş sırasında bağlantı hatası oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tight text-white">
            Cadde Store <span className="text-indigo-400">Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {isEn
              ? "Sign in to manage the marketplace storefront, products, and CMS."
              : "Pazaryeri vitrinini, ürünleri ve CMS sayfalarını yönetmek için giriş yapın."}
          </p>
        </div>
      </div>

      {/* Feedback / Error */}
      {error && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs">
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEn ? "Administrator Email" : "Yönetici E-Posta"}</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white font-medium outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEn ? "Password" : "Şifre"}</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white font-medium outline-none transition-colors"
          />
        </div>

        {/* 1-Click Fast Login Action */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2 transition-all"
        >
          <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>
            {loading
              ? isEn
                ? "Authenticating..."
                : "Giriş yapılıyor..."
              : isEn
              ? "Sign In to Admin Panel"
              : "Yönetici Paneline Giriş Yap"}
          </span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {/* Demo Credentials Box */}
      <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col gap-2 text-[11px]">
        <span className="font-bold text-indigo-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isEn ? "Demo Admin Credentials (Ready)" : "Hazır Demo Yönetici Bilgileri"}
        </span>
        <div className="flex flex-col gap-0.5 text-slate-400 font-mono">
          <span>Email: <strong className="text-white">admin@cadde-store.com</strong></span>
          <span>Password: <strong className="text-white">Password123!</strong></span>
        </div>
      </div>

      <div className="text-center">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          &larr; {isEn ? "Return to Storefront" : "Ana Sayfaya Geri Dön"}
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 font-sans antialiased">
      <Suspense fallback={<div className="text-slate-500 text-sm">Yükleniyor...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
