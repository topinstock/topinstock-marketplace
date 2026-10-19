const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function stripDiacritics(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeTitle(text) {
  return stripDiacritics(text)
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

const PARENT_CATEGORIES = [
  {
    slug: 'bucatarie-menaj',
    keywords: [
      'oale', 'oala', 'tigai', 'tigaie', 'cratita', 'cratite', 'vesela', 'cutit', 'cutite', 
      'tacamuri', 'farfurii', 'farfurie', 'bol', 'boluri', 'caserole', 'caserola', 'borcan', 
      'ceainic', 'carafe', 'termos', 'cesti', 'sticla', 'scurgator', 'tocator', 'tocatoare', 
      'ustensile', 'ibric', 'ibrice', 'tava', 'tavi', 'platou', 'platouri', 'oliviera', 
      'condimente', 'marmita', 'razatoare', 'frapiera', 'shaker', 'pahar', 'pahare', 'forme prajituri',
      'friteuza', 'cana', 'halba', 'servire', 'bucatarie', 'inox', 'teflon', 'bambus'
    ]
  },
  {
    slug: 'electrocasnice',
    keywords: [
      'blender', 'mixer', 'calorifer', 'ventilator', 'fier de calcat', 'tocat carne', 
      'rasnita', 'prajitor', 'fierbator', 'cafetiera', 'storcator', 'multicooker', 
      'gratar electric', 'aspirator', 'cantar', 'cuptor', 'microunde', 'sandwich', 
      'vidat', 'aparat', 'incalzitor', 'radiator', 'electrice', 'espressoare'
    ]
  },
  {
    slug: 'copii-jucarii',
    keywords: [
      'copii', 'jucarii', 'jucarie', 'masinute', 'masinuta', 'biciclet', 'bicicleta', 
      'trotineta', 'trotinete', 'tricicleta', 'triciclete', 'premergator', 'carucior copii', 
      'balansoar', 'leagan', 'bebe', 'bebelusi', 'jolly kids', 'micmax', 'splendor', 'motocicleta'
    ]
  },
  {
    slug: 'casa-decoratiuni',
    keywords: [
      'mop', 'galeata', 'cos gunoi', 'cos rufe', 'curatenie', 'birou', 'birouri', 
      'scaun', 'scaune', 'masa', 'masuta', 'cuier', 'taburet', 'dulap', 'brad', 'brazi', 
      'craciun', 'decoratiuni', 'covor', 'baie', 'suport', 'raft', 'organizare', 'depozitare',
      'textile', 'perdea dus'
    ]
  },
  {
    slug: 'sport-outdoor',
    keywords: [
      'umbrela', 'hamac', 'geanta frigorifica', 'camping', 'gratar', 'gratar gradina', 
      'outdoor', 'sport', 'drumetii', 'sticla sport'
    ]
  },
  {
    slug: 'frumusete-ingrijire',
    keywords: [
      'uscator par', 'perie par', 'ondulator', 'placa par', 'masina tuns', 'ingrijire personala'
    ]
  }
];

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 600 * attempt));
    }
  }
}

