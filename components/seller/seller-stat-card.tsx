import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SellerStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconBgColor?: string;
}

export const SellerStatCard: React.FC<SellerStatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconBgColor = "bg-primary-light text-primary",
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-subtle uppercase">{title}</span>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0", iconBgColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <span className="text-2xl font-black text-text-main tracking-tight">{value}</span>

        {change && (
          <span
            className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded ${
              isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
