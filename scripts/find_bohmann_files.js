const fs = require('fs');
const path = require('path');

function searchFiles(dir, pattern, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      searchFiles(fullPath, pattern, results);
    } else if (/\.(tsx|ts|jsx|js|json|md)$/.test(entry.name)) {
      if (entry.name.endsWith('products_catalog_fallback.json')) continue; // handled via regen
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (pattern.test(content)) {
          results.push(fullPath);
        }
      } catch (e) {}
    }
  }
  return results;
}

const found = searchFiles(path.join(__dirname, '..'), /\bbohmann?\b/i);
console.log('Files containing bohman(n):');
found.forEach(f => console.log(' • ' + path.relative(path.join(__dirname, '..'), f)));

