export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: AUTH_SECRET environment variable is missing in production.");
    }
    // Development fallback using a dynamic runtime key warning
    console.warn("WARNING: AUTH_SECRET is not set in environment variables. Using development key.");
    return new TextEncoder().encode("cadde-store-dev-only-local-jwt-signing-key-32chars!");
  }

  if (secret.length < 16) {
    console.warn("WARNING: AUTH_SECRET is shorter than 16 characters.");
  }

  return new TextEncoder().encode(secret);
}
