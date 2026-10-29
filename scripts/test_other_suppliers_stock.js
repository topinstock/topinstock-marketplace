const fs = require('fs');
const path = require('path');

async function testKt() {
  console.log('Testing KitchenTools live product API...');
  try {
    const res = await fetch('https://kitchentools.ro/products.json?limit=5');
    const json = await res.json();
    console.log('KT products count:', json.products?.length);
    if (json.products?.[0]) {
      const p = json.products[0];
      console.log('KT sample product:', {
        id: p.id,
        title: p.title,
        handle: p.handle,
        variant: p.variants?.[0]
      });
    }
  } catch (e) {
    console.error('KT error:', e.message);
  }
}

async function testVictronic() {
  console.log('\nTesting Victronic product page for stock details...');
  try {
    const vicRaw = JSON.parse(fs.readFileSync('scripts/victronic_complete_scraped.json', 'utf8'));
    // pick 3 products from vicRaw
    for (let i = 0; i < 3; i++) {
      const item = vicRaw[i];
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await res.text();
      // Look for stock numbers or inputs
      const stockMatches = [...html.matchAll(/(stoc|bucati|disponibil|cantitate)[^<>\n\r]{0,50}/gi)].map(m => m[0].trim());
      console.log(`Victronic [${item.title.slice(0, 30)}]:`, stockMatches.slice(0, 5));
    }
  } catch (e) {
    console.error('Victronic error:', e.message);
  }
}

async function testSpincom() {
  console.log('\nTesting Spincom product page for stock details...');
  try {
    const spinRaw = JSON.parse(fs.readFileSync('scratch/spincom_products.json', 'utf8'));
    for (let i = 0; i < 3; i++) {
      const item = spinRaw[i];
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await res.text();
      const stockMatches = [...html.matchAll(/(stoc|disponibilitate|bucati)[^<>\n\r]{0,50}/gi)].map(m => m[0].trim());
      console.log(`Spincom [${item.title.slice(0, 30)}]:`, stockMatches.slice(0, 5));
    }
  } catch (e) {
    console.error('Spincom error:', e.message);
  }
}

async function main() {
  await testKt();
  await testVictronic();
  await testSpincom();
}

main();
