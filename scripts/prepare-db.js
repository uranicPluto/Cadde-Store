const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath) && !process.env.DATABASE_URL) {
  try {
    fs.writeFileSync(envPath, 'DATABASE_URL="file:./prisma/dev.db"\nJWT_SECRET="cadde-store-secure-jwt-secret-key-2026-production"\n', "utf8");
    console.log("[DB Config] Created default .env fallback file for build environments.");
  } catch (e) {}
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/dev.db";
}

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

if (fs.existsSync(schemaPath)) {
  let content = fs.readFileSync(schemaPath, "utf8");
  const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

  const targetProvider = isPostgres ? "postgresql" : "sqlite";
  const currentProviderMatch = content.match(/provider\s*=\s*"(sqlite|postgresql)"/);

  if (currentProviderMatch && currentProviderMatch[1] !== targetProvider) {
    console.log(`[DB Config] Switching Prisma provider from '${currentProviderMatch[1]}' to '${targetProvider}' based on DATABASE_URL...`);
    content = content.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${targetProvider}"`);
    fs.writeFileSync(schemaPath, content, "utf8");
  } else {
    console.log(`[DB Config] Prisma provider is correctly configured as '${targetProvider}'.`);
  }
}

