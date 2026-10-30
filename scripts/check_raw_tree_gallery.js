const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scripts/teomarket_all_products_raw.json', 'utf8'));

// Check product 12888
const p12888 = raw.find(p => p.id === 12888);
console.log('Product 12888 images:', p12888?.images);

// Check all tree products in raw that have stock >= 30
const sampleIds = [11860, 11866, 11870, 12886, 12888, 12889, 12894, 12911, 12912, 25093, 25094, 25095, 25664, 25665, 36628];
for (const id of sampleIds) {
  const item = raw.find(p => p.id === id);
  console.log(`[${id}] ${item?.name} -> images count: ${item?.images?.length}`);
  if (item?.images?.length > 1) {
    console.log('   All images:', item.images.map(img => img.src || img));
  }
}

