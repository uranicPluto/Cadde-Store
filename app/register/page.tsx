"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === "en";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isEn ? "Registration failed." : "Kayıt işlemi başarısız."));
      }

      window.location.href = "/account";
    } catch (err: any) {
      setError(err.message || (isEn ? "An error occurred." : "Bir hata oluştu."));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span>
              Cadde<span className="text-orange-500">Store</span>
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          {isEn ? "Create your account" : "Yeni Hesap Oluşturun"}
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          {isEn ? "Join Cadde Store marketplace today" : "Cadde Store pazaryerine hemen katılın"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isEn ? "First Name" : "Ad"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="pl-9 bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isEn ? "Last Name" : "Soyad"}
                </label>
                <Input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isEn ? "Email Address" : "E-Posta Adresi"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-9 bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isEn ? "Phone Number" : "Telefon Numarası"}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-9 bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isEn ? "Password" : "Şifre"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-9 bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-orange-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer"
            >
              {loading ? (
                <span>{isEn ? "Creating Account..." : "Hesap Oluşturuluyor..."}</span>
              ) : (
                <>
                  <span>{isEn ? "Sign Up" : "Kayıt Ol"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
            <span>{isEn ? "Already have an account? " : "Zaten bir hesabınız var mı? "}</span>
            <Link href="/login" className="text-orange-400 font-semibold hover:underline">
              {isEn ? "Sign In" : "Giriş Yap"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
