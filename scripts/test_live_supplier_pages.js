const fs = require('fs');

async function test() {
  // Test Victronic
  const vicRaw = JSON.parse(fs.readFileSync('scripts/victronic_complete_scraped.json', 'utf8'));
  console.log('Testing 5 Victronic URLs...');
  for (let i = 0; i < 5; i++) {
    const item = vicRaw[i];
    try {
      const res = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const hasAddToCart = html.includes('Adauga in cos') || html.includes('Adaugă în coș');
      const hasOutOfStock = html.includes('Stoc epuizat') || html.includes('stoc-epuizat') || html.includes('Indisponibil');
      console.log(`Victronic [${item.pid}]: status=${res.status}, hasAddToCart=${hasAddToCart}, hasOutOfStock=${hasOutOfStock}`);
    } catch (e) {
      console.log(`Victronic [${item.pid}] err: ${e.message}`);
    }
  }

  // Test Spincom
  const spinRaw = JSON.parse(fs.readFileSync('scratch/spincom_products.json', 'utf8'));
  console.log('\nTesting 5 Spincom URLs...');
  for (let i = 0; i < 5; i++) {
    const item = spinRaw[i];
    try {
      const res = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const inStock = html.includes('stock.in-stock') || html.includes('În stoc') || html.includes('In stoc');
      const outOfStock = html.includes('stock.out-of-stock') || html.includes('Stoc epuizat');
      console.log(`Spincom [${item.title.slice(0, 25)}]: status=${res.status}, inStock=${inStock}, outOfStock=${outOfStock}`);
    } catch (e) {
      console.log(`Spincom err: ${e.message}`);
    }
  }
}

test();
