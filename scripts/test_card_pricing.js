const fs = require('fs');
const path = 'C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity-ide\\brain\\a1a4b3a2-7665-43bf-afe2-eac367df8a32\\scratch\\victronic_toate_produsele.html';
const html = fs.readFileSync(path, 'utf8');

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

// 1. Map all productIds to their prices on this page
// Look for blocks with `productId: (\d+)` and prices inside
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

console.log('Prices mapped by PID:', pricesByPid.size);
for (const [pid, pr] of Array.from(pricesByPid.entries()).slice(0, 5)) {
  console.log(`PID ${pid} -> Sale: ${pr.salePrice}, Base: ${pr.basePrice}`);
}

// 2. Map product cards to PIDs and URLs
// Look for quick-view button or card container
const products = [];
// Find each product link
const cardRegex = /<a\s+class="[^"]*component-image[^"]*"\s+href="(https:\/\/www\.victronic\.ro\/[^"]+)"[^>]*>[\s\S]*?<img\s+class="[^"]*"\s+src="([^"]+)"/gi;
let cm;
while ((cm = cardRegex.exec(html)) !== null) {
  const url = cm[1];
  const img = cm[2];
  
  // Find PID in the context before or after this image
  const start = Math.max(0, cm.index - 1000);
  const end = Math.min(html.length, cm.index + 2500);
  const ctx = html.slice(start, end);

  const pidMatch = ctx.match(/productId:\s*(\d+)/i) || ctx.match(/uiComponentQuickViewButton\((\d+)\)/i);
  const pid = pidMatch ? pidMatch[1] : null;

  // Title
  const titleMatch = ctx.match(/<a\s+class="[^"]*ciojv[^"]*"[^>]*href="[^"]*"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : null;

  // Brand
  const brandMatch = ctx.match(/<span\s+class="[^"]*vx8ew_field"[^>]*>([\s\S]*?)<\/span>/i);
  const brand = brandMatch ? brandMatch[1].replace(/<[^>]+>/g, '').trim() : 'Victronic';

  const priceInfo = pid ? pricesByPid.get(pid) : null;

  products.push({
    url,
    pid,
    title,
    brand,
    img,
    price: priceInfo ? priceInfo.salePrice : null,
    basePrice: priceInfo ? priceInfo.basePrice : null
  });
}

console.log('\nProducts matched on page 1:', products.length);
console.log('Sample matched products:');
products.slice(0, 10).forEach(p => console.log(p));
