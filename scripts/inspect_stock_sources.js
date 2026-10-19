const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  console.log('=== PRODUCT BREAKDOWN BY VENDOR ===');
  const vendors = await prisma.vendor.findMany();
  for (const v of vendors) {
    const count = await prisma.product.count({ where: { vendorId: v.id } });
    const inStock = await prisma.product.count({ where: { vendorId: v.id, stock: { gt: 0 } } });
    console.log(`Vendor: ${v.storeName} (${v.slug}): ${count} total, ${inStock} in stock`);
  }

  // Sample attributes to see where they came from
  const sample = await prisma.product.findMany({
    take: 5,
    select: { id: true, title: true, sku: true, stock: true, attributes: true, vendor: { select: { storeName: true } } }
  });
  console.log('\n=== SAMPLE PRODUCTS ===');
  console.log(JSON.stringify(sample, null, 2));

  // Check teomarket raw dataset
  const teoPath = path.join(__dirname, 'teomarket_all_products_raw.json');
  if (fs.existsSync(teoPath)) {
    console.log('\n=== CHECKING TEOMARKET RAW DATASET ===');
    const teoRaw = JSON.parse(fs.readFileSync(teoPath, 'utf8'));
    console.log('TeoMarket Raw Products Count:', teoRaw.length);
    if (teoRaw.length > 0) {
      console.log('Sample TeoMarket Raw Keys:', Object.keys(teoRaw[0]));
      // Check stock fields in raw teomarket
      let hasStockField = 0;
      let zeroStock = 0;
      let positiveStock = 0;
      let nullStock = 0;
      let outOfStockStatus = 0;

      for (const p of teoRaw) {
        if (p.stock !== undefined || p.stock_quantity !== undefined || p.in_stock !== undefined || p.availability !== undefined) {
          hasStockField++;
        }
        if (p.stock_quantity === 0 || p.stock === 0) zeroStock++;
        if (p.stock_quantity > 0 || p.stock > 0) positiveStock++;
        if (p.stock_quantity === null && p.stock === null) nullStock++;
        if (p.in_stock === false || p.status === 'out_of_stock' || p.is_in_stock === false) outOfStockStatus++;
      }
      console.log({
        hasStockField,
        zeroStock,
        positiveStock,
        nullStock,
        outOfStockStatus,
        sampleItem: {
          id: teoRaw[0].id,
          name: teoRaw[0].name || teoRaw[0].title,
          stock: teoRaw[0].stock,
          stock_quantity: teoRaw[0].stock_quantity,
          in_stock: teoRaw[0].in_stock,
          status: teoRaw[0].status,
          price: teoRaw[0].price || teoRaw[0].price_ron
        }
      });
    }
  }

  // Check victronic raw dataset
  const vicPath = path.join(__dirname, 'victronic_complete_scraped.json');
  if (fs.existsSync(vicPath)) {
    console.log('\n=== CHECKING VICTRONIC RAW DATASET ===');
    const vicRaw = JSON.parse(fs.readFileSync(vicPath, 'utf8'));
    console.log('Victronic Raw Products Count:', vicRaw.length);
    if (vicRaw.length > 0) {
      console.log('Sample Victronic Raw Keys:', Object.keys(vicRaw[0]));
      console.log('Sample Victronic Item:', JSON.stringify(vicRaw[0], null, 2));
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
