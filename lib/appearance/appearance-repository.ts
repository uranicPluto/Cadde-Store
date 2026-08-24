import prisma from "@/lib/db/prisma";
import { AppearanceSettings } from "@prisma/client";

export interface HeaderConfig {
  showAnnouncement: boolean;
  announcementTextTr: string;
  announcementTextEn: string;
  announcementLink: string;
  announcementBgColor: string;
  announcementTextColor: string;
  showSearch: boolean;
  searchPlaceholderTr: string;
  searchPlaceholderEn: string;
  searchStyle?: "standard" | "expanded" | "bordered" | "pill";
  logoPosition?: "left" | "center";
  categoryMenuStyle?: "mega-menu" | "dropdown" | "horizontal-pills";
  showAccountMenu: boolean;
  showCartButton: boolean;
  showFavoritesButton: boolean;
  showSellerHubLink: boolean;
  logoHeight: number;
  sticky: boolean;
}

export interface FooterColumnItem {
  titleTr: string;
  titleEn: string;
  url: string;
  openInNewTab?: boolean;
}

export interface FooterColumn {
  id: string;
  titleTr: string;
  titleEn: string;
  links: FooterColumnItem[];
}

export interface SocialLink {
  platform: "instagram" | "facebook" | "twitter" | "linkedin" | "youtube" | "pinterest" | "tiktok";
  url: string;
}

export interface FooterConfig {
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  showNewsletter: boolean;
  newsletterTitleTr: string;
  newsletterTitleEn: string;
  newsletterSubtitleTr: string;
  newsletterSubtitleEn: string;
  showPaymentBadges: boolean;
  showTrustBadges: boolean;
  copyrightTextTr: string;
  copyrightTextEn: string;
}

export interface AppearanceSettingsDTO {
  id: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  marketplaceName: string;
  tagline: string | null;
  brandColor: string;
  accentColor: string;
  borderRadius: string;
  fontHeading: string;
  fontBody: string;
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  updatedAt: Date | string;
}

export interface AppearanceSettingsInput {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  marketplaceName?: string;
  tagline?: string | null;
  brandColor?: string;
  accentColor?: string;
  borderRadius?: string;
  fontHeading?: string;
  fontBody?: string;
  headerConfig?: Partial<HeaderConfig>;
  footerConfig?: Partial<FooterConfig>;
}

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  showAnnouncement: true,
  announcementTextTr: "🎉 Bahar İndirimleri Başladı! Seçili Ürünlerde %50'ye Varan Avantajlar",
  announcementTextEn: "🎉 Spring Sale is Live! Up to 50% Off Selected Collections",
  announcementLink: "/category/women",
  announcementBgColor: "#1e293b",
  announcementTextColor: "#f8fafc",
  showSearch: true,
  searchPlaceholderTr: "Ürün, kategori veya marka ara...",
  searchPlaceholderEn: "Search products, categories or brands...",
  showAccountMenu: true,
  showCartButton: true,
  showFavoritesButton: true,
  showSellerHubLink: true,
  logoHeight: 40,
  sticky: true,
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  columns: [
    {
      id: "col-about",
      titleTr: "Kurumsal",
      titleEn: "Company",
      links: [
        { titleTr: "Hakkımızda", titleEn: "About Us", url: "/about" },
        { titleTr: "İletişim & Destek", titleEn: "Contact & Support", url: "/contact" },
        { titleTr: "Kariyer", titleEn: "Careers", url: "/about" },
      ],
    },
    {
      id: "col-help",
      titleTr: "Müşteri Hizmetleri",
      titleEn: "Customer Care",
      links: [
        { titleTr: "Sıkça Sorulan Sorular", titleEn: "FAQ", url: "/faq" },
        { titleTr: "Kargo & Teslimat", titleEn: "Shipping & Delivery", url: "/shipping-and-returns" },
        { titleTr: "Kolay İade", titleEn: "Easy Returns", url: "/shipping-and-returns" },
      ],
    },
    {
      id: "col-legal",
      titleTr: "Politikalar & Güvenlik",
      titleEn: "Policies & Trust",
      links: [
        { titleTr: "Gizlilik Politikası", titleEn: "Privacy Policy", url: "/privacy-policy" },
        { titleTr: "Kullanım Koşulları", titleEn: "Terms of Service", url: "/terms-of-service" },
        { titleTr: "KVKK Aydınlatma", titleEn: "KVKK Notice", url: "/kvkk" },
      ],
    },
    {
      id: "col-sellers",
      titleTr: "Pazaryeri & Satıcılar",
      titleEn: "Marketplace & Sellers",
      links: [
        { titleTr: "Cadde'de Satıcı Ol", titleEn: "Sell on Cadde", url: "/seller/register" },
        { titleTr: "Satıcı Girişi", titleEn: "Seller Portal", url: "/seller/dashboard" },
        { titleTr: "Komisyon Oranları", titleEn: "Commission Rates", url: "/about" },
      ],
    },
  ],
  socialLinks: [
    { platform: "instagram", url: "https://instagram.com" },
    { platform: "facebook", url: "https://facebook.com" },
    { platform: "twitter", url: "https://twitter.com" },
    { platform: "linkedin", url: "https://linkedin.com" },
    { platform: "youtube", url: "https://youtube.com" },
  ],
  showNewsletter: true,
  newsletterTitleTr: "E-Bültenimize Katılın",
  newsletterTitleEn: "Subscribe to Our Newsletter",
  newsletterSubtitleTr: "Özel fırsatlar, indirim kuponları ve yeniliklerden ilk siz haberdar olun.",
  newsletterSubtitleEn: "Be the first to know about exclusive deals, coupons, and new arrivals.",
  showPaymentBadges: true,
  showTrustBadges: true,
  copyrightTextTr: "© 2026 Cadde Store Türkiye. Tüm hakları saklıdır.",
  copyrightTextEn: "© 2026 Cadde Store Turkey. All rights reserved.",
};

