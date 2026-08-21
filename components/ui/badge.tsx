import React from "react";
import { cn } from "@/lib/utils";
import { Zap, Truck, Tag, Flame, Star, Award, ShieldCheck, Sparkles } from "lucide-react";

export type BadgeVariant =
  | "bestseller"
  | "new"
  | "discount"
  | "free-shipping"
  | "fast-delivery"
  | "coupon"
  | "campaign"
  | "limited-stock"
  | "recommended"
  | "top-rated"
  | "seller";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "new",
  size = "md",
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1 font-semibold rounded",
    md: "text-xs px-2 py-0.5 gap-1 font-semibold rounded",
  };

  const variantStyles = {
    bestseller: "bg-bestseller text-white shadow-xs",
    new: "bg-indigo-600 text-white shadow-xs",
    discount: "bg-discount text-white font-bold shadow-xs",
    "free-shipping": "bg-emerald-600 text-white shadow-xs",
    "fast-delivery": "bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold",
    coupon: "bg-purple-100 text-purple-800 border border-purple-300 font-semibold",
    campaign: "bg-campaign text-white shadow-xs",
    "limited-stock": "bg-rose-100 text-rose-800 border border-rose-300 font-semibold",
    recommended: "bg-amber-100 text-amber-900 border border-amber-300 font-semibold",
    "top-rated": "bg-amber-500 text-white shadow-xs",
    seller: "bg-slate-100 text-slate-800 border border-slate-300 font-semibold",
  };

  const defaultIcons = {
    bestseller: <Flame className="w-3 h-3 text-amber-300 fill-amber-300 shrink-0" />,
    new: <Sparkles className="w-3 h-3 text-white shrink-0" />,
    discount: <Tag className="w-3 h-3 text-white shrink-0" />,
    "free-shipping": <Truck className="w-3 h-3 text-white shrink-0" />,
    "fast-delivery": <Zap className="w-3 h-3 text-emerald-600 shrink-0" />,
    coupon: <Tag className="w-3 h-3 text-purple-600 shrink-0" />,
    campaign: <Award className="w-3 h-3 text-white shrink-0" />,
    "limited-stock": <Flame className="w-3 h-3 text-rose-600 shrink-0" />,
    recommended: <ShieldCheck className="w-3 h-3 text-amber-700 shrink-0" />,
    "top-rated": <Star className="w-3 h-3 text-white fill-white shrink-0" />,
    seller: <ShieldCheck className="w-3 h-3 text-slate-600 shrink-0" />,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center leading-none tracking-tight uppercase select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {defaultIcons[variant]}
      <span>{children}</span>
    </span>
  );
};
