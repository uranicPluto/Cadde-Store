"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  Store,
  LogIn,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

function SellerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/seller/dashboard";
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const [email, setEmail] = useState("seller@cadde-store.com");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || (isEn ? "Invalid email or password." : "Geçersiz e-posta veya şifre."));
        setLoading(false);
        return;
      }

      if (data.user?.role !== "SELLER" && data.user?.role !== "ADMIN") {
        setErrorMsg(
          isEn
            ? "This account is not registered as a seller. Please apply for a seller account."
            : "Bu hesap satıcı olarak kayıtlı değil. Lütfen satıcı başvurusu yapınız."
        );
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setLoading(false);
      setErrorMsg(isEn ? "Connection error during login." : "Giriş sırasında bağlantı hatası oluştu.");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
      {/* Seller Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
          {isEn ? "Seller Portal Login" : "Satıcı Yönetim Paneli Girişi"}
        </h1>
        <p className="text-xs text-slate-500">
          {isEn
            ? "Sign in to manage your inventory, orders, and sales reports."
            : "Mağazanızı, ürünlerinizi ve gelen siparişleri yönetmek için giriş yapın."}
        </p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-medium">
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-700 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEn ? "Seller Email" : "Satıcı E-Posta"}</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-bold"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEn ? "Password" : "Şifre"}</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-bold"
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          type="submit"
          disabled={loading}
          className="w-full h-11 font-black bg-amber-600 hover:bg-amber-700 text-white mt-2 rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>{isEn ? "Signing in..." : "Giriş yapılıyor..."}</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>{isEn ? "Sign In to Seller Dashboard" : "Satıcı Paneline Giriş Yap"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </form>

      {/* Demo Credentials Box */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col gap-2 text-[11px]">
        <span className="font-bold text-amber-900 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
          {isEn ? "Ready Demo Seller Credentials" : "Hazır Demo Satıcı Bilgileri"}
        </span>
        <div className="flex flex-col gap-0.5 text-slate-700 font-mono">
          <span>Email: <strong className="text-slate-900">seller@cadde-store.com</strong></span>
          <span>Password: <strong className="text-slate-900">Password123!</strong></span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <Link href="/seller" className="font-bold text-amber-700 hover:underline">
          {isEn ? "Not a seller yet? Apply now" : "Henüz satıcı değil misiniz? Başvurun"}
        </Link>
        <Link href="/" className="text-slate-500 hover:text-slate-900">
          {isEn ? "Storefront" : "Ana Sayfa"} &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <Suspense fallback={<div className="text-slate-400 text-xs">Yükleniyor...</div>}>
          <SellerLoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
