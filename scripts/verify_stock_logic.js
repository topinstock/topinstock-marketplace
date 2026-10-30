const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function run() {
  try {
    const sampleTeo = await prisma.product.findFirst({
      where: { sku: { startsWith: 'TIS-TEO' } }
    });
    console.log('Sample TeoMarket product in DB:', {
      id: sampleTeo?.id,
      sku: sampleTeo?.sku,
      title: sampleTeo?.title,
      stock: sampleTeo?.stock
    });

    console.log('Reading teomarket raw to check matching...');
    const teoRaw = JSON.parse(fs.readFileSync('scripts/teomarket_all_products_raw.json', 'utf8'));
    console.log(`Loaded ${teoRaw.length} raw TeoMarket items.`);

    // Map teoRaw by ID
    const teoStockById = new Map();
    for (const p of teoRaw) {
      const stock = typeof p.stock_quantity === 'number' ? p.stock_quantity : (parseInt(p.stock_quantity) || 0);
      teoStockById.set(p.id, stock);
    }

    // Check sample match
    const sampleRawId = parseInt(sampleTeo.sku.replace('TIS-TEO-', ''));
    console.log(`Sample DB product raw ID: ${sampleRawId}, raw stock: ${teoStockById.get(sampleRawId)}`);

    // Now let's count for all TeoMarket products in DB:
    // How many have raw stock >= 30, how many < 30, how many not found or 0
    const dbTeoProducts = await prisma.product.findMany({
      where: { sku: { startsWith: 'TIS-TEO' } },
      select: { id: true, sku: true }
    });
    console.log(`Total TeoMarket products in DB: ${dbTeoProducts.length}`);

    let countGte30 = 0;
    let countLt30 = 0;
    let countZeroOrNotFound = 0;

    for (const p of dbTeoProducts) {
      const rawId = parseInt(p.sku.replace('TIS-TEO-', ''));
      const rawStock = teoStockById.get(rawId);
      if (rawStock !== undefined) {
        if (rawStock >= 30) {
          countGte30++;
        } else if (rawStock > 0) {
          countLt30++;
        } else {
          countZeroOrNotFound++;
        }
      } else {
        countZeroOrNotFound++;
      }
    }

    console.log({
      countGte30,
      countLt30,
      countZeroOrNotFound
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();

