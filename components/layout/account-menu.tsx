"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Package, Heart, MapPin, Tag, Settings, LogOut, ChevronDown, UserCheck, ShieldCheck, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { AuthModal } from "@/components/auth/auth-modal";

export interface AccountMenuProps {
  isLoggedInMock?: boolean;
  onLoginToggleMock?: () => void;
  className?: string;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  isLoggedInMock,
  onLoginToggleMock,
  className,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; role: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    if (onLoginToggleMock) onLoginToggleMock();
    window.location.reload();
  };

  return (
    <>
      <div className={cn("relative", className)} ref={containerRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => {
            if (!user) setIsAuthModalOpen(true);
            else setIsOpen(!isOpen);
          }}
          onMouseEnter={() => {
            if (user) setIsOpen(true);
          }}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={t("common.account")}
          className="flex items-center gap-2 p-2 rounded-lg text-text-main hover:text-primary hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-primary/20 group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary-light transition-colors">
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden xl:flex flex-col text-left leading-tight">
            <span className="text-[10px] text-text-subtle font-semibold uppercase">
              {t("common.account")}
            </span>
            <span className="text-xs font-bold text-text-main group-hover:text-primary flex items-center gap-1">
              {user ? `${user.firstName} ${user.lastName}` : t("auth.btnLogin")}
              <ChevronDown className={cn("w-3 h-3 text-text-subtle transition-transform", isOpen && "rotate-180")} />
            </span>
          </div>
        </button>

        {/* Dropdown Menu Overlay */}
        {isOpen && user && (
          <div
            onMouseLeave={() => setIsOpen(false)}
            className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150 text-xs"
          >
            <div className="flex flex-col gap-1">
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="p-2 border-b border-slate-100 bg-slate-50/80 rounded-t flex items-center justify-between hover:bg-slate-100 transition-colors"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-text-main text-xs truncate">{user.firstName} {user.lastName}</span>
                  <span className="text-[10px] text-text-muted truncate">{user.email}</span>
                </div>
                <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200 px-1.5 py-0.5 rounded uppercase shrink-0">
                  {user.role}
                </span>
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded bg-slate-950 text-indigo-400 font-bold hover:bg-slate-900"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Yönetim Paneli (Admin)</span>
                </Link>
              )}

              {(user.role === "SELLER" || user.role === "ADMIN") && (
                <Link
                  href="/seller/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:bg-amber-100"
                >
                  <Store className="w-4 h-4 text-amber-600" />
                  <span>Satıcı Paneli (Dashboard)</span>
                </Link>
              )}

              <Link
                href="/account/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 hover:text-primary font-semibold text-text-main"
              >
                <Package className="w-4 h-4 text-primary" />
                <span>{t("account.myOrders")}</span>
              </Link>

              <Link
                href="/favorites"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 hover:text-primary font-semibold text-text-main"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>{t("account.myFavorites")}</span>
              </Link>

              <Link
                href="/account/coupons"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 hover:text-primary font-semibold text-text-main"
              >
                <Tag className="w-4 h-4 text-purple-600" />
                <span>{t("account.myCoupons")}</span>
              </Link>

              <Link
                href="/account/addresses"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 hover:text-primary font-semibold text-text-main"
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{t("account.myAddresses")}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 p-2 rounded hover:bg-rose-50 text-rose-600 font-semibold mt-1 border-t border-slate-100 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>{t("auth.logout")}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
