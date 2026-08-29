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
  User,
  Phone,
  ShieldCheck,
  Store,
  LogIn,
  UserPlus,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setMode("login");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, firstName, lastName, phone };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "INVALID_CREDENTIALS") {
          setErrorMsg(t("auth.invalidCredentials") || "Geçersiz e-posta veya şifre.");
        } else {
          setErrorMsg(data.error || t("auth.genericError") || "İşlem sırasında bir hata oluştu.");
        }
        setLoading(false);
        return;
      }

      // Guest -> Authenticated Account Sync
      try {
        const localFavs = localStorage.getItem("cadde-store-favorites");
        const localAddrs = localStorage.getItem("cadde-store-addresses");
        const favProductIds = localFavs ? JSON.parse(localFavs) : [];
        const addresses = localAddrs ? JSON.parse(localAddrs) : [];

        if (favProductIds.length > 0 || addresses.length > 0) {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favoriteProductIds: favProductIds, addresses }),
          });
        }
      } catch (syncErr) {
        console.error("Guest data sync error:", syncErr);
      }

      const role = data.user?.role;
      let targetUrl = callbackUrl;

      if (!targetUrl) {
        if (role === "ADMIN") {
          targetUrl = "/admin";
        } else if (role === "SELLER") {
          targetUrl = "/seller/dashboard";
        } else {
          targetUrl = "/account";
        }
      }

      router.push(targetUrl);
      router.refresh();
    } catch (err) {
      setLoading(false);
      setErrorMsg(t("auth.genericError") || "Bağlantı hatası oluştu.");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-xs">
            C
          </div>
          <span className="font-extrabold text-xl tracking-tight text-text-main">
            CADDE STORE
          </span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-text-main mt-1">
          {mode === "login" ? (isEn ? "Sign In to Account" : "Hesabınıza Giriş Yapın") : (isEn ? "Create New Account" : "Yeni Hesap Oluşturun")}
        </h1>
        <p className="text-xs text-text-muted">
          {mode === "login"
            ? (isEn ? "Enter your email and password to access your account." : "Hesabınıza ve siparişlerinize erişmek için bilgilerinizi giriniz.")
            : (isEn ? "Join Cadde Store to enjoy fast shopping and exclusive deals." : "Ayrıcalıklı alışveriş ve fırsatlar için hemen üye olun.")}
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setErrorMsg(null);
          }}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === "login"
              ? "bg-white text-primary shadow-xs font-black"
              : "hover:text-slate-900"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>{isEn ? "Sign In" : "Giriş Yap"}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setErrorMsg(null);
          }}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === "register"
              ? "bg-white text-primary shadow-xs font-black"
              : "hover:text-slate-900"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isEn ? "Sign Up" : "Kayıt Ol"}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-medium">
        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">
                {t("auth.firstName") || "Ad"} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">
                {t("auth.lastName") || "Soyad"} *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-700">
            {t("auth.email") || "E-Posta Adresi"} *
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@domain.com"
              className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-700">
            {t("auth.password") || "Şifre"} *
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {mode === "register" && (
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">
              {t("auth.phone") || "Telefon Numarası"}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0532 000 0000"
                className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-bold"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          type="submit"
          disabled={loading}
          className="w-full h-11 font-black bg-primary hover:bg-primary/90 mt-2 rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>{isEn ? "Please wait..." : "Lütfen bekleyin..."}</span>
          ) : mode === "login" ? (
            <>
              <LogIn className="w-4 h-4" />
              <span>{isEn ? "Sign In" : "Giriş Yap"}</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>{isEn ? "Complete Registration" : "Kaydı Tamamla"}</span>
            </>
          )}
        </Button>
      </form>

      {/* 1-Click Demo Accounts */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
        <span className="text-[11px] font-extrabold text-text-subtle text-center uppercase tracking-wider">
          {isEn ? "1-Click Demo Test Accounts" : "Hazır Test Hesapları (Tek Tıkla Doldur)"}
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill("customer@cadde-store.com")}
            className="p-2 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl font-bold text-[11px] flex flex-col items-center justify-center gap-1 hover:bg-sky-100 transition-colors"
          >
            <User className="w-4 h-4 text-sky-600" />
            <span>{isEn ? "Customer" : "Müşteri"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("seller@cadde-store.com")}
            className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-bold text-[11px] flex flex-col items-center justify-center gap-1 hover:bg-amber-100 transition-colors"
          >
            <Store className="w-4 h-4 text-amber-600" />
            <span>{isEn ? "Seller" : "Satıcı"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("admin@cadde-store.com")}
            className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl font-bold text-[11px] flex flex-col items-center justify-center gap-1 hover:bg-indigo-100 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>{isEn ? "Admin" : "Yönetici"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <Suspense fallback={<div className="text-slate-400 text-xs">Yükleniyor...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
