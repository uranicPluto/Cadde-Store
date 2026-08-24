import { UserSessionPayload } from "./auth";

export type AdminRole =
  | "SUPER_ADMIN"
  | "CONTENT_MANAGER"
  | "MERCHANDISING_MANAGER"
  | "MARKETING_MANAGER"
  | "OPERATIONS_MANAGER";

export type AdminResource =
  | "PAGES"
  | "HOMEPAGE"
  | "MEDIA"
  | "NAVIGATION"
  | "APPEARANCE"
  | "LAYOUTS"
  | "CATALOG"
  | "MARKETING"
  | "ORDERS"
  | "RETURNS"
  | "SELLERS"
  | "CUSTOMERS"
  | "SETTINGS"
  | "AUDIT"
  | "ANALYTICS"
  | "HEALTH";

export type AdminAction = "READ" | "WRITE" | "DELETE" | "PUBLISH" | "ALL";

export const ROLE_PERMISSIONS_MAP: Record<AdminRole, Record<string, AdminAction[]>> = {
  SUPER_ADMIN: {
    PAGES: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    HOMEPAGE: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    MEDIA: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    NAVIGATION: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    APPEARANCE: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    LAYOUTS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    CATALOG: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    MARKETING: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    ORDERS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    RETURNS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    SELLERS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    CUSTOMERS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    SETTINGS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    AUDIT: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    ANALYTICS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    HEALTH: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
  },
  CONTENT_MANAGER: {
    PAGES: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    HOMEPAGE: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    MEDIA: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    NAVIGATION: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    APPEARANCE: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    LAYOUTS: ["READ", "WRITE"],
    ANALYTICS: ["READ"],
    HEALTH: ["READ"],
  },
  MERCHANDISING_MANAGER: {
    CATALOG: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    LAYOUTS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    HOMEPAGE: ["READ", "WRITE"],
    MEDIA: ["READ", "WRITE"],
    MARKETING: ["READ", "WRITE"],
    ANALYTICS: ["READ"],
    HEALTH: ["READ"],
  },
  MARKETING_MANAGER: {
    MARKETING: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    HOMEPAGE: ["READ", "WRITE"],
    MEDIA: ["READ", "WRITE"],
    ANALYTICS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    PAGES: ["READ", "WRITE"],
    HEALTH: ["READ"],
  },
  OPERATIONS_MANAGER: {
    ORDERS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    RETURNS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    SELLERS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    CUSTOMERS: ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"],
    HEALTH: ["READ", "WRITE"],
    AUDIT: ["READ"],
    ANALYTICS: ["READ"],
  },
};

export const ROLE_METADATA: Record<AdminRole, { nameTr: string; nameEn: string; descriptionTr: string; descriptionEn: string }> = {
  SUPER_ADMIN: {
    nameTr: "Süper Yönetici",
    nameEn: "Super Admin",
    descriptionTr: "Platformun tüm modülleri, ayarları ve audit logları üzerinde tam yetkiye sahiptir.",
    descriptionEn: "Full unrestricted authority across all platform modules, settings, and governance.",
  },
  CONTENT_MANAGER: {
    nameTr: "İçerik Yöneticisi",
    nameEn: "Content Manager",
    descriptionTr: "Sayfa oluşturucu, ana sayfa vitrini, medya kütüphanesi ve menüleri yönetir.",
    descriptionEn: "Manages page builder, homepage studio, media asset library, and navigation menus.",
  },
  MERCHANDISING_MANAGER: {
    nameTr: "Merchandising Yöneticisi",
    nameEn: "Merchandising Manager",
    descriptionTr: "Ürün kataloğu, kategoriler, markalar ve sayfa düzen bloklarını yönetir.",
    descriptionEn: "Manages product catalog, categories, brands, and detail page layout configurators.",
  },
  MARKETING_MANAGER: {
    nameTr: "Pazarlama Yöneticisi",
    nameEn: "Marketing Manager",
    descriptionTr: "Kampanyalar, kuponlar, SEO optimizasyonu ve performans analitiğini yönetir.",
    descriptionEn: "Manages promotional campaigns, coupons, SEO control center, and analytics dashboards.",
  },
  OPERATIONS_MANAGER: {
    nameTr: "Operasyon Yöneticisi",
    nameEn: "Operations Manager",
    descriptionTr: "Siparişler, kargo takibi, iade süreçleri ve satıcı denetimlerini yönetir.",
    descriptionEn: "Manages order fulfillments, carrier tracking, return logistics, and merchant governance.",
  },
};

export function isCustomer(session: UserSessionPayload | null): boolean {
  return !!session && (session.role === "CUSTOMER" || session.role === "SELLER" || session.role === "ADMIN");
}

export function isSeller(session: UserSessionPayload | null): boolean {
  return !!session && (session.role === "SELLER" || session.role === "ADMIN");
}

export function isAdmin(session: UserSessionPayload | null): boolean {
  return !!session && session.role === "ADMIN";
}

export function canModifySellerData(session: UserSessionPayload | null, targetSellerSlug?: string): boolean {
  if (!session) return false;
  if (session.role === "ADMIN") return true;
  if (session.role === "SELLER" && session.sellerSlug && targetSellerSlug) {
    return session.sellerSlug === targetSellerSlug;
  }
  return false;
}

export function getAdminRole(session: UserSessionPayload | null): AdminRole {
  if (!session || session.role !== "ADMIN") return "CONTENT_MANAGER";
  if (session.adminRole && session.adminRole in ROLE_PERMISSIONS_MAP) {
    return session.adminRole as AdminRole;
  }
  return "SUPER_ADMIN";
}

export function hasAdminPermission(
  session: UserSessionPayload | null,
  resource: AdminResource,
  action: AdminAction = "READ"
): boolean {
  if (!session || session.role !== "ADMIN") return false;
  const role = getAdminRole(session);
  if (role === "SUPER_ADMIN") return true;

  const perms = ROLE_PERMISSIONS_MAP[role];
  if (!perms) return false;

  const allowedActions = perms[resource];
  if (!allowedActions) return false;

  return allowedActions.includes(action) || allowedActions.includes("ALL");
}

export function isSuperAdmin(session: UserSessionPayload | null): boolean {
  return isAdmin(session) && getAdminRole(session) === "SUPER_ADMIN";
}

export function isContentManager(session: UserSessionPayload | null): boolean {
  return isAdmin(session) && (getAdminRole(session) === "CONTENT_MANAGER" || isSuperAdmin(session));
}

export function isMerchandisingManager(session: UserSessionPayload | null): boolean {
  return isAdmin(session) && (getAdminRole(session) === "MERCHANDISING_MANAGER" || isSuperAdmin(session));
}

export function isMarketingManager(session: UserSessionPayload | null): boolean {
  return isAdmin(session) && (getAdminRole(session) === "MARKETING_MANAGER" || isSuperAdmin(session));
}

export function isOperationsManager(session: UserSessionPayload | null): boolean {
  return isAdmin(session) && (getAdminRole(session) === "OPERATIONS_MANAGER" || isSuperAdmin(session));
}

export function getRolePermissions(role: AdminRole): Record<string, AdminAction[]> {
  return ROLE_PERMISSIONS_MAP[role] || {};
}

