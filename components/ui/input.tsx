import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search, AlertCircle, CheckCircle2 } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, success, helperText, icon, disabled, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const isPasswordType = type === "password";
    const actualType = isPasswordType ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-text-main flex items-center gap-1">
            {label}
            {props.required && <span className="text-error">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={actualType}
            disabled={disabled}
            className={cn(
              "w-full rounded border text-sm text-text-main bg-white px-3 py-2 transition-all outline-none",
              "placeholder:text-text-subtle",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              icon && "pl-9",
              isPasswordType && "pr-10",
              error && "border-error focus:border-error focus:ring-error/20 bg-error-bg/30",
              success && "border-success focus:border-success focus:ring-success/20 bg-success-bg/30",
              disabled && "bg-slate-100 text-text-muted cursor-not-allowed opacity-75 border-slate-200",
              className
            )}
            {...props}
          />

          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-text-muted hover:text-text-main p-1 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {error && !isPasswordType && (
            <div className="absolute right-3 text-error pointer-events-none">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}

          {success && !isPasswordType && (
            <div className="absolute right-3 text-success pointer-events-none">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>

        {error && <span className="text-xs font-medium text-error flex items-center gap-1">{error}</span>}
        {!error && helperText && <span className="text-xs text-text-muted">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
