import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  title,
  subtitle,
  actionText,
  onActionClick,
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-3", className)}>
      {/* Header with Title and Nav Controls */}
      {(title || actionText) && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
          <div className="flex flex-col">
            {title && <h3 className="text-lg font-bold text-text-main">{title}</h3>}
            {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            {actionText && (
              <button
                onClick={onActionClick}
                className="text-xs font-bold text-primary hover:underline mr-2"
              >
                {actionText}
              </button>
            )}

            <button
              onClick={() => scroll("left")}
              aria-label="Previous items"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-text-main shadow-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next items"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-text-main shadow-xs transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
      >
        {children}
      </div>
    </div>
  );
};
