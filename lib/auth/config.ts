export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "cadde-store-production-fallback-secret-jwt-key-2026-secure-32chars!";
  return new TextEncoder().encode(secret);
}
