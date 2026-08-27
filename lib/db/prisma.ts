import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function findSourceDb(): string | null {
  const candidates = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "dev.db"),
    path.join(__dirname, "..", "..", "..", "prisma", "dev.db"),
    path.join(__dirname, "..", "..", "prisma", "dev.db"),
    path.join(__dirname, "..", "prisma", "dev.db"),
    path.join(__dirname, "prisma", "dev.db"),
    path.resolve("./prisma/dev.db"),
    path.resolve("./dev.db"),
    path.join(process.cwd(), ".next", "server", "prisma", "dev.db"),
  ];

  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).size > 0) {
        return c;
      }
    } catch (e) {}
  }
  return null;
}

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dev.db") && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  // Handle serverless read-write SQLite on Vercel / AWS Lambda
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
      const sourceDb = findSourceDb();
      if (sourceDb) {
        try {
          fs.copyFileSync(sourceDb, tmpDbPath);
        } catch (e) {
          console.error("Failed to copy SQLite database to /tmp:", e);
        }
      }
    }
    if (fs.existsSync(tmpDbPath) && fs.statSync(tmpDbPath).size > 0) {
      return `file:${tmpDbPath}`;
    }
  }

  const source = findSourceDb();
  if (source) {
    return `file:${source}`;
  }
  return "file:./prisma/dev.db";
}

const dbUrl = getDatabaseUrl();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

