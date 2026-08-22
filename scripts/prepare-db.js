const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
const dbUrl = process.env.DATABASE_URL || "";

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
