const fs = require('fs');

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function getAllProductUrls() {
  console.log('Fetching all 42 pages of toate-produsele...');
  const totalPages = 42;
  const pagePromises = [];

  // Let's fetch pages in batches of 6 concurrently
  const batchSize = 6;
  const allProducts = new Map(); // url -> basic info

  for (let i = 1; i <= totalPages; i += batchSize) {
    const batch = [];
    for (let p = i; p < i + batchSize && p <= totalPages; p++) {
      batch.push(p);
    }

    console.log(`Fetching pages ${batch.join(', ')}...`);
    const results = await Promise.all(batch.map(async pageNum => {
      const pageUrl = `https://www.victronic.ro/toate-produsele?page=${pageNum}`;
      const html = await fetchWithRetry(pageUrl);
      
      // Parse product cards from html
      // Each card has: <a class="...component-image..." href="URL"> <img src="IMG" ...></a>
      const cardRegex = /<a\s+class="[^"]*component-image[^"]*"\s+href="(https:\/\/www\.victronic\.ro\/[^"]+)"[^>]*>[\s\S]*?<img\s+class="[^"]*"\s+src="([^"]+)"/gi;
      let m;
      const items = [];
      while ((m = cardRegex.exec(html)) !== null) {
        const url = m[1];
        const img = m[2];
        const cardSlice = html.slice(m.index, m.index + 2500);

        // Price
        const priceMatch = cardSlice.match(/class="[^"]*sale-price[^"]*">\s*([\d.,]+)\s*lei/i) || cardSlice.match(/([\d.,]+)\s*lei/i);
        const price = priceMatch ? priceMatch[1] : null;

        // Base price
        const basePriceMatch = cardSlice.match(/class="[^"]*base-price[^"]*">\s*([\d.,]+)\s*lei/i);
        const basePrice = basePriceMatch ? basePriceMatch[1] : null;

        // Title
        const titleMatch = cardSlice.match(/<a\s+class="[^"]*ciojv[^"]*"[^>]*href="[^"]*"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : null;

        // Brand
        const brandMatch = cardSlice.match(/<span\s+class="[^"]*vx8ew_field"[^>]*>([\s\S]*?)<\/span>/i);
        const brand = brandMatch ? brandMatch[1].replace(/<[^>]+>/g, '').trim() : null;

        // Product ID
        const pidMatch = cardSlice.match(/productId:\s*(\d+)/i) || cardSlice.match(/uiComponentQuickViewButton\((\d+)\)/i);
        const pid = pidMatch ? pidMatch[1] : null;

        items.push({
          url,
          cardImage: img,
          cardTitle: title,
          cardPrice: price,
          cardBasePrice: basePrice,
          brand,
          pid,
          page: pageNum
        });
      }
      return items;
    }));

    results.flat().forEach(item => {
      if (!allProducts.has(item.url)) {
        allProducts.set(item.url, item);
      }
    });

    // Small delay between batches to be respectful to the server
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nFinished fetching pages! Total unique products discovered: ${allProducts.size}`);
  const list = Array.from(allProducts.values());
  fs.writeFileSync('scripts/victronic_all_products_raw.json', JSON.stringify(list, null, 2));
  console.log('Saved to scripts/victronic_all_products_raw.json');
}

getAllProductUrls().catch(console.error);
