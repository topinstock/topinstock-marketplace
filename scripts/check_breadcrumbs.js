const fs = require('fs');
const path = 'C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity-ide\\brain\\a1a4b3a2-7665-43bf-afe2-eac367df8a32\\scratch\\victronic_sample_product.html';
const html = fs.readFileSync(path, 'utf8');

const breadcrumbMatches = [...html.matchAll(/breadcrumb[\s\S]*?<\/ol>|breadcrumb[\s\S]*?<\/ul>|breadcrumb[\s\S]*?<\/nav>/gi)];
console.log('Breadcrumb tag matches:', breadcrumbMatches.length);

const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('breadcrumb') || l.includes('Acasă') || l.includes('Acasa') || l.includes('itemprop="item"')) {
    console.log(`[${i}] ${l.trim().slice(0, 150)}`);
  }
});
