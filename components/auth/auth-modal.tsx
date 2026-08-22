"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { Mail, Lock, User, Phone, ShieldCheck, Store, LogIn } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          setErrorMsg(t("auth.invalidCredentials"));
        } else {
          setErrorMsg(t("auth.genericError"));
        }
        setLoading(false);
        return;
      }

      // Guest -> Authenticated Account Data Migration Sync
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

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
      window.location.reload(); // Refresh session state across application
    } catch (err) {
      setLoading(false);
      setErrorMsg(t("auth.genericError"));
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setMode("login");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs p-1">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-lg text-xs">
            {errorMsg}
          </div>
        )}

        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-text-muted">{t("auth.firstName")} *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-text-muted">{t("auth.lastName")} *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="font-bold text-text-muted">{t("auth.email")} *</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold text-text-muted">{t("auth.password")} *</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {mode === "register" && (
          <div className="flex flex-col gap-1">
            <label className="font-bold text-text-muted">{t("auth.phone")}</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        )}

        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={loading}
          className="w-full font-bold bg-primary hover:bg-primary/90 mt-2 py-2.5 shadow-xs"
        >
          <LogIn className="w-4 h-4 mr-1.5" />
          <span>{loading ? "..." : mode === "login" ? t("auth.btnLogin") : t("auth.btnRegister")}</span>
        </Button>

        <button
          type="button"
          onClick={() => {
            setErrorMsg(null);
            setMode(mode === "login" ? "register" : "login");
          }}
          className="text-xs font-extrabold text-primary hover:underline text-center pt-1"
        >
          {mode === "login" ? t("auth.switchToRegister") : t("auth.switchToLogin")}
        </button>

        {/* Demo Fast Login Shortcuts */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-text-subtle text-center">
            {t("auth.quickTestLogins")}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin@cadde-store.com")}
              className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-indigo-100 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t("auth.adminLogin")}</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("seller@cadde-store.com")}
              className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-amber-100 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t("auth.sellerLogin")}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