export const DEFAULT_APPEARANCE_SETTINGS: Omit<AppearanceSettingsDTO, "updatedAt"> = {
  id: "default",
  logoUrl: "/logo.svg",
  faviconUrl: "/favicon.ico",
  marketplaceName: "Cadde Store Türkiye",
  tagline: "Türkiye'nin Güvenilir Alışveriş Caddesi",
  brandColor: "#2563eb",
  accentColor: "#f97316",
  borderRadius: "8px",
  fontHeading: "Inter",
  fontBody: "Inter",
  headerConfig: DEFAULT_HEADER_CONFIG,
  footerConfig: DEFAULT_FOOTER_CONFIG,
};

function parseConfigJson<T>(jsonStr: string | null | undefined, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    const parsed = JSON.parse(jsonStr);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export async function getAppearanceSettings(): Promise<AppearanceSettingsDTO> {
  try {
    let settings = await prisma.appearanceSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.appearanceSettings.create({
        data: {
          id: "default",
          logoUrl: DEFAULT_APPEARANCE_SETTINGS.logoUrl,
          faviconUrl: DEFAULT_APPEARANCE_SETTINGS.faviconUrl,
          marketplaceName: DEFAULT_APPEARANCE_SETTINGS.marketplaceName,
          tagline: DEFAULT_APPEARANCE_SETTINGS.tagline,
          brandColor: DEFAULT_APPEARANCE_SETTINGS.brandColor,
          accentColor: DEFAULT_APPEARANCE_SETTINGS.accentColor,
          borderRadius: DEFAULT_APPEARANCE_SETTINGS.borderRadius,
          fontHeading: DEFAULT_APPEARANCE_SETTINGS.fontHeading,
          fontBody: DEFAULT_APPEARANCE_SETTINGS.fontBody,
          headerConfigJson: JSON.stringify(DEFAULT_HEADER_CONFIG),
          footerConfigJson: JSON.stringify(DEFAULT_FOOTER_CONFIG),
        },
      });
    }

    return {
      id: settings.id,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      marketplaceName: settings.marketplaceName,
      tagline: settings.tagline,
      brandColor: settings.brandColor,
      accentColor: settings.accentColor,
      borderRadius: settings.borderRadius,
      fontHeading: settings.fontHeading,
      fontBody: settings.fontBody,
      headerConfig: parseConfigJson<HeaderConfig>(settings.headerConfigJson, DEFAULT_HEADER_CONFIG),
      footerConfig: parseConfigJson<FooterConfig>(settings.footerConfigJson, DEFAULT_FOOTER_CONFIG),
      updatedAt: settings.updatedAt,
    };
  } catch (error) {
    console.warn("[AppearanceRepository getAppearanceSettings fallback]:", error);
    return {
      ...DEFAULT_APPEARANCE_SETTINGS,
      updatedAt: new Date(),
    };
  }
}

