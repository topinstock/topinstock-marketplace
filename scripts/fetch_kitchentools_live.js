const fs = require('fs');

async function fetchAllKitchenToolsLive() {
  console.log('Fetching live KitchenTools products...');
  let page = 1;
  const allProducts = [];
  while (true) {
    try {
      const url = `https://kitchentools.ro/products.json?limit=250&page=${page}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) break;
      const json = await res.json();
      if (!json.products || json.products.length === 0) break;
      allProducts.push(...json.products);
      console.log(`Page ${page}: got ${json.products.length} items (total: ${allProducts.length})`);
      page++;
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`Error on page ${page}:`, e.message);
      break;
    }
  }

  console.log(`Fetched total ${allProducts.length} items from KitchenTools live.`);
  fs.writeFileSync('scratch/kitchentools_live_fresh.json', JSON.stringify(allProducts, null, 2));

  let inStockCount = 0;
  let outOfStockCount = 0;
  const outOfStockHandles = [];

  for (const p of allProducts) {
    const isAvail = p.variants?.some(v => v.available === true);
    if (isAvail) {
      inStockCount++;
    } else {
      outOfStockCount++;
      outOfStockHandles.push(p.handle);
    }
  }

  console.log({
    inStockCount,
    outOfStockCount,
    sampleOutOfStockHandles: outOfStockHandles.slice(0, 10)
  });
}

fetchAllKitchenToolsLive();
