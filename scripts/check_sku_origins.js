const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const skus = await prisma.product.findMany({
    select: { id: true, sku: true, title: true, stock: true }
  });

  const skuPrefixes = {};
  let totalWithStockGtZero = 0;

  for (const p of skus) {
    const prefix = p.sku ? p.sku.split('-').slice(0, 2).join('-') : 'NO_SKU';
    skuPrefixes[prefix] = (skuPrefixes[prefix] || 0) + 1;
    if (p.stock > 0) totalWithStockGtZero++;
  }

  console.log('SKU Prefixes count:', skuPrefixes);
  console.log('Total products:', skus.length);
  console.log('Stock > 0:', totalWithStockGtZero);

  // Check some samples of each prefix
  for (const prefix of Object.keys(skuPrefixes)) {
    const sample = skus.find(p => p.sku && p.sku.startsWith(prefix));
    console.log(`Sample for ${prefix}:`, sample?.sku, sample?.title?.slice(0, 60));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
