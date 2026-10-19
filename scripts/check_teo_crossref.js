const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const teoPath = path.join(__dirname, 'teomarket_all_products_raw.json');
  const teoRaw = JSON.parse(fs.readFileSync(teoPath, 'utf8'));

  // Build map of teomarket ID -> raw item
  const teoMap = new Map();
  for (const item of teoRaw) {
    teoMap.set(String(item.id), item);
  }

  // Get all TIS-TEO products from DB
  const dbTeo = await prisma.product.findMany({
    where: { sku: { startsWith: 'TIS-TEO-' } },
    select: { id: true, sku: true, title: true, stock: true, isPublished: true }
  });

  console.log(`Found ${dbTeo.length} TIS-TEO products in database.`);

  let inStockOnTeo = 0;
  let outOfStockOnTeo = 0;
  let notFoundInRaw = 0;

  const outOfStockIds = [];

  for (const p of dbTeo) {
    const rawId = p.sku.replace('TIS-TEO-', '');
    const raw = teoMap.get(rawId);
    if (!raw) {
      notFoundInRaw++;
      continue;
    }

    const qty = raw.stock_quantity !== undefined && raw.stock_quantity !== null
      ? raw.stock_quantity
      : (raw.total_variants_stock || 0);

    if (qty > 0) {
      inStockOnTeo++;
    } else {
      outOfStockOnTeo++;
      outOfStockIds.push({ dbId: p.id, sku: p.sku, title: p.title, currentDbStock: p.stock, teoQty: qty });
    }
  }

  console.log({
    totalInDb: dbTeo.length,
    inStockOnTeo,
    outOfStockOnTeo,
    notFoundInRaw,
    sampleOutOfStockInDb: outOfStockIds.slice(0, 5)
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
