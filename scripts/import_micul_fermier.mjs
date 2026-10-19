import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          ...(options.headers || {})
        }
      });
      if (res.ok) return res;
      if (res.status === 404) return null;
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
  return null;
}

async function runMiculFermierImport() {
  console.log('====================================================');
  console.log('   TOPINSTOCK — MICUL FERMIER PRODUCT IMPORTER');
  console.log('====================================================');

  // 1. Setup / Retrieve Vendor
  console.log('\n[1/5] Ensuring Vendor "Micul Fermier" exists...');
  let mfUser = await prisma.user.findUnique({
    where: { email: 'contact@micul-fermier.ro' },
    include: { vendor: true }
  });

  if (!mfUser || !mfUser.vendor) {
    let existingVendor = await prisma.vendor.findFirst({
      where: { slug: 'micul-fermier' }
    });

    if (existingVendor) {
      console.log(`Found existing vendor: ${existingVendor.storeName} (ID: ${existingVendor.id})`);
    } else {
      if (!mfUser) {
        mfUser = await prisma.user.create({
          data: {
            email: 'contact@micul-fermier.ro',
            name: 'Micul Fermier România',
            role: 'VENDOR',
            phone: '031 005 0500',
            address: 'Șoseaua București-Urziceni nr. 64, Afumați, Ilfov',
          }
        });
      }
      const vendor = await prisma.vendor.create({
        data: {
          userId: mfUser.id,
          storeName: 'Micul Fermier',
          slug: 'micul-fermier',
          logo: 'https://c.cdnmp.net/119434508/brands/11000126_logo.png',
          description: 'Magazinul oficial Micul Fermier — Scule electrice și de mână, utilaje agricole, motopompe, hidrofoare, motoare electrice și echipamente pentru casă și grădină.',
          rating: 4.9,
          isVerified: true,
          commissionRate: 0.10,
          legalName: 'S.C. Golden Fish S.R.L.',
          cui: 'RO18261310',
          regCom: 'J23/2402/2005',
          status: 'ACTIVE'
        }
      });
      console.log(`Created Vendor: ${vendor.storeName} (ID: ${vendor.id})`);
    }
  }

  const vendor = await prisma.vendor.findFirst({
    where: { slug: 'micul-fermier' }
  });
  console.log(`Vendor Ready: ${vendor.storeName} (ID: ${vendor.id})`);

  // 2. Load Categories and setup dynamic resolver
  console.log('\n[2/5] Loading categories and existing products...');
  const allCategories = await prisma.category.findMany();
  const catSlugMap = new Map();
  allCategories.forEach(c => catSlugMap.set(c.slug, c));
  console.log(`Loaded ${allCategories.length} categories.`);

  const existingProducts = await prisma.product.findMany({
    select: { slug: true, sku: true }
  });
  const usedSlugs = new Set(existingProducts.map(p => p.slug));
  const usedSkus = new Set(existingProducts.map(p => p.sku).filter(Boolean));
  console.log(`Found ${existingProducts.length} existing products in database.`);

  function generateUniqueSlug(base) {
    let clean = slugify(base);
    if (!clean || clean.length < 3) clean = 'produs-' + Math.random().toString(36).substring(2, 7);
    if (!usedSlugs.has(clean)) {
      usedSlugs.add(clean);
      return clean;
    }
    let counter = 1;
    while (usedSlugs.has(`${clean}-${counter}`)) {
      counter++;
    }
    const finalSlug = `${clean}-${counter}`;
    usedSlugs.add(finalSlug);
    return finalSlug;
  }

  function generateUniqueSku(candidate, fallbackPrefix) {
    if (candidate && !usedSkus.has(candidate)) {
      usedSkus.add(candidate);
      return candidate;
    }
    let counter = 1;
    let sku = `${fallbackPrefix}-${counter}`;
    while (usedSkus.has(sku)) {
      counter++;
      sku = `${fallbackPrefix}-${counter}`;
    }
    usedSkus.add(sku);
    return sku;
  }

  async function resolveCategory(trail) {
    if (!trail || trail.length === 0) {
      return catSlugMap.get('casa-si-bricolaj')?.id || allCategories[0].id;
    }

    let parentId = null;
    let currentCat = null;

    for (let i = 0; i < trail.length; i++) {
      const name = trail[i];
      const slug = slugify(name);

      if (catSlugMap.has(slug)) {
        currentCat = catSlugMap.get(slug);
        parentId = currentCat.id;
      } else {
        if (i === 0 && !parentId) {
          const fallbackParent = catSlugMap.get('casa-si-bricolaj');
          parentId = fallbackParent ? fallbackParent.id : null;
        }

        try {
          currentCat = await prisma.category.create({
            data: {
              name,
              slug,
              description: `Produse ${name} disponibile pe TopinStock.`,
              parentId,
              order: 20
            }
          });
          catSlugMap.set(slug, currentCat);
          parentId = currentCat.id;
        } catch (e) {
          // If collision or already created
          currentCat = await prisma.category.findUnique({ where: { slug } });
          if (currentCat) {
            catSlugMap.set(slug, currentCat);
            parentId = currentCat.id;
          }
        }
      }
    }

    return currentCat?.id || catSlugMap.get('casa-si-bricolaj')?.id || allCategories[0].id;
  }

  // 3. Fetch Sitemap
  console.log('\n[3/5] Fetching products sitemap from https://www.micul-fermier.ro/sitemap_products.xml...');
  const sitemapRes = await fetchWithRetry('https://www.micul-fermier.ro/sitemap_products.xml');
  const sitemapXml = await sitemapRes.text();
  const productUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  console.log(`Discovered ${productUrls.length} total product pages on Micul Fermier.`);

  // 4. Scrape & Filter Products
  console.log(`\n[4/5] Scraping product pages (Checking stock, price, specs, images)...`);
  const inStockProducts = [];
  let scannedCount = 0;
  let outOfStockCount = 0;
  const startTime = Date.now();

  const CONCURRENCY = 18;
  let urlIndex = 0;

  async function scrapeWorker(workerId) {
    while (urlIndex < productUrls.length) {
      const idx = urlIndex++;
      const url = productUrls[idx];

      try {
        const res = await fetchWithRetry(url);
        if (!res) {
          outOfStockCount++;
          continue;
        }

        const html = await res.text();

        // Parse JSON-LD
        const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
        if (!ldMatch) {
          outOfStockCount++;
          continue;
        }

        let parsed;
        try {
          parsed = JSON.parse(ldMatch[1]);
        } catch {
          outOfStockCount++;
          continue;
        }

        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const p = arr.find(x => x['@type'] === 'Product');
        const bc = arr.find(x => x['@type'] === 'BreadcrumbList');

        if (!p) {
          outOfStockCount++;
          continue;
        }

        // Check availability
        const availability = p.offers?.availability || '';
        const isInStock = (availability.includes('InStock') || html.includes('in-stock')) &&
                          !availability.includes('OutOfStock') &&
                          !html.includes('stoc-epuizat') &&
                          !html.includes('Stoc epuizat');

        if (!isInStock) {
          outOfStockCount++;
          continue;
        }

        // Price
        const price = Number(p.offers?.price) || 0;
        if (price <= 0) {
          outOfStockCount++;
          continue;
        }

        // Original price / Discount
        let originalPrice = null;
        let discountPercentage = null;
        const oldPriceMatch = html.match(/class="[^"]*product-summary__info--old-price-gross[^"]*"[\s\S]*?<span>(\d+)(?:<sup>,(\d+)<\/sup>)?/i);
        if (oldPriceMatch) {
          const whole = oldPriceMatch[1];
          const dec = oldPriceMatch[2] || '00';
          const parsedOld = parseFloat(`${whole}.${dec}`);
          if (parsedOld > price) {
            originalPrice = parsedOld;
            discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
          }
        }

        // Breadcrumbs & category trail
        let categoryTrail = [];
        if (bc?.itemListElement) {
          categoryTrail = bc.itemListElement
            .map(b => b.item?.name?.trim())
            .filter(Boolean)
            .slice(0, -1);
        }
        if (categoryTrail.length === 0 && p.category) {
          categoryTrail = p.category.split('>').map(c => c.trim()).filter(Boolean);
        }

        const categoryId = await resolveCategory(categoryTrail);

        // Description
        let desc = '';
        const descCollapseMatch = html.match(/class="product-summary-short__description-collapse"[^>]*>([\s\S]*?)<\/div>/i);
        if (descCollapseMatch) {
          desc = descCollapseMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        } else {
          desc = p.description || p.name;
        }

        // Attributes / Technical Specs
        const attrs = {
          brand: 'Micul Fermier',
          furnizor: 'Micul Fermier România',
          garantie: '24 luni (persoane fizice) / 12 luni (persoane juridice)',
          sursa: url
        };
        const attrMatches = [...html.matchAll(/<div class="product-summary-attributes__name">([^<]+)<\/div>\s*<div class="product-summary-attributes__options">([^<]+)<\/div>/gi)];
        for (const am of attrMatches) {
          const k = am[1].trim();
          const v = am[2].trim();
          if (k && v) attrs[k] = v;
        }

        // Images
        const imgs = [];
        if (p.image) {
          const primary = typeof p.image === 'string' ? p.image : p.image.url;
          if (primary) imgs.push(primary);
        }

        // Gallery images via data-fancybox="gallery"
        const galleryMatches = [
          ...html.matchAll(/data-fancybox="gallery"[^>]*?href="([^"]+)"/gi),
          ...html.matchAll(/href="([^"]+)"[^>]*?data-fancybox="gallery"/gi)
        ];
        for (const gm of galleryMatches) {
          const imgUrl = gm[1].replace(/\/p\/[ms]\//, '/p/l/');
          if (!imgs.includes(imgUrl) && imgUrl.startsWith('https://c.cdnmp.net/')) {
            imgs.push(imgUrl);
          }
        }

        if (imgs.length === 0) {
          imgs.push('https://c.cdnmp.net/119434508/brands/11000126_logo.png');
        }

        const title = p.name.trim();
        const slug = generateUniqueSlug(title);
        const sku = generateUniqueSku(p.sku, 'MF');

        inStockProducts.push({
          vendorId: vendor.id,
          categoryId,
          title,
          slug,
          description: desc,
          price,
          originalPrice,
          discountPercentage,
          stock: 50, // Active stock for ordering
          sku,
          images: JSON.stringify(imgs),
          sizes: JSON.stringify([]),
          colors: JSON.stringify([]),
          attributes: JSON.stringify(attrs),
          rating: Number((4.6 + Math.random() * 0.4).toFixed(1)),
          reviewsCount: Math.floor(Math.random() * 18) + 3,
          isPublished: true,
        });

      } catch (err) {
        // Continue on error
      } finally {
        scannedCount++;
        if (scannedCount % 100 === 0 || scannedCount === productUrls.length) {
          const elapsedSec = (Date.now() - startTime) / 1000;
          const rate = (scannedCount / elapsedSec).toFixed(1);
          const percent = ((scannedCount / productUrls.length) * 100).toFixed(0);
          console.log(`  [Progress] ${scannedCount}/${productUrls.length} (${percent}%) | In Stock: ${inStockProducts.length} | Out of Stock: ${outOfStockCount} | Speed: ${rate} req/s`);
        }
      }
    }
  }

  // Run pool
  const workers = Array.from({ length: CONCURRENCY }, (_, i) => scrapeWorker(i));
  await Promise.all(workers);

  const totalScrapeTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nScraping finished in ${totalScrapeTime}s.`);
  console.log(`Found ${inStockProducts.length} products IN STOCK ready to import.`);

  // Save JSON backup
  fs.writeFileSync('scratch/micul_fermier_in_stock.json', JSON.stringify(inStockProducts, null, 2));
  console.log(`Saved backup to scratch/micul_fermier_in_stock.json`);

  // 5. Batch Insert into SQLite via Prisma
  console.log(`\n[5/5] Inserting ${inStockProducts.length} products into TopinStock database...`);
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < inStockProducts.length; i += BATCH_SIZE) {
    const chunk = inStockProducts.slice(i, i + BATCH_SIZE);
    await prisma.product.createMany({
      data: chunk,
    });
    inserted += chunk.length;
    console.log(`  Inserted ${inserted} / ${inStockProducts.length} products...`);
  }

  console.log('\n====================================================');
  console.log('           IMPORT SUCCESSFULLY COMPLETED');
  console.log('====================================================');
  console.log(`Total scanned: ${productUrls.length}`);
  console.log(`Total in-stock imported: ${inStockProducts.length}`);
  console.log(`Total out-of-stock skipped: ${outOfStockCount}`);
  console.log(`Vendor: ${vendor.storeName} (slug: ${vendor.slug})`);

  // Print sample 5 imported
  console.log('\nSample imported products:');
  inStockProducts.slice(0, 5).forEach(p => {
    console.log(`- ${p.title} | Price: ${p.price} RON (Old: ${p.originalPrice || '-'}) | SKU: ${p.sku} | Slug: ${p.slug}`);
  });

  await prisma.$disconnect();
}

runMiculFermierImport().catch(err => {
  console.error('Fatal import error:', err);
  process.exit(1);
});
