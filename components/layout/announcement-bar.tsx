"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppearance } from "@/components/layout/theme-provider";
import { useLanguage } from "@/lib/i18n/language-context";
import { X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnnouncementBarProps {
  className?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ className }) => {
  const { headerConfig } = useAppearance();
  const { language } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !headerConfig || !headerConfig.showAnnouncement) {
    return null;
  }

  const isEn = language === "en";
  const text = isEn ? headerConfig.announcementTextEn : headerConfig.announcementTextTr;
  const link = headerConfig.announcementLink;
  const bgColor = headerConfig.announcementBgColor || "#1e293b";
  const textColor = headerConfig.announcementTextColor || "#f8fafc";

  if (!text) return null;

  return (
    <aside
      role="region"
      aria-label="Duyuru / Announcement"
      className={cn(
        "w-full text-xs font-semibold transition-all relative z-50 flex items-center justify-between px-4 py-2 select-none shadow-xs",
        className
      )}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="flex-1 text-center truncate mx-4">
        {link ? (
          <Link
            href={link}
            className="inline-flex items-center gap-1.5 hover:underline focus:outline-none focus:ring-1 focus:ring-white/40 rounded px-1"
          >
            <span>{text}</span>
            <ArrowRight className="w-3.5 h-3.5 inline-block opacity-80" />
          </Link>
        ) : (
          <span>{text}</span>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Kapat / Dismiss announcement"
        className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/10 transition-all focus:outline-none focus:ring-1 focus:ring-white/40"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
