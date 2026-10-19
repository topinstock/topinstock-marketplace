const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Psychological Pricing Function
 */
function calculatePsychologicalPrice(price) {
  if (price <= 1) {
    return 0.99;
  }

  const roundedPrice = Math.round(price * 100) / 100;
  const cents = Math.round(roundedPrice * 100) % 100;
  const intPart = Math.floor(roundedPrice);
  const isEnding99 = (cents === 99);

  if (roundedPrice < 50) {
    if (isEnding99) return roundedPrice;
    if (roundedPrice === 49) return 49;

    const newPrice = Math.round((intPart - 0.01) * 100) / 100;
    if (newPrice <= 1) return 0.99;
    return newPrice;
  }

  const isIntegerEndingIn9 = (cents === 0 && intPart % 10 === 9);
  const isEnding4_99 = (isEnding99 && intPart % 10 === 4);
  const isEnding9_99 = (isEnding99 && intPart % 10 === 9);

  if (isIntegerEndingIn9 || isEnding4_99 || isEnding9_99) {
    return roundedPrice;
  }

  const baseTier = Math.floor(roundedPrice / 5) * 5;

  if (baseTier % 10 === 0) {
    return baseTier - 1;
  }

  return Math.round((baseTier - 0.01) * 100) / 100;
}

