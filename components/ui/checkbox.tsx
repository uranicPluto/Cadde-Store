import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-4 h-4 rounded border border-slate-300 bg-white transition-all peer-focus:ring-2 peer-focus:ring-primary/20",
              "peer-checked:bg-primary peer-checked:border-primary",
              disabled && "bg-slate-100 border-slate-300"
            )}
          />
          <Check className="w-3 h-3 text-white absolute left-0.5 top-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity stroke-[3]" />
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

Checkbox.displayName = "Checkbox";
