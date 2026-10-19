const fs = require('fs');
const path = require('path');

function findLinks(dir, links = new Set()) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') findLinks(full, links);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.matchAll(/href=["'](\/[^"'#?]*)["']/g);
      for (const m of matches) {
        links.add(m[1]);
      }
    }
  }
  return links;
}

const appLinks = findLinks('./app');
const compLinks = findLinks('./components');
const allLinks = Array.from(new Set([...appLinks, ...compLinks])).sort();

console.log('Total unique links found:', allLinks.length);
allLinks.forEach((l) => console.log(l));
