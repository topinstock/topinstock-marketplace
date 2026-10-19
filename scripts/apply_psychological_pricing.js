const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Psychological Pricing Function
 * Standardizes product prices according to exact rules:
 * 1. Products strictly under 50 RON (price < 50):
 *    - Take integer part (Math.floor(price)) and subtract 0.01.
 *    - Edge case: If already ending in .99 (e.g. 11.99), keep it as 11.99.
 *    - Edge case: 49 is kept as 49.
 * 2. Products 50 RON and above (price >= 50):
 *    - Group into tiers of 5 RON: baseTier = Math.floor(price / 5) * 5.
 *    - Edge case: If already matches target psychological price (e.g. 49, 49.99, 54.99), leave unchanged.
 *    - Sub-rule A: If baseTier is a multiple of 10, subtract 1 -> clean integer ending in 9.
 *    - Sub-rule B: If baseTier ends in 5, subtract 0.01 -> ends in 4.99.
 * 3. Safety Guard:
 *    - Ensure no price drops to 0 or becomes negative (if price <= 1, keep it as 0.99).
 */
function calculatePsychologicalPrice(price) {
  // 3. Safety Guard:
  // Ensure no price drops to 0 or becomes negative (if price <= 1, keep it as 0.99)
  if (price <= 1) {
    return 0.99;
  }

  // Round cents to 2 decimal places to avoid JS floating point inaccuracies
  const roundedPrice = Math.round(price * 100) / 100;
  const cents = Math.round(roundedPrice * 100) % 100;
  const intPart = Math.floor(roundedPrice);
  const isEnding99 = (cents === 99);

  // 1. Products strictly under 50 RON (price < 50):
  if (roundedPrice < 50) {
    // Edge case: If a price is already ending in .99 (e.g., 11.99), keep it as 11.99 (do not turn it into 10.99)
    if (isEnding99) {
      return roundedPrice;
    }

    // Edge case: target psychological price 49 (from Rule 2: e.g. 49, 49.99, 54.99)
    if (roundedPrice === 49) {
      return 49;
    }

    // Take the integer part of the price (Math.floor(price)) and subtract 0.01
    const newPrice = Math.round((intPart - 0.01) * 100) / 100;
    if (newPrice <= 1) {
      return 0.99;
    }
    return newPrice;
  }

  // 2. Products 50 RON and above (price >= 50):
  // Edge case: If the price already matches a target psychological price (e.g., 49, 49.99, 54.99), leave it unchanged.
  // Target psychological prices:
  // - Clean integer ending in 9 (49, 59, 69, 79, 89, 99, 109, ...)
  // - Ending in 4.99 (54.99, 64.99, 74.99, 84.99, 94.99, ...)
  // - Ending in 9.99 (49.99, 59.99, 69.99, 79.99, 89.99, ...)
  const isIntegerEndingIn9 = (cents === 0 && intPart % 10 === 9);
  const isEnding4_99 = (isEnding99 && intPart % 10 === 4);
  const isEnding9_99 = (isEnding99 && intPart % 10 === 9);

  if (isIntegerEndingIn9 || isEnding4_99 || isEnding9_99) {
    return roundedPrice;
  }

  // Group prices into tiers of 5 RON by rounding down to the nearest multiple of 5:
  const baseTier = Math.floor(roundedPrice / 5) * 5;

  // Sub-rule A (Multiples of 10): If baseTier is a multiple of 10 (e.g., 50, 60, 70, 100), subtract 1 -> clean integer ending in 9
  if (baseTier % 10 === 0) {
    return baseTier - 1;
  }

  // Sub-rule B (Multiples of 5, ending in 5): If baseTier ends in 5 (e.g., 55, 65, 75, 105), subtract 0.01 -> ends in 4.99
  return Math.round((baseTier - 0.01) * 100) / 100;
}

