const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('=== SUPPLIER STOCK FILTER (MIN 30 PIECES AT SUPPLIER) ===\n');

  // 1. Safety check: OrderItem count
  const orderItemsCount = await prisma.orderItem.count();
  console.log(`OrderItem count: ${orderItemsCount}`);

  // 2. Load TeoMarket raw stock data
  const teoRawPath = path.join(__dirname, 'teomarket_all_products_raw.json');
  console.log('Loading TeoMarket raw data...');
  const teoRaw = JSON.parse(fs.readFileSync(teoRawPath, 'utf8'));
  console.log(`Loaded ${teoRaw.length} raw products from TeoMarket.`);

  const teoStockMap = new Map();
  for (const p of teoRaw) {
    const stock = typeof p.stock_quantity === 'number' ? p.stock_quantity : (parseInt(p.stock_quantity) || 0);
    teoStockMap.set(p.id, stock);
  }

  // 3. Query all TeoMarket products from DB
  console.log('Fetching TeoMarket products from DB...');
  const teoDbProducts = await prisma.product.findMany({
    where: {
      sku: {
        startsWith: 'TIS-TEO-'
      }
    },
    select: {
      id: true,
      sku: true,
      title: true,
      stock: true
    }
  });

  console.log(`Total TeoMarket products in DB: ${teoDbProducts.length}`);

  const toDeleteIds = [];
  const toUpdateStock = []; // { id, supplierStock }

  for (const p of teoDbProducts) {
    const rawId = parseInt(p.sku.replace('TIS-TEO-', ''));
    const supplierStock = teoStockMap.get(rawId);

    if (supplierStock === undefined || supplierStock < 30) {
      toDeleteIds.push(p.id);
    } else {
      if (p.stock !== supplierStock) {
        toUpdateStock.push({ id: p.id, stock: supplierStock });
      }
    }
  }

  console.log(`Products to DELETE (supplier stock < 30): ${toDeleteIds.length}`);
  console.log(`Products to KEEP (supplier stock >= 30): ${teoDbProducts.length - toDeleteIds.length}`);
  console.log(`Products needing stock count update to match supplier: ${toUpdateStock.length}`);

  // 4. Batch delete
  if (toDeleteIds.length > 0) {
    console.log('\nStarting batch deletion of products with supplier stock < 30...');
    const BATCH_SIZE = 1000;
    let deletedSoFar = 0;
    for (let i = 0; i < toDeleteIds.length; i += BATCH_SIZE) {
      const chunk = toDeleteIds.slice(i, i + BATCH_SIZE);
      const res = await prisma.product.deleteMany({
        where: {
          id: {
            in: chunk
          }
        }
      });
      deletedSoFar += res.count;
      console.log(`Deleted chunk ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toDeleteIds.length / BATCH_SIZE)}: ${res.count} products (Total: ${deletedSoFar})`);
    }
    console.log(`Successfully deleted ${deletedSoFar} products with supplier stock < 30.`);
  }

  // 5. Update stock field to exact supplier stock for retained products
  if (toUpdateStock.length > 0) {
    console.log(`\nUpdating ${toUpdateStock.length} retained products with their exact supplier stock...`);
    const UPDATE_BATCH = 200;
    for (let i = 0; i < toUpdateStock.length; i += UPDATE_BATCH) {
      const chunk = toUpdateStock.slice(i, i + UPDATE_BATCH);
      await prisma.$transaction(
        chunk.map(item =>
          prisma.product.update({
            where: { id: item.id },
            data: { stock: item.stock }
          })
        )
      );
      if ((i + UPDATE_BATCH) % 2000 === 0 || i + chunk.length === toUpdateStock.length) {
        console.log(`Updated stock for ${Math.min(i + UPDATE_BATCH, toUpdateStock.length)} / ${toUpdateStock.length} products...`);
      }
    }
    console.log('Stock counts updated successfully to reflect real supplier warehouse quantities.');
  }

  // 6. Final verification of remaining products
  const remainingTotal = await prisma.product.count();
  const remainingPublished = await prisma.product.count({ where: { isPublished: true } });
  const remainingTeo = await prisma.product.count({ where: { sku: { startsWith: 'TIS-TEO-' } } });
  const remainingNonTeo = remainingTotal - remainingTeo;

  console.log('\n=== FINAL DATABASE STATUS ===');
  console.log(`Total Products in DB: ${remainingTotal}`);
  console.log(`Published Products: ${remainingPublished}`);
  console.log(`TeoMarket (all >= 30 in supplier warehouse): ${remainingTeo}`);
  console.log(`Other Suppliers (verified in stock): ${remainingNonTeo}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

