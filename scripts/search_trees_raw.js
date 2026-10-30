const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scripts/teomarket_all_products_raw.json', 'utf8'));

console.log(`Loaded ${raw.length} raw products.`);

const trees = raw.filter(p => {
  const name = (p.name || '').toLowerCase();
  return name.includes('brad artificial') || name.includes('brazi artificiali') || (name.includes('brad') && name.includes('suport'));
});

console.log(`Trees matching: ${trees.length}`);

for (let i = 0; i < Math.min(10, trees.length); i++) {
  const t = trees[i];
  console.log(`[${t.id}] Stock: ${t.stock_quantity} | Name: ${t.name}`);
  console.log(`   Img: ${t.images?.[0]?.src}`);
}

