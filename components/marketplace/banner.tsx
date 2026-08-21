import React from "react";
import { BannerMock } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export interface BannerProps {
  banner: BannerMock;
  variant?: "hero" | "promo" | "brand" | "category" | "small";
  onCtaClick?: () => void;
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({
  banner,
  variant = "hero",
  onCtaClick,
  className,
}) => {
  if (variant === "small") {
    return (
      <div
        onClick={onCtaClick}
        className={cn(
          "relative rounded-lg overflow-hidden p-4 bg-gradient-to-r text-white flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity shadow-sm",
          banner.bgGradient,
          className
        )}
      >
        <div className="flex flex-col gap-1 z-10">
          {banner.badge && (
            <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded w-fit">
              {banner.badge}
            </span>
          )}
          <h4 className="text-sm font-bold">{banner.title}</h4>
          <p className="text-xs text-white/90">{banner.subtitle}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-white shrink-0 z-10" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row items-center justify-between bg-slate-900 text-white min-h-[220px] md:min-h-[280px]",
        className
      )}
    >
      {/* Background Graphic & Image */}
      <img
        src={banner.imageUrl}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
      />
      <div className={cn("absolute inset-0 bg-gradient-to-r opacity-90", banner.bgGradient)} />

      {/* Content Area */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col items-start gap-3 max-w-xl">
        {banner.badge && (
          <Badge variant="campaign" size="md" className="bg-white/20 text-white border-0">
            {banner.badge}
          </Badge>
        )}
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
          {banner.title}
        </h2>
        <p className="text-sm md:text-base text-white/90 leading-relaxed">
          {banner.subtitle}
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={onCtaClick}
          className="bg-white text-text-main hover:bg-slate-100 border-0 font-bold shadow-md mt-2"
        >
          <span>{banner.ctaText}</span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </Button>
      </div>

      {/* Right Side Visual Highlight */}
      <div className="relative z-10 hidden md:block pr-10">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-52 h-52 object-cover rounded-lg border-2 border-white/20 shadow-2xl rotate-2"
        />
      </div>
    </div>
  );
};
