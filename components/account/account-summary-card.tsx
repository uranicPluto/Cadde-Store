import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccountSummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  href: string;
  iconBgColor?: string;
}

export const AccountSummaryCard: React.FC<AccountSummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  iconBgColor = "bg-primary-light text-primary",
}) => {
  return (
    <Link
      href={href}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between gap-4 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-text-subtle uppercase">{title}</span>
          <span className="text-2xl font-black text-text-main mt-0.5">{value}</span>
        </div>

        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0", iconBgColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-text-muted group-hover:text-primary transition-colors pt-2 border-t border-slate-100">
        <span>{subtitle}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
};
