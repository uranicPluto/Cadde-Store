const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '..', '..', 'tests', 'e2e');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));

files.forEach(f => {
  console.log(`\n================== ${f} ==================`);
  const content = fs.readFileSync(path.join(testDir, f), 'utf8');
  const regex = /test\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g;
  let match;
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    count++;
    console.log(`  [${count}] ${match[1]} — ${match[2]}`);
  }
});
