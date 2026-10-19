const fs = require('fs');
const path = 'C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity-ide\\brain\\a1a4b3a2-7665-43bf-afe2-eac367df8a32\\scratch\\victronic_toate_produsele.html';
const html = fs.readFileSync(path, 'utf8');

const regex = /<a\s+class="[^"]*component-image[^"]*"\s+href="(https:\/\/www\.victronic\.ro\/[^"]+)"/gi;
let m;
let count = 0;
while ((m = regex.exec(html)) !== null && count < 2) {
  count++;
  console.log(`\n=================== CARD ${count}: ${m[1]} ===================`);
  const start = Math.max(0, m.index - 500);
  const end = Math.min(html.length, m.index + 2000);
  console.log(html.slice(start, end));
}
