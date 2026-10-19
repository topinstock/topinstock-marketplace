const fs = require('fs');
const path = 'C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity-ide\\brain\\a1a4b3a2-7665-43bf-afe2-eac367df8a32\\scratch\\victronic_toate_produsele.html';
const html = fs.readFileSync(path, 'utf8');

// Search for prices on page 1 of toate-produsele
// Find all instances of "lei" or "LEI"
const matches = [...html.matchAll(/([0-9.,]+)\s*(?:lei|LEI)/gi)];
console.log('Prices found on page 1 of toate-produsele:', matches.length);
matches.slice(0, 30).forEach(m => console.log(m[0]));

// Let's see the context of the first 3 prices
matches.slice(0, 3).forEach((m, idx) => {
  console.log(`\n--- PRICE ${idx+1} CONTEXT ---`);
  const start = Math.max(0, m.index - 300);
  const end = Math.min(html.length, m.index + 300);
  console.log(html.slice(start, end));
});
