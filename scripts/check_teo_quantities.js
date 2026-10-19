const fs = require('fs');
const path = require('path');

const teoPath = path.join(__dirname, '..', 'scripts', 'teomarket_all_products_raw.json');
const raw = JSON.parse(fs.readFileSync(teoPath, 'utf8'));

let withStock = 0;
let zeroStock = 0;
let nullStock = 0;
let sampleStock = [];

for (const p of raw) {
  if (p.stock_quantity > 0) {
    withStock++;
    if (sampleStock.length < 5) sampleStock.push({ id: p.id, stock: p.stock_quantity });
  } else if (p.stock_quantity === 0) {
    zeroStock++;
  } else {
    nullStock++;
  }
}

console.log({ withStock, zeroStock, nullStock, sampleStock });