// ── Validation Suite ──
function runPreflightTests() {
  const tests = [
    { in: 0.00, out: 0.99 },
    { in: 0.50, out: 0.99 },
    { in: 1.00, out: 0.99 },
    { in: 2.00, out: 1.99 },
    { in: 11.99, out: 11.99 },
    { in: 12.00, out: 11.99 },
    { in: 12.50, out: 11.99 },
    { in: 12.80, out: 11.99 },
    { in: 48.99, out: 48.99 },
    { in: 49.00, out: 49.00 },
    { in: 49.50, out: 48.99 },
    { in: 49.99, out: 49.99 },
    { in: 50.00, out: 49.00 },
    { in: 52.00, out: 49.00 },
    { in: 53.00, out: 49.00 },
    { in: 54.80, out: 49.00 },
    { in: 54.99, out: 54.99 },
    { in: 55.00, out: 54.99 },
    { in: 55.50, out: 54.99 },
    { in: 58.90, out: 54.99 },
    { in: 59.00, out: 59.00 },
    { in: 59.99, out: 59.99 },
    { in: 61.00, out: 59.00 },
    { in: 64.50, out: 59.00 },
    { in: 64.99, out: 64.99 },
    { in: 65.20, out: 64.99 },
    { in: 68.00, out: 64.99 },
    { in: 69.00, out: 69.00 },
    { in: 69.99, out: 69.99 },
    { in: 74.99, out: 74.99 },
    { in: 100.00, out: 99.00 },
    { in: 105.00, out: 104.99 },
  ];

  for (const t of tests) {
    const res = calculatePsychologicalPrice(t.in);
    if (res !== t.out) {
      throw new Error(`Preflight test failed for ${t.in}: expected ${t.out}, got ${res}`);
    }
  }
  console.log(`✓ All ${tests.length} preflight unit tests passed successfully.`);
}

