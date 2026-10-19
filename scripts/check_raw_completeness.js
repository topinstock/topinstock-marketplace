const fs = require('fs');
const products = JSON.parse(fs.readFileSync('scripts/victronic_all_products_raw.json', 'utf8'));

let withTitle = 0;
let withPrice = 0;
let withImage = 0;
let withBrand = 0;

products.forEach(p => {
  if (p.cardTitle) withTitle++;
  if (p.cardPrice) withPrice++;
  if (p.cardImage) withImage++;
  if (p.brand) withBrand++;
});

console.log(`Total products in raw JSON: ${products.length}`);
console.log(`With Title: ${withTitle} / ${products.length}`);
console.log(`With Price: ${withPrice} / ${products.length}`);
console.log(`With Image: ${withImage} / ${products.length}`);
console.log(`With Brand: ${withBrand} / ${products.length}`);

// Sample 5
console.log('\nSample 5 products from raw JSON:');
products.slice(0, 5).forEach(p => console.log(p));
