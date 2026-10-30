const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scripts/teomarket_all_products_raw.json', 'utf8'));

const trees = raw.filter(p => {
  const name = (p.name || '').toLowerCase();
  return name.includes('brad de craciun artificial') || name.includes('brad artificial') || name.includes('brazi artificiali');
});

console.log(`Trees matching: ${trees.length}`);

for (const t of trees) {
  console.log(`[${t.id}] Stock: ${t.stock_quantity} | ${t.name}`);
  if (t.images && t.images.length > 0) {
    console.log(`   Images:`, t.images.slice(0, 2));
  }
}