async function main() {
  console.log('====================================================');
  console.log('   TOPINSTOCK — IMPORT PRODUSE VICTRONIC.RO         ');
  console.log('====================================================');

  // 1. Get TopinStock Admin Vendor
  const adminVendor = await prisma.vendor.findFirst({
    where: { slug: 'topinstock-oficial' }
  });

  if (!adminVendor) {
    throw new Error('Nu a fost găsit vendorul TopinStock Oficial (slug: topinstock-oficial)!');
  }
  console.log(`✓ Vendor Admin identificat: ${adminVendor.storeName} (ID: ${adminVendor.id})`);

  // 2. Load Categories
  const allCategories = await prisma.category.findMany({
    include: { parent: true }
  });
  console.log(`✓ Categorii existente în baza de date: ${allCategories.length}`);

  const catBySlug = new Map(allCategories.map(c => [c.slug.toLowerCase(), c]));
  const defaultCategory = catBySlug.get('bucatarie-menaj') || allCategories[0];

  function resolveCategory(breadcrumbs, title, productSlug) {
    const combined = (breadcrumbs.map(b => b.slug + ' ' + b.name).join(' ') + ' ' + title + ' ' + productSlug).toLowerCase();
    const norm = stripDiacritics(combined);

    // First try to match child category by slug or name
    for (const b of breadcrumbs) {
      const bSlug = b.slug.toLowerCase();
      if (catBySlug.has(bSlug)) {
        return catBySlug.get(bSlug);
      }
      const bNorm = stripDiacritics(b.name);
      for (const cat of allCategories) {
        if (stripDiacritics(cat.name) === bNorm) {
          return cat;
        }
      }
    }

    // Try keyword match in subcategories
    for (const cat of allCategories) {
      if (cat.parentId) {
        const catNorm = stripDiacritics(cat.name);
        if (norm.includes(catNorm)) {
          return cat;
        }
      }
    }

    // Match parent category
    for (const parent of PARENT_CATEGORIES) {
      for (const kw of parent.keywords) {
        if (norm.includes(kw)) {
          if (catBySlug.has(parent.slug)) {
            return catBySlug.get(parent.slug);
          }
        }
      }
    }

    return defaultCategory;
  }

  // 3. Load unique new products to upload (which were already deduplicated!)
  const uniqueNewProducts = JSON.parse(fs.readFileSync('scripts/accurate_unique_new.json', 'utf8'));
  console.log(`✓ Produse unice noi de procesat și urcat: ${uniqueNewProducts.length}`);

  // Cache file to allow resumability
  const cachePath = 'scripts/scraped_products_cache.json';
  let scrapedCache = {};
  if (fs.existsSync(cachePath)) {
    try {
      scrapedCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      console.log(`✓ Produse deja parsate în cache: ${Object.keys(scrapedCache).length}`);
    } catch (e) {}
  }

  // 4. Concurrently fetch and parse details
  const toFetch = uniqueNewProducts.filter(p => !scrapedCache[p.url]);
  console.log(`\nÎncepere descărcare detalii pentru ${toFetch.length} produse noi...`);

  const concurrency = 10;
  let completed = 0;

  for (let i = 0; i < toFetch.length; i += concurrency) {
    const chunk = toFetch.slice(i, i + concurrency);
    await Promise.all(chunk.map(async item => {
      try {
        const html = await fetchWithRetry(item.url);

        // Title
        const ogTitle = (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1];
        const title = ogTitle ? ogTitle.replace(/\s*-\s*Victronic\s*$/i, '').trim() : (item.cardTitle || 'Produs Victronic');

        // Price
        const saleMatch = html.match(/class="[^"]*sale-price[^"]*">\s*([\d.,]+)\s*lei/i);
        const firstPriceMatch = html.match(/([\d.,]+)\s*(?:lei|LEI)/i);
        const price = (saleMatch ? parsePrice(saleMatch[1]) : (firstPriceMatch ? parsePrice(firstPriceMatch[1]) : parsePrice(item.cardPrice))) || 49.99;

        // Base price
        const baseMatch = html.match(/class="[^"]*base-price[^"]*">\s*([\d.,]+)\s*lei/i);
        let basePrice = baseMatch ? parsePrice(baseMatch[1]) : parsePrice(item.cardBasePrice);
        if (!basePrice || basePrice <= price) {
          basePrice = Math.round(price * 1.25 * 100) / 100;
        }

        const discountPercentage = Math.max(0, Math.round(((basePrice - price) / basePrice) * 100));

        // Images
        const ogImage = (html.match(/<meta property="og:image" content="([^"]+)"/i) || [])[1];
        const allImgs = [...html.matchAll(/(https:\/\/www\.victronic\.ro\/img\/[^\s"'<>]+\.jpg)/gi)].map(m => m[1]);
        const largeImgs = [...new Set(allImgs.filter(img => img.includes('-large.jpg')))];
        const cardImgLarge = item.cardImage ? item.cardImage.replace(/-medium\.jpg/i, '-large.jpg') : null;
        let images = largeImgs.length > 0 ? largeImgs : (cardImgLarge ? [cardImgLarge] : (ogImage ? [ogImage] : []));
        if (images.length === 0 && item.cardImage) images = [item.cardImage];

        // Breadcrumbs
        const bcMatches = [...html.matchAll(/<a\s+href="https:\/\/www\.victronic\.ro\/([^"]+)"\s+class="[^"]*breadcrumbs[^"]*item[^"]*">([\s\S]*?)<\/a>/gi)];
        const breadcrumbs = bcMatches.map(m => ({
          slug: m[1],
          name: m[2].replace(/<[^>]+>/g, '').trim()
        })).filter(b => b.slug && b.slug !== '' && b.slug !== '#');

        // Description
        const descMatch = html.match(/<span class="[^"]*ui-rich-text[^"]*"[\s\S]*?<span class="[^"]*field[^"]*">([\s\S]*?)<\/span>\s*<\/span>/i);
        let description = descMatch && descMatch[1].trim().length > 15 ? descMatch[1].trim() : '';
        if (!description) {
          description = `<p><strong>${title}</strong></p><p>Produs original marca <strong>${item.brand || 'Victronic'}</strong>, conceput din materiale rezistente, de înaltă calitate, pentru o utilizare comodă și performanță de lungă durată.</p><p>Include garanție de conformitate de 24 luni și livrare sigură prin TopinStock România.</p>`;
        }

        // Attributes
        const attrRegex = /<span class="[^"]*attribute-name[^"]*">\s*([\s\S]*?)\s*<\/span>[\s\S]*?<span class="[^"]*attribute-value[^"]*">\s*([\s\S]*?)\s*<\/span>/gi;
        const attributes = {};
        let am;
        while ((am = attrRegex.exec(html)) !== null) {
          const k = am[1].replace(/<[^>]+>/g, '').trim();
          const v = am[2].replace(/<[^>]+>/g, '').trim();
          if (k && v) attributes[k] = v;
        }

        scrapedCache[item.url] = {
          url: item.url,
          title,
          price,
          originalPrice: basePrice,
          discountPercentage,
          images,
          breadcrumbs,
          description,
          attributes,
          brand: item.brand || 'Victronic',
          pid: item.pid
        };
      } catch (err) {
        console.error(`Eroare la parsarea ${item.url}: ${err.message}`);
      }
    }));

    completed += chunk.length;
    if (completed % 50 === 0 || completed >= toFetch.length) {
      console.log(`Progres: ${completed}/${toFetch.length} produse descărcate...`);
      fs.writeFileSync(cachePath, JSON.stringify(scrapedCache, null, 2));
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(scrapedCache, null, 2));
  console.log(`✓ Toate produsele au fost descărcate și salvate în cache! Total: ${Object.keys(scrapedCache).length}`);

  // 5. Insert products into SQLite DB
  console.log('\n--- Inserare produse noi în baza de date TopinStock ---');
  let inserted = 0;
  let skipped = 0;

  // Track existing DB slugs to guarantee uniqueness
  const existingProducts = await prisma.product.findMany({ select: { slug: true } });
  const usedSlugs = new Set(existingProducts.map(p => p.slug));

  const itemsToInsert = Object.values(scrapedCache);

  for (let idx = 0; idx < itemsToInsert.length; idx++) {
    const p = itemsToInsert[idx];
    const urlSlug = p.url.split('/').pop().replace(/[^\w-]/g, '');

    // Form a clean, readable and unique slug
    let baseSlug = (urlSlug || slugify(p.title)).substring(0, 80);
    let finalSlug = baseSlug;
    let counter = 1;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(finalSlug);

    // Resolve category
    const cat = resolveCategory(p.breadcrumbs, p.title, finalSlug);

    // SKU
    const sku = `TIS-VIC-${(100000 + idx + Math.floor(Math.random() * 899999))}`;

    // Attributes & colors
    const colors = p.attributes['Culoare'] ? [p.attributes['Culoare']] : ['Diverse'];
    const sizes = ['Standard'];

    // Random rating and reviews for realistic marketplace display
    const rating = Math.round((4.6 + (idx % 5) * 0.08) * 10) / 10;
    const reviewsCount = 3 + (idx % 25);
    const stock = 15 + (idx % 35);

    try {
      await prisma.product.create({
        data: {
          vendorId: adminVendor.id,
          categoryId: cat.id,
          title: p.title,
          slug: finalSlug,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          discountPercentage: p.discountPercentage,
          stock,
          sku,
          images: JSON.stringify(p.images),
          sizes: JSON.stringify(sizes),
          colors: JSON.stringify(colors),
          attributes: JSON.stringify(p.attributes),
          rating,
          reviewsCount,
          isPublished: true,
        }
      });
      inserted++;
      if (inserted % 100 === 0) {
        console.log(`Inserate ${inserted}/${itemsToInsert.length} produse...`);
      }
    } catch (err) {
      console.error(`Eroare la inserarea produsului "${p.title}": ${err.message}`);
      skipped++;
    }
  }

  console.log('\n====================================================');
  console.log(`✓ IMPORT FINALIZAT CU SUCCES!`);
  console.log(`- Produse noi inserate: ${inserted}`);
  console.log(`- Erori/omise: ${skipped}`);
  const finalTotal = await prisma.product.count();
  console.log(`- Total produse în TopinStock: ${finalTotal}`);
  console.log('====================================================');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  prisma.$disconnect();
});