async function main() {
  console.log('===========================================================');
  console.log('   TOPINSTOCK — Psychological Pricing Standardization     ');
  console.log('===========================================================\n');
  
  const startTime = Date.now();
  runPreflightTests();

  // 1. Load all products from DB
  console.log('\n1. Fetching all products from SQLite database...');
  const products = await prisma.product.findMany({
    select: { id: true, price: true, title: true }
  });
  console.log(`   Total products found in DB: ${products.length}`);

  // 2. Compute transformations
  const toUpdate = [];
  let unchangedCount = 0;
  for (const p of products) {
    const newPrice = calculatePsychologicalPrice(p.price);
    if (newPrice !== p.price) {
      toUpdate.push({ id: p.id, newPrice, oldPrice: p.price });
    } else {
      unchangedCount++;
    }
  }

  console.log(`   Products needing price update: ${toUpdate.length}`);
  console.log(`   Products already matching psychological pricing: ${unchangedCount}`);

  if (toUpdate.length === 0) {
    console.log('   All products already formatted!');
  } else {
    // 3. Create temporary SQLite staging table for bulk update
    console.log('\n2. Creating temporary staging table in SQLite...');
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS temp_psychological_prices;`);
    await prisma.$executeRawUnsafe(`
      CREATE TEMP TABLE temp_psychological_prices (
        id TEXT PRIMARY KEY,
        new_price REAL NOT NULL
      );
    `);

    // 4. Batch insert into temp table
    console.log('\n3. Staging price updates into temp table...');
    const BATCH_SIZE = 400; // Well within SQLite variable limits
    for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
      const chunk = toUpdate.slice(i, i + BATCH_SIZE);
      const rows = chunk.map(item => `('${item.id}', ${item.newPrice})`).join(', ');
      await prisma.$executeRawUnsafe(`
        INSERT INTO temp_psychological_prices (id, new_price) VALUES ${rows};
      `);
      if ((i + BATCH_SIZE) % 4000 === 0 || i + BATCH_SIZE >= toUpdate.length) {
        console.log(`   Staged ${Math.min(i + BATCH_SIZE, toUpdate.length)} / ${toUpdate.length} products...`);
      }
    }

    // 5. Execute atomic UPDATE
    console.log('\n4. Executing atomic SQL UPDATE on products table...');
    const updatedCount = await prisma.$executeRawUnsafe(`
      UPDATE products
      SET price = (
        SELECT new_price FROM temp_psychological_prices
        WHERE temp_psychological_prices.id = products.id
      )
      WHERE id IN (SELECT id FROM temp_psychological_prices);
    `);
    console.log(`   ✓ Successfully updated ${updatedCount} products in database!`);

    // Drop temp table
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS temp_psychological_prices;`);
  }

  // 6. Comprehensive Post-Update Verification
  console.log('\n5. Verifying database state after update...');
  const allUpdated = await prisma.product.findMany({
    select: { id: true, price: true }
  });

  let countInvalid = 0;
  let countEndingIn9Integer = 0;
  let countEndingIn99 = 0;
  let countOther = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const p of allUpdated) {
    const pr = p.price;
    if (pr <= 0) countInvalid++;
    if (pr < minPrice) minPrice = pr;
    if (pr > maxPrice) maxPrice = pr;

    const rounded = Math.round(pr * 100) / 100;
    const cents = Math.round(rounded * 100) % 100;
    const intPart = Math.floor(rounded);

    if (cents === 0 && intPart % 10 === 9) {
      countEndingIn9Integer++;
    } else if (cents === 99) {
      countEndingIn99++;
    } else {
      countOther++;
      console.warn(`   ⚠️ Unexpected price format: ${pr} for ID ${p.id}`);
    }
  }

  console.log(`   ✓ Total products verified: ${allUpdated.length}`);
  console.log(`   ✓ Clean integers ending in 9 (e.g. 49, 59, 139): ${countEndingIn9Integer}`);
  console.log(`   ✓ Prices ending in .99 (e.g. 0.99, 11.99, 54.99): ${countEndingIn99}`);
  console.log(`   ✓ Total strictly adhering to psychological pricing: ${countEndingIn9Integer + countEndingIn99} / ${allUpdated.length} (${((countEndingIn9Integer + countEndingIn99) / allUpdated.length * 100).toFixed(2)}%)`);
  console.log(`   ✓ Prices <= 0: ${countInvalid} (strictly 0 expected)`);
  console.log(`   ✓ Minimum price in DB: ${minPrice} LEI`);
  console.log(`   ✓ Maximum price in DB: ${maxPrice} LEI`);

  if (countInvalid > 0 || countOther > 0) {
    throw new Error('Database verification failed! Some prices do not match rules.');
  }

  // 7. Update lib/data/products.ts if it exists
  const mockPath = path.join(__dirname, '..', 'lib', 'data', 'products.ts');
  if (fs.existsSync(mockPath)) {
    console.log('\n6. Standardizing mock products in lib/data/products.ts...');
    let mockContent = fs.readFileSync(mockPath, 'utf8');
    
    // Find each "price": <number> and update it
    const updatedMockContent = mockContent.replace(/"price":\s*([0-9.]+)/g, (match, priceStr) => {
      const oldPrice = parseFloat(priceStr);
      const newPrice = calculatePsychologicalPrice(oldPrice);
      return `"price": ${newPrice}`;
    });
    fs.writeFileSync(mockPath, updatedMockContent, 'utf8');
    console.log('   ✓ lib/data/products.ts prices standardized.');
  }

  // 8. Update prisma/seed.ts demo products
  const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
  if (fs.existsSync(seedPath)) {
    console.log('\n7. Standardizing seed demo products in prisma/seed.ts...');
    let seedContent = fs.readFileSync(seedPath, 'utf8');
    const updatedSeedContent = seedContent.replace(/price:\s*([0-9.]+)/g, (match, priceStr) => {
      const oldPrice = parseFloat(priceStr);
      const newPrice = calculatePsychologicalPrice(oldPrice);
      return `price: ${newPrice}`;
    });
    fs.writeFileSync(seedPath, updatedSeedContent, 'utf8');
    console.log('   ✓ prisma/seed.ts prices standardized.');
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n===========================================================`);
  console.log(`✓ COMPLETE: Standardized all product prices in ${durationSec}s!`);
  console.log(`===========================================================`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal error during pricing standardization:', err);
  prisma.$disconnect();
  process.exit(1);
});
