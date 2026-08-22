import { UserSessionPayload } from "./auth";

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
