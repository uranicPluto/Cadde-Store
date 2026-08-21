import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Heart, ShoppingCart, Zap } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | "primary" 
    | "secondary" 
    | "outline" 
    | "ghost" 
    | "danger" 
    | "success" 
    | "icon-only" 
    | "add-to-cart" 
    | "favorite" 
    | "quick-action";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isFavoriteActive?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      isFavoriteActive = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 min-h-[32px] gap-1.5",
      md: "text-sm px-4 py-2 min-h-[40px] gap-2",
      lg: "text-base px-6 py-3 min-h-[48px] gap-2.5",
    };

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
      secondary: "bg-slate-100 text-text-main hover:bg-slate-200 border border-slate-200",
      outline: "border border-primary text-primary bg-transparent hover:bg-primary-light",
      ghost: "text-text-main bg-transparent hover:bg-slate-100",
      danger: "bg-error text-white hover:bg-red-700 shadow-sm",
      success: "bg-success text-white hover:bg-emerald-600 shadow-sm",
      "icon-only": "p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-text-main shadow-xs",
      "add-to-cart": "bg-primary text-white hover:bg-primary-hover font-semibold shadow-sm w-full",
      favorite: cn(
        "p-2 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 hover:bg-white text-slate-400 shadow-xs hover:text-red-500 transition-colors",
        isFavoriteActive && "text-red-500 fill-red-500 border-red-200 bg-red-50"
      ),
      "quick-action": "bg-slate-900 text-white hover:bg-slate-800 text-xs px-3 py-1.5 rounded-full font-medium shadow-xs",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : null}

        {!isLoading && variant === "add-to-cart" && (
          <ShoppingCart className="w-4 h-4 shrink-0" />
        )}

        {!isLoading && variant === "favorite" && (
          <Heart className={cn("w-4 h-4 shrink-0 transition-transform", isFavoriteActive && "fill-current scale-110")} />
        )}

        {!isLoading && variant === "quick-action" && (
          <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        )}

        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
