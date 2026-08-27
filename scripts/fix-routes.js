const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file === "route.ts" || file === "route.js") {
      results.push(fullPath);
    }
  });
  return results;
}

const apiDir = path.join(__dirname, "..", "app", "api");
const routeFiles = walk(apiDir);
let fixedCount = 0;

routeFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  if (
    !content.includes('export const dynamic = "force-dynamic"') &&
    !content.includes("export const dynamic = 'force-dynamic'")
  ) {
    if (content.startsWith("export {")) {
      content = 'export const dynamic = "force-dynamic";\nexport const revalidate = 0;\n' + content;
    } else {
      const importRegex = /^import\s+.*?from\s+.*?;?\r?\n/gm;
      let lastMatch = null;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastMatch = match;
      }
      if (lastMatch) {
        const insertIdx = lastMatch.index + lastMatch[0].length;
        content =
          content.slice(0, insertIdx) +
          '\nexport const dynamic = "force-dynamic";\nexport const revalidate = 0;\n' +
          content.slice(insertIdx);
      } else {
        content = 'export const dynamic = "force-dynamic";\nexport const revalidate = 0;\n' + content;
      }
    }
    fs.writeFileSync(file, content, "utf8");
    fixedCount++;
    console.log("Added force-dynamic to:", path.relative(path.join(__dirname, ".."), file));
  }
});
console.log("Total routes updated with force-dynamic:", fixedCount);
