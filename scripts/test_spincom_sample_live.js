const fs = require('fs');

async function testSampleSpincom() {
  const raw = JSON.parse(fs.readFileSync('scratch/spincom_products.json', 'utf8'));
  console.log('Total Spincom products:', raw.length);

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
      const hasAddToCart = html.includes('button-cart') || html.includes('Adauga in Cos') || html.includes('Adaugă în coș');
      const hasOutOfStock = html.includes('Stoc epuizat') || html.includes('Nu este in stoc') || html.includes('indisponibil') || html.includes('Lipsa stoc');
      
      // Look for stock text in opencart format: "Disponibilitate:" or "Stoc:"
      const dispMatch = html.match(/Disponibilitate:?\s*<\/b>([^<]+)/i) || html.match(/Disponibilitate:?<\/span>([^<]+)/i);
      const dispText = dispMatch ? dispMatch[1].trim() : 'N/A';

      console.log(`[Status ${res.status}] Cart: ${hasAddToCart}, OOS: ${hasOutOfStock}, Disp: "${dispText}" - ${item.title.slice(0, 45)}`);
    } catch (e) {
      console.log(`Error fetching ${item.url}: ${e.message}`);
    }
  }
}

testSampleSpincom();