async function main() {
  console.log('===========================================================');
  console.log('   APPLY 60% MARKUP (+ PSYCHOLOGICAL PRICING) - TRENDYOL  ');
  console.log('===========================================================\n');

  const startTime = Date.now();

  // 1. Identify all Trendyol products
  // They either have images hosted on dsmcdn (Trendyol CDN) or match the SKUs from all_trendyol_products.json
  const trendyolJsonPath = 'C:\\Users\\Raducanu Igor Daniel\\.gemini\\antigravity-ide\\brain\\94f7b8de-546a-4a47-b765-0618eeea7d19\\scratch\\all_trendyol_products.json';
  let trendyolItemNumbers = new Set();
  if (fs.existsSync(trendyolJsonPath)) {
    const rawData = JSON.parse(fs.readFileSync(trendyolJsonPath, 'utf8')).products || [];
    for (const p of rawData) {
      if (p.itemNumber) trendyolItemNumbers.add(`TIS-${p.itemNumber}`);
      if (p.id) trendyolItemNumbers.add(`TIS-${p.id}`);
    }
    console.log(`Loaded ${trendyolItemNumbers.size} Trendyol SKUs from source JSON.`);
  }

  const allProducts = await prisma.product.findMany({
    select: { id: true, sku: true, title: true, images: true, price: true }
  });

  const trendyolProducts = allProducts.filter(p => {
    const hasDsmcdn = p.images && p.images.includes('dsmcdn');
    const hasSku = p.sku && (trendyolItemNumbers.has(p.sku) || /^TIS-\d+$/.test(p.sku));
    return hasDsmcdn || hasSku;
  });

  console.log(`Identified ${trendyolProducts.length} Trendyol products in database.`);

  if (trendyolProducts.length === 0) {
    console.log('No Trendyol products found.');
    await prisma.$disconnect();
    return;
  }

  // 2. Prepare calculations
  const updates = [];
  for (const p of trendyolProducts) {
    const oldPrice = p.price;
    const priceWithMarkup = Math.round(oldPrice * 1.60 * 100) / 100;
    const finalPrice = calculatePsychologicalPrice(priceWithMarkup);
    updates.push({
      id: p.id,
      title: p.title,
      oldPrice,
      priceWithMarkup,
      finalPrice
    });
  }

  console.log('\n--- Sample 15 Price Calculations (Old -> +60% Markup -> Final Psychological) ---');
  for (const u of updates.slice(0, 15)) {
    console.log(`${u.oldPrice.toFixed(2)} LEI -> (x1.6 = ${u.priceWithMarkup.toFixed(2)}) -> ${u.finalPrice.toFixed(2)} LEI | ${u.title.slice(0, 45)}...`);
  }

  // 3. Staging and atomic update in SQLite
  console.log('\nStaging updates into temp SQLite table...');
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS temp_trendyol_markup;`);
  await prisma.$executeRawUnsafe(`
    CREATE TEMP TABLE temp_trendyol_markup (
      id TEXT PRIMARY KEY,
      new_price REAL NOT NULL
    );
  `);

  const BATCH_SIZE = 200;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const chunk = updates.slice(i, i + BATCH_SIZE);
    const rows = chunk.map(u => `('${u.id}', ${u.finalPrice})`).join(', ');
    await prisma.$executeRawUnsafe(`
      INSERT INTO temp_trendyol_markup (id, new_price) VALUES ${rows};
    `);
  }

  console.log('Executing atomic SQL update on products...');
  const updatedCount = await prisma.$executeRawUnsafe(`
    UPDATE products
    SET price = (
      SELECT new_price FROM temp_trendyol_markup
      WHERE temp_trendyol_markup.id = products.id
    )
    WHERE id IN (SELECT id FROM temp_trendyol_markup);
  `);

  console.log(`✓ Updated ${updatedCount} Trendyol products in DB.`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS temp_trendyol_markup;`);

  // 4. Update lib/data/products.ts for mock/recommended products
  const mockPath = path.join(__dirname, '..', 'lib', 'data', 'products.ts');
  if (fs.existsSync(mockPath)) {
    console.log('\nUpdating lib/data/products.ts...');
    const trendyolIdMap = new Map(updates.map(u => [u.id, u.finalPrice]));
    let content = fs.readFileSync(mockPath, 'utf8');

    // Parse RECOMMENDED_PRODUCTS and FLASH_PRODUCTS
    const recMatch = content.match(/export const RECOMMENDED_PRODUCTS: MockProduct\[\] = (\[[\s\S]*?\]);/);
    const flashMatch = content.match(/export const FLASH_PRODUCTS: MockProduct\[\] = (\[[\s\S]*?\]);/);

    if (recMatch && flashMatch) {
      const rec = JSON.parse(recMatch[1]);
      const flash = JSON.parse(flashMatch[1]);

      let recUpdated = 0;
      for (const p of rec) {
        if (trendyolIdMap.has(p.id)) {
          p.price = trendyolIdMap.get(p.id);
          recUpdated++;
        }
      }

      let flashUpdated = 0;
      for (const p of flash) {
        if (trendyolIdMap.has(p.id)) {
          p.price = trendyolIdMap.get(p.id);
          flashUpdated++;
        }
      }

      const newContent = content
        .replace(recMatch[0], `export const RECOMMENDED_PRODUCTS: MockProduct[] = ${JSON.stringify(rec, null, 2)};`)
        .replace(flashMatch[0], `export const FLASH_PRODUCTS: MockProduct[] = ${JSON.stringify(flash, null, 2)};`);

      fs.writeFileSync(mockPath, newContent, 'utf8');
      console.log(`   ✓ lib/data/products.ts updated: ${recUpdated} recommended, ${flashUpdated} flash products.`);
    }
  }

  // 5. Verification
  console.log('\nVerifying database consistency...');
  const verifiedTrendyol = await prisma.product.findMany({
    where: { id: { in: updates.map(u => u.id) } },
    select: { id: true, price: true, title: true }
  });

  let validCount = 0;
  for (const p of verifiedTrendyol) {
    const pr = p.price;
    const rounded = Math.round(pr * 100) / 100;
    const cents = Math.round(rounded * 100) % 100;
    const intPart = Math.floor(rounded);
    const isPsychological = (cents === 0 && intPart % 10 === 9) || (cents === 99);
    if (isPsychological && pr > 0) {
      validCount++;
    } else {
      console.warn(`Unexpected price: ${pr} for product ${p.title}`);
    }
  }

  console.log(`✓ All ${verifiedTrendyol.length} Trendyol products verified: ${validCount} / ${verifiedTrendyol.length} strictly match psychological pricing.`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n===========================================================`);
  console.log(`✓ COMPLETE in ${elapsed}s!`);
  console.log(`===========================================================`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error applying Trendyol markup:', err);
  prisma.$disconnect();
  process.exit(1);
});
