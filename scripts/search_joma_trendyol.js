const fs = require('fs');
const path = require('path');

const candidates = [
  'C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity-ide\\brain\\94f7b8de-546a-4a47-b765-0618eeea7d19\\scratch\\all_trendyol_products.json',
  'C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity\\brain'
];

async function checkTrendyol() {
  const p = candidates[0];
  if (fs.existsSync(p)) {
    console.log('Found all_trendyol_products.json!');
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    const items = data.products || data;
    console.log(`Total products in file: ${items.length}`);
    const joma = items.filter(x => {
      const str = JSON.stringify(x).toLowerCase();
      return str.includes('joma');
    });
    console.log(`Joma in all_trendyol_products.json: ${joma.length}`);
    const tracksuits = joma.filter(x => {
      const name = (x.name || x.title || '').toLowerCase();
      return name.includes('trening') || name.includes('tracksuit') || name.includes('pantalon') || name.includes('bluza') || name.includes('hanorac') || name.includes('jacket');
    });
    console.log(`Tracksuit/clothing in Joma: ${tracksuits.length}`);
    tracksuits.slice(0, 20).forEach(x => console.log(x.name || x.title));
  } else {
    console.log('Not found:', p);
  }
}

checkTrendyol().catch(console.error);

