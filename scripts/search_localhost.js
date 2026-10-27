const fs = require('fs');
const path = require('path');

function search(dir, pattern, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      search(full, pattern, results);
    } else if (/\.(tsx?|jsx?|mjs|env.*)$/.test(entry.name)) {
      try {
        const text = fs.readFileSync(full, 'utf8');
        const lines = text.split('\n');
        lines.forEach((line, i) => {
          if (pattern.test(line)) {
            results.push({ file: path.relative(path.join(__dirname, '..'), full), lineNum: i + 1, line: line.trim() });
          }
        });
      } catch (e) {}
    }
  }
  return results;
}

const hits = search(path.join(__dirname, '..'), /localhost:3000/);
console.log(`Found ${hits.length} hits for localhost:3000:`);
hits.forEach(h => console.log(`${h.file}:${h.lineNum} -> ${h.line}`));

