import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function ensureTmpDatabase(): string {
  const tmpDbPath = path.join("/tmp", "dev.db");

  let tmpValid = false;
  try {
    if (fs.existsSync(tmpDbPath) && fs.statSync(tmpDbPath).size > 0) {
      tmpValid = true;
    }
  } catch (e) {}

  if (!tmpValid) {
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

    let copied = false;
    for (const c of candidates) {
      try {
        if (fs.existsSync(c) && fs.statSync(c).size > 0) {
          fs.copyFileSync(c, tmpDbPath);
          copied = true;
          console.log(`[Prisma] Successfully initialized /tmp/dev.db from ${c}`);
          break;
        }
      } catch (e) {}
    }

    if (!copied) {
      try {
        if (!fs.existsSync(tmpDbPath)) {
          fs.writeFileSync(tmpDbPath, "");
        }
      } catch (e) {}
    }
  }

  return `file:${tmpDbPath}`;
}

function getDatabaseUrl(): string {
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

  const localDb = path.join(process.cwd(), "prisma", "dev.db");
  if (fs.existsSync(localDb)) {
    return `file:${localDb}`;
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