export async function updateAppearanceSettings(input: AppearanceSettingsInput): Promise<AppearanceSettingsDTO> {
  const current = await getAppearanceSettings();

  const mergedHeaderConfig = input.headerConfig
    ? { ...current.headerConfig, ...input.headerConfig }
    : current.headerConfig;

  const mergedFooterConfig = input.footerConfig
    ? { ...current.footerConfig, ...input.footerConfig }
    : current.footerConfig;

  const updated = await prisma.appearanceSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      logoUrl: input.logoUrl !== undefined ? input.logoUrl : current.logoUrl,
      faviconUrl: input.faviconUrl !== undefined ? input.faviconUrl : current.faviconUrl,
      marketplaceName: input.marketplaceName || current.marketplaceName,
      tagline: input.tagline !== undefined ? input.tagline : current.tagline,
      brandColor: input.brandColor || current.brandColor,
      accentColor: input.accentColor || current.accentColor,
      borderRadius: input.borderRadius || current.borderRadius,
      fontHeading: input.fontHeading || current.fontHeading,
      fontBody: input.fontBody || current.fontBody,
      headerConfigJson: JSON.stringify(mergedHeaderConfig),
      footerConfigJson: JSON.stringify(mergedFooterConfig),
    },
    update: {
      ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
      ...(input.faviconUrl !== undefined && { faviconUrl: input.faviconUrl }),
      ...(input.marketplaceName && { marketplaceName: input.marketplaceName }),
      ...(input.tagline !== undefined && { tagline: input.tagline }),
      ...(input.brandColor && { brandColor: input.brandColor }),
      ...(input.accentColor && { accentColor: input.accentColor }),
      ...(input.borderRadius && { borderRadius: input.borderRadius }),
      ...(input.fontHeading && { fontHeading: input.fontHeading }),
      ...(input.fontBody && { fontBody: input.fontBody }),
      ...(input.headerConfig && { headerConfigJson: JSON.stringify(mergedHeaderConfig) }),
      ...(input.footerConfig && { footerConfigJson: JSON.stringify(mergedFooterConfig) }),
    },
  });

  return {
    id: updated.id,
    logoUrl: updated.logoUrl,
    faviconUrl: updated.faviconUrl,
    marketplaceName: updated.marketplaceName,
    tagline: updated.tagline,
    brandColor: updated.brandColor,
    accentColor: updated.accentColor,
    borderRadius: updated.borderRadius,
    fontHeading: updated.fontHeading,
    fontBody: updated.fontBody,
    headerConfig: parseConfigJson<HeaderConfig>(updated.headerConfigJson, DEFAULT_HEADER_CONFIG),
    footerConfig: parseConfigJson<FooterConfig>(updated.footerConfigJson, DEFAULT_FOOTER_CONFIG),
    updatedAt: updated.updatedAt,
  };
}

export async function resetAppearanceSettings(): Promise<AppearanceSettingsDTO> {
  const reset = await prisma.appearanceSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      logoUrl: DEFAULT_APPEARANCE_SETTINGS.logoUrl,
      faviconUrl: DEFAULT_APPEARANCE_SETTINGS.faviconUrl,
      marketplaceName: DEFAULT_APPEARANCE_SETTINGS.marketplaceName,
      tagline: DEFAULT_APPEARANCE_SETTINGS.tagline,
      brandColor: DEFAULT_APPEARANCE_SETTINGS.brandColor,
      accentColor: DEFAULT_APPEARANCE_SETTINGS.accentColor,
      borderRadius: DEFAULT_APPEARANCE_SETTINGS.borderRadius,
      fontHeading: DEFAULT_APPEARANCE_SETTINGS.fontHeading,
      fontBody: DEFAULT_APPEARANCE_SETTINGS.fontBody,
      headerConfigJson: JSON.stringify(DEFAULT_HEADER_CONFIG),
      footerConfigJson: JSON.stringify(DEFAULT_FOOTER_CONFIG),
    },
    update: {
      logoUrl: DEFAULT_APPEARANCE_SETTINGS.logoUrl,
      faviconUrl: DEFAULT_APPEARANCE_SETTINGS.faviconUrl,
      marketplaceName: DEFAULT_APPEARANCE_SETTINGS.marketplaceName,
      tagline: DEFAULT_APPEARANCE_SETTINGS.tagline,
      brandColor: DEFAULT_APPEARANCE_SETTINGS.brandColor,
      accentColor: DEFAULT_APPEARANCE_SETTINGS.accentColor,
      borderRadius: DEFAULT_APPEARANCE_SETTINGS.borderRadius,
      fontHeading: DEFAULT_APPEARANCE_SETTINGS.fontHeading,
      fontBody: DEFAULT_APPEARANCE_SETTINGS.fontBody,
      headerConfigJson: JSON.stringify(DEFAULT_HEADER_CONFIG),
      footerConfigJson: JSON.stringify(DEFAULT_FOOTER_CONFIG),
    },
  });

  return {
    id: reset.id,
    logoUrl: reset.logoUrl,
    faviconUrl: reset.faviconUrl,
    marketplaceName: reset.marketplaceName,
    tagline: reset.tagline,
    brandColor: reset.brandColor,
    accentColor: reset.accentColor,
    borderRadius: reset.borderRadius,
    fontHeading: reset.fontHeading,
    fontBody: reset.fontBody,
    headerConfig: DEFAULT_HEADER_CONFIG,
    footerConfig: DEFAULT_FOOTER_CONFIG,
    updatedAt: reset.updatedAt,
  };
}

export function deriveCssVariables(settings: AppearanceSettingsDTO): Record<string, string> {
  return {
    "--brand-primary": settings.brandColor || "#2563eb",
    "--brand-accent": settings.accentColor || "#f97316",
    "--radius": settings.borderRadius || "8px",
    "--font-heading": settings.fontHeading || "Inter",
    "--font-body": settings.fontBody || "Inter",
    "--announcement-bg": settings.headerConfig?.announcementBgColor || "#1e293b",
    "--announcement-text": settings.headerConfig?.announcementTextColor || "#f8fafc",
  };
}

