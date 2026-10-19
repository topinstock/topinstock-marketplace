const fs = require('fs');
const path = require('path');

function analyzeTeo() {
  const file = path.join(__dirname, 'teomarket_all_products_raw.json');
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  let inStock = 0;
  let outOfStock = 0;
  for (const p of raw) {
    const qty = p.stock_quantity !== undefined ? p.stock_quantity : (p.total_variants_stock || 0);
    if (qty > 0) inStock++;
    else outOfStock++;
  }
  return { site: 'teomarket.com', total: raw.length, inStock, outOfStock };
}

function analyzeVictronic() {
  const file = path.join(__dirname, 'victronic_complete_scraped.json');
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  let inStock = 0;
  let outOfStock = 0;
  let unknown = 0;
  for (const p of raw) {
    if (p.stock !== undefined) {
      if (p.stock > 0 || p.inStock === true) inStock++;
      else outOfStock++;
    } else {
      unknown++;
    }
  }
  return { site: 'victronic.ro', total: raw.length, inStock, outOfStock, unknown, sample: raw[0] };
}

function analyzeKitchenTools() {
  const file = path.join(__dirname, '../scratch/kitchentools_all_products.json');
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  let inStock = 0;
  let outOfStock = 0;
  for (const p of raw) {
    const isAvail = p.variants?.some(v => v.available === true);
    if (isAvail) inStock++;
    else outOfStock++;
  }
  return { site: 'kitchentools.ro', total: raw.length, inStock, outOfStock, sampleVariant: raw[0]?.variants?.[0] };
}

function analyzeSpincom() {
  const file = path.join(__dirname, '../scratch/spincom_products.json');
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { site: 'spincomexim.ro', total: raw.length, sample: raw[0] };
}

console.log('--- TEOMARKET ---', analyzeTeo());
console.log('--- VICTRONIC ---', analyzeVictronic());
console.log('--- KITCHENTOOLS ---', analyzeKitchenTools());
console.log('--- SPINCOM ---', analyzeSpincom());
