const fs = require('fs');
const readline = require('readline');

async function searchTeo() {
  console.log('Searching teomarket_all_products_raw.json for joma...');
  const data = JSON.parse(fs.readFileSync('scripts/teomarket_all_products_raw.json', 'utf8'));
  console.log(`Loaded ${data.length} products.`);

  const jomaItems = data.filter(p => {
    const s = (JSON.stringify(p)).toLowerCase();
    return s.includes('joma');
  });

  console.log(`Found ${jomaItems.length} Joma items in TeoMarket raw!`);
  jomaItems.slice(0, 30).forEach((p, i) => {
    console.log(`[${i+1}] ${p.sku || p.id} | ${p.title || p.name}`);
  });
}

searchTeo().catch(console.error);

