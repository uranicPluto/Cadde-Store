import { PrismaClient } from "@prisma/client";

function ensureTmpDatabase(): string {
  if (typeof window !== "undefined") return "file:/tmp/dev.db";

  try {
    const fs = require("fs");
    const path = require("path");
    const tmpDbPath = "/tmp/dev.db";

    let tmpValid = false;
    try {
      if (fs.existsSync(tmpDbPath) && fs.statSync(tmpDbPath).size > 1000) {
        tmpValid = true;
      }
    } catch (e) {}

    if (!tmpValid) {
      const candidates = [
        path.join(process.cwd(), "public", "dev.db"),
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.resolve("./public/dev.db"),
        path.resolve("./prisma/dev.db"),
        path.resolve("./dev.db"),
        "/var/task/public/dev.db",
        "/var/task/prisma/dev.db",
      ];

      for (const c of candidates) {
        try {
          if (fs.existsSync(c) && fs.statSync(c).size > 1000) {
            fs.copyFileSync(c, tmpDbPath);
            try {
              fs.chmodSync(tmpDbPath, 0o666);
            } catch (e) {}
            console.log(`[Prisma] Successfully initialized /tmp/dev.db from ${c}`);
            break;
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  return "file:/tmp/dev.db";
}

function getDatabaseUrl(): string {
  if (typeof window !== "undefined") return "file:./prisma/dev.db";

  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("dev.db") &&
    !process.env.DATABASE_URL.startsWith("file:")
  ) {
    return process.env.DATABASE_URL;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    return ensureTmpDatabase();
  }

  try {
    const fs = require("fs");
    const path = require("path");
    const localDb = path.join(process.cwd(), "prisma", "dev.db");
    if (fs.existsSync(localDb)) {
      return `file:${localDb}`;
    }
  } catch (e) {}

  return "file:./prisma/dev.db";
}

const dbUrl = getDatabaseUrl();
if (typeof window === "undefined" && !process.env.DATABASE_URL) {
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


