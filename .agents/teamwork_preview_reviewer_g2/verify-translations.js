const fs = require('fs');
const path = require('path');

// We can require typescript files via dynamic transpilation or manual regex parsing
const trCode = fs.readFileSync(path.join(__dirname, '../../lib/i18n/translations/tr.ts'), 'utf8');
const enCode = fs.readFileSync(path.join(__dirname, '../../lib/i18n/translations/en.ts'), 'utf8');

function parseObjectKeys(code) {
  // strip export const ...
  const jsonLike = code.replace(/export\s+const\s+\w+\s*=\s*/, '');
  // parse using Function evaluator safely
  const fn = new Function('return ' + jsonLike.trim().replace(/;$/, ''));
  const obj = fn();
  
  function getNestedKeys(o, prefix = '') {
    let keys = [];
    for (const [k, v] of Object.entries(o)) {
      const fullKey = prefix ? ${prefix}. : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        keys.push(...getNestedKeys(v, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }
  return { obj, keys: getNestedKeys(obj) };
}

try {
  const trParsed = parseObjectKeys(trCode);
  const enParsed = parseObjectKeys(enCode);

  const trKeySet = new Set(trParsed.keys);
  const enKeySet = new Set(enParsed.keys);

  console.log(Total TR keys: );
  console.log(Total EN keys: );

  const missingInEn = trParsed.keys.filter(k => !enKeySet.has(k));
  const missingInTr = enParsed.keys.filter(k => !trKeySet.has(k));

  console.log(Missing in EN count: );
  if (missingInEn.length > 0) {
    console.log('Sample missing in EN:', missingInEn.slice(0, 15));
  }

  console.log(Missing in TR count: );
  if (missingInTr.length > 0) {
    console.log('Sample missing in TR:', missingInTr.slice(0, 15));
  }

  if (missingInEn.length === 0 && missingInTr.length === 0) {
    console.log('PERFECT 100% TR/EN SYMMETRY ACHIEVED!');
  }
} catch (e) {
  console.error('Parsing error:', e);
}
