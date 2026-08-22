"use client";

import React, { useState } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { Lock, ShieldCheck, KeyRound, Smartphone, Check, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PasswordAndSecurityPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(newPassword);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg(isEn ? "Passwords do not match!" : "Yeni şifreler birbiriyle uyuşmuyor!");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg(isEn ? "Password must be at least 8 characters!" : "Şifre en az 8 karakter olmalıdır!");
      return;
    }

    setErrorMsg("");
    setSaveSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "Password & Security" : "Şifre ve Güvenlik" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                  <Lock className="w-4 h-4" />
                  <span>{isEn ? "Account Protection" : "Hesap Güvenliği"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {isEn ? "Password & Security Settings" : "Şifre ve Güvenlik Ayarları"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? "Manage your account password, two-factor authentication, and security audit log."
                    : "Hesap giriş şifrenizi güncelleyin ve iki adımlı doğrulama ile hesabınızı tam koruma altına alın."}
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-800 shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider">Güvenlik Skoru</span>
                  <span className="text-xs font-black">%95 - Yüksek Koruma</span>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm border-b border-slate-100 pb-3">
                <KeyRound className="w-4 h-4 text-primary" />
                <span>{isEn ? "Update Login Password" : "Giriş Şifresini Değiştir"}</span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{isEn ? "Password successfully updated!" : "Şifreniz başarıyla güncellendi!"}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-800">
                    {isEn ? "Current Password" : "Mevcut Şifreniz"}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-800">
                    {isEn ? "New Password" : "Yeni Şifre"}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="En az 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-medium"
                  />

                  {/* Password Strength Meter */}
                  {newPassword.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-1.5 flex-1 rounded-full", strength >= 1 ? "bg-rose-500" : "bg-slate-200")} />
                        <div className={cn("h-1.5 flex-1 rounded-full", strength >= 2 ? "bg-amber-500" : "bg-slate-200")} />
                        <div className={cn("h-1.5 flex-1 rounded-full", strength >= 3 ? "bg-blue-500" : "bg-slate-200")} />
                        <div className={cn("h-1.5 flex-1 rounded-full", strength >= 4 ? "bg-emerald-500" : "bg-slate-200")} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {strength <= 1 ? "Zayıf" : strength <= 3 ? "Orta Düzey" : "Güçlü ve Güvenli"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-800">
                    {isEn ? "Confirm New Password" : "Yeni Şifre Tekrar"}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold text-xs py-3 rounded-xl shadow-2xs transition-colors cursor-pointer w-fit px-6 mt-2"
                >
                  {isEn ? "Save New Password" : "Yeni Şifreyi Kaydet"}
                </button>
              </form>
            </div>

            {/* 2-Factor Authentication (2FA) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-black text-slate-900">
                    {isEn ? "Two-Factor SMS Verification (2FA)" : "İki Adımlı SMS Doğrulama (2FA)"}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                    {isEn
                      ? "When logging in from an unfamiliar device, a one-time verification code is sent to your registered phone number."
                      : "Farklı bir cihazdan giriş yapıldığında kayıtlı telefonunuza tek kullanımlık güvenlik kodu gönderilir."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                className={cn(
                  "px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer shrink-0 border",
                  is2FAEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                )}
              >
                {is2FAEnabled ? "✓ Aktif ve Korunuyor" : "Devre Dışı"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
