const fs = require('fs');

async function testSampleVictronic() {
  const raw = JSON.parse(fs.readFileSync('scripts/victronic_complete_scraped.json', 'utf8'));
  console.log('Total Victronic scraped:', raw.length);

  // pick 15 random items
  const samples = [];
  for (let i = 0; i < 15; i++) {
    const idx = Math.floor(Math.random() * raw.length);
    samples.push(raw[idx]);
  }

  for (const item of samples) {
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000)
      });
      const html = await res.text();
      const hasAddToCart = html.includes('Adauga in cos') || html.includes('Adaugă în coș');
      const hasOutOfStock = html.includes('Stoc epuizat') || html.includes('Indisponibil') || html.includes('stoc 0') || html.includes('out-of-stock');
      console.log(`[Status ${res.status}] Cart: ${hasAddToCart}, OOS: ${hasOutOfStock} - ${item.title.slice(0, 50)}`);
    } catch (e) {
      console.log(`Error fetching ${item.url}: ${e.message}`);
    }
  }
}

testSampleVictronic();
