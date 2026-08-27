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

// Ensure dev.db is in public/ for guaranteed Vercel serverless bundling
try {
  const sourceDb = path.join(__dirname, "..", "prisma", "dev.db");
  const publicDb = path.join(__dirname, "..", "public", "dev.db");
  if (fs.existsSync(sourceDb)) {
    fs.copyFileSync(sourceDb, publicDb);
    console.log("[DB Config] Synchronized prisma/dev.db -> public/dev.db for Vercel deployment.");
  }
} catch (e) {}


