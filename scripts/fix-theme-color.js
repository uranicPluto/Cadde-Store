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
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(fullPath);
    }
  });
  return results;
}

const appDir = path.join(__dirname, "..", "app");
const files = walk(appDir);
let found = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("themeColor")) {
    console.log("Found themeColor in:", path.relative(path.join(__dirname, ".."), file));
    // Remove themeColor: "..." or themeColor: '...' from metadata objects
    content = content.replace(/\s*themeColor:\s*["'][^"']+["'],?/g, "");
    fs.writeFileSync(file, content, "utf8");
    found++;
  }
});
console.log("Cleaned themeColor from files:", found);
