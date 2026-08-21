import React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, checked, disabled, id, onChange, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-start gap-2.5 cursor-pointer select-none text-sm text-text-main",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="relative flex items-center mt-0.5">
          <input
            id={inputId}
            ref={ref}
            type="radio"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-4 h-4 rounded-full border border-slate-300 bg-white transition-all peer-focus:ring-2 peer-focus:ring-primary/20 flex items-center justify-center",
              "peer-checked:border-primary",
              disabled && "bg-slate-100 border-slate-300"
            )}
          >
            <div className="w-2 h-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="font-medium text-text-main leading-tight">{label}</span>}
            {description && <span className="text-xs text-text-muted mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = "Radio";
