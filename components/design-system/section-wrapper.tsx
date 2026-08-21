import React from "react";
import { cn } from "@/lib/utils";

export interface SectionWrapperProps {
  id: string;
  number: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  number,
  title,
  description,
  children,
  className,
}) => {
  return (
    <section
      id={id}
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-xs scroll-mt-24 transition-all hover:border-slate-300",
        className
      )}
    >
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
            {number < 10 ? `0${number}` : number}
          </span>
          <h2 className="text-xl font-bold text-text-main tracking-tight">{title}</h2>
        </div>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>

      <div>{children}</div>
    </section>
  );
};
