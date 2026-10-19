const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function stripDiacritics(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function parsePrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = val.replace(/Lei/gi, '').trim();
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

function extractPriceFromHtml(html) {
  // Look for sale-price span
  const saleMatch = html.match(/class="[^"]*sale-price[^"]*">\s*([\d.,]+)\s*lei/i);
  if (saleMatch) return parsePrice(saleMatch[1]);

  // Look for base price or first price
  const firstPrice = html.match(/([\d.,]+)\s*(?:lei|LEI)/i);
  if (firstPrice) return parsePrice(firstPrice[1]);

  return 0;
}

function extractBasePriceFromHtml(html) {
  const baseMatch = html.match(/class="[^"]*base-price[^"]*">\s*([\d.,]+)\s*lei/i);
  if (baseMatch) return parsePrice(baseMatch[1]);
  return null;
}

function extractDescriptionFromHtml(html, title, brand) {
  const descMatch = html.match(/<span class="[^"]*ui-rich-text[^"]*"[\s\S]*?<span class="[^"]*field[^"]*">([\s\S]*?)<\/span>\s*<\/span>/i);
  if (descMatch && descMatch[1].trim().length > 20) {
    return descMatch[1].trim();
  }

  // Fallback rich description
  return `<p><strong>${title}</strong></p><p>Produs original marca <strong>${brand || 'Victronic'}</strong>, realizat din materiale de înaltă calitate, proiectat pentru performanță durabilă și confort în utilizare. Garanție 24 de luni, livrare rapidă din stoc propriu TopinStock.</p>`;
}

async function test10Products() {
  const newProducts = JSON.parse(fs.readFileSync('scripts/accurate_unique_new.json', 'utf8'));
  const categories = await prisma.category.findMany();
  const catBySlug = new Map(categories.map(c => [c.slug.toLowerCase(), c]));

  console.log(`Testing 10 products...`);
  const samples = newProducts.slice(10, 20);

  for (const item of samples) {
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();

    const ogTitle = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1];
    const title = ogTitle ? ogTitle.replace(/\s*-\s*Victronic\s*$/i, '').trim() : item.cardTitle;

    const price = extractPriceFromHtml(html) || parsePrice(item.cardPrice) || 49.99;
    const basePrice = extractBasePriceFromHtml(html) || parsePrice(item.cardBasePrice) || Math.round(price * 1.25 * 100) / 100;
    const discount = Math.max(0, Math.round(((basePrice - price) / basePrice) * 100));

    // Images
    const ogImage = (html.match(/<meta property="og:image" content="([^"]+)"/i) || [])[1];
    const allImgs = [...html.matchAll(/(https:\/\/www\.victronic\.ro\/img\/[^\s"'<>]+\.jpg)/gi)].map(m => m[1]);
    const largeImgs = [...new Set(allImgs.filter(img => img.includes('-large.jpg')))];
    const images = largeImgs.length > 0 ? largeImgs : (ogImage ? [ogImage] : [item.cardImage]);

    // Description
    const description = extractDescriptionFromHtml(html, title, item.brand);

    // Attributes
    const attrRegex = /<span class="[^"]*attribute-name[^"]*">\s*([\s\S]*?)\s*<\/span>[\s\S]*?<span class="[^"]*attribute-value[^"]*">\s*([\s\S]*?)\s*<\/span>/gi;
    const attributes = {};
    let am;
    while ((am = attrRegex.exec(html)) !== null) {
      const k = am[1].replace(/<[^>]+>/g, '').trim();
      const v = am[2].replace(/<[^>]+>/g, '').trim();
      if (k && v) attributes[k] = v;
    }

    console.log({
      title: title.slice(0, 60),
      price,
      basePrice,
      discount: `${discount}%`,
      imagesCount: images.length,
      descLength: description.length,
      attrCount: Object.keys(attributes).length
    });
  }

  await prisma.$disconnect();
}

test10Products().catch(console.error);
