"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Store,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const DEMO_USERS = [
  {
    role: "Super Admin",
    email: "admin@cadde-store.com",
    label: "Yönetici (Tam Yetki)",
    badge: "SUPER_ADMIN",
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20",
  },
  {
    role: "Content Manager",
    email: "content@cadde-store.com",
    label: "İçerik & Vitrin Yöneticisi",
    badge: "CONTENT",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20",
  },
  {
    role: "Merchandising Manager",
    email: "merchandiser@cadde-store.com",
    label: "Katalog & Ürün Yöneticisi",
    badge: "MERCHANDISING",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20",
  },
  {
    role: "Marketing Manager",
    email: "marketing@cadde-store.com",
    label: "Pazarlama & Kampanyalar",
    badge: "MARKETING",
    color: "bg-pink-500/10 text-pink-400 border-pink-500/30 hover:bg-pink-500/20",
  },
  {
    role: "Operations Manager",
    email: "operations@cadde-store.com",
    label: "Siparişler & Satıcı Denetimi",
    badge: "OPERATIONS",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
  },
  {
    role: "Verified Seller",
    email: "seller@cadde-store.com",
    label: "Mağaza Satıcısı",
    badge: "SELLER",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
  },
  {
    role: "Customer",
    email: "customer@cadde-store.com",
    label: "Müşteri Hesabı",
    badge: "CUSTOMER",
    color: "bg-slate-500/10 text-slate-300 border-slate-700 hover:bg-slate-800",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const { language } = useLanguage();
  const isEn = language === "en";

  const [email, setEmail] = useState("admin@cadde-store.com");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
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
        throw new Error(
          data.error || (isEn ? "Invalid email or password." : "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
        );
      }

      // Determine redirect destination
      if (callbackUrl) {
        window.location.href = callbackUrl;
        return;
      }

      const role = data.user?.role || "";
      const adminRole = data.user?.adminRole || "";

      if (role === "ADMIN" || adminRole) {
        window.location.href = "/admin";
      } else if (role === "SELLER") {
        window.location.href = "/seller/dashboard";
      } else {
        window.location.href = "/account";
      }
    } catch (err: any) {
      setError(err.message || (isEn ? "An error occurred during login." : "Giriş yapılırken bir hata oluştu."));
      setLoading(false);
    }
  };

  const selectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-black tracking-tight text-white hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span>
              Cadde<span className="text-orange-500">Store</span>
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          {isEn ? "Sign in to your account" : "Hesabınıza Giriş Yapın"}
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          {isEn
            ? "Access storefront shopping, seller dashboard or admin studio"
            : "Alışveriş, satıcı paneli veya yönetici kontrol merkezine erişin"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isEn ? "Email Address" : "E-Posta Adresi"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@cadde-store.com"
                  className="pl-9 bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {isEn ? "Password" : "Şifre"}
                </label>
                <span className="text-[11px] text-slate-400">Password123!</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 pr-9 bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <span>{isEn ? "Signing in..." : "Giriş yapılıyor..."}</span>
              ) : (
                <>
                  <span>{isEn ? "Sign In" : "Giriş Yap"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="border-t border-slate-800/80 pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isEn ? "Quick Demo Account Selector" : "Hızlı Demo Hesap Seçici"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => {
                const isSelected = email === u.email;
                return (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => selectDemoUser(u.email)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-orange-500/20 border-orange-500 text-white font-bold"
                        : `${u.color}`
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{u.role}</span>
                      <span className="text-[10px] opacity-75">{u.label}</span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/60 font-mono text-slate-400">
                        {u.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
            <Link href="/admin/login" className="hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isEn ? "Dedicated Admin Portal" : "Özel Yönetici Portalı"}</span>
            </Link>
            <Link href="/seller" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
              <Store className="w-3.5 h-3.5" />
              <span>{isEn ? "Become a Seller" : "Satıcı Ol"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading login portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
