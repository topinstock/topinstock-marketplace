const fs = require('fs');

function parsePrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = val.toString().replace(/Lei/gi, '').trim();
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

async function scrapeAllPages() {
  console.log('Scraping all 42 pages of toate-produsele with complete prices and details...');
  const totalPages = 42;
  const batchSize = 6;
  const allProducts = new Map();

  for (let i = 1; i <= totalPages; i += batchSize) {
    const batch = [];
    for (let p = i; p < i + batchSize && p <= totalPages; p++) {
      batch.push(p);
    }
    console.log(`Fetching pages ${batch.join(', ')}...`);

    const pageResults = await Promise.all(batch.map(async pageNum => {
      const pageUrl = `https://www.victronic.ro/toate-produsele?page=${pageNum}`;
      const html = await fetchWithRetry(pageUrl);

      // 1. Map PID to price
      const pricesByPid = new Map();
      const priceBlockRegex = /x-data="uiComponentPrice\(\{[\s\S]*?productId:\s*(\d+)[\s\S]*?\}\)"[\s\S]*?<\/div>/gi;
      let pm;
      while ((pm = priceBlockRegex.exec(html)) !== null) {
        const pid = pm[1];
        const block = pm[0];
        const saleMatch = block.match(/class="[^"]*sale-price[^"]*">\s*([\d.,]+)\s*lei/i);
        const baseMatch = block.match(/class="[^"]*base-price[^"]*">\s*([\d.,]+)\s*lei/i);
        const anyPriceMatch = block.match(/([\d.,]+)\s*lei/i);

        const salePrice = saleMatch ? parsePrice(saleMatch[1]) : (anyPriceMatch ? parsePrice(anyPriceMatch[1]) : 0);
        const basePrice = baseMatch ? parsePrice(baseMatch[1]) : salePrice;

        if (salePrice > 0) {
          if (!pricesByPid.has(pid) || saleMatch) {
            pricesByPid.set(pid, { salePrice, basePrice });
          }
        }
      }

      // 2. Extract cards
      const cardRegex = /<a\s+class="[^"]*component-image[^"]*"\s+href="(https:\/\/www\.victronic\.ro\/[^"]+)"[^>]*>[\s\S]*?<img\s+class="[^"]*"\s+src="([^"]+)"/gi;
      let cm;
      const pageItems = [];
      while ((cm = cardRegex.exec(html)) !== null) {
        const url = cm[1];
        const mediumImg = cm[2];
        const largeImg = mediumImg.replace(/-medium\.jpg/i, '-large.jpg');

        const start = Math.max(0, cm.index - 1000);
        const end = Math.min(html.length, cm.index + 2500);
        const ctx = html.slice(start, end);

        const pidMatch = ctx.match(/productId:\s*(\d+)/i) || ctx.match(/uiComponentQuickViewButton\((\d+)\)/i);
        const pid = pidMatch ? pidMatch[1] : null;

        const titleMatch = ctx.match(/<a\s+class="[^"]*ciojv[^"]*"[^>]*href="[^"]*"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : null;

        const brandMatch = ctx.match(/<span\s+class="[^"]*vx8ew_field"[^>]*>([\s\S]*?)<\/span>/i);
        const brand = brandMatch ? brandMatch[1].replace(/<[^>]+>/g, '').trim() : 'Victronic';

        const priceInfo = pid ? pricesByPid.get(pid) : null;
        let price = priceInfo ? priceInfo.salePrice : 0;
        let basePrice = priceInfo ? priceInfo.basePrice : 0;

        // Fallback for price if PID didn't match
        if (price === 0) {
          const directSale = ctx.match(/class="[^"]*sale-price[^"]*">\s*([\d.,]+)\s*lei/i);
          const directBase = ctx.match(/class="[^"]*base-price[^"]*">\s*([\d.,]+)\s*lei/i);
          if (directSale) price = parsePrice(directSale[1]);
          if (directBase) basePrice = parsePrice(directBase[1]);
        }

        pageItems.push({
          url,
          pid,
          title,
          brand,
          image: largeImg,
          price,
          basePrice: basePrice || price,
          page: pageNum
        });
      }

      return pageItems;
    }));

    pageResults.flat().forEach(item => {
      if (!allProducts.has(item.url)) {
        allProducts.set(item.url, item);
      }
    });

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nAll 42 pages scraped! Total unique products: ${allProducts.size}`);
  const list = Array.from(allProducts.values());

  const withPrice = list.filter(p => p.price > 0).length;
  console.log(`Products with valid prices: ${withPrice} / ${list.length}`);

  fs.writeFileSync('scripts/victronic_complete_scraped.json', JSON.stringify(list, null, 2));
  console.log('Saved to scripts/victronic_complete_scraped.json');
}

scrapeAllPages().catch(console.error);
