const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const ktPath = path.join(__dirname, '..', 'scratch', 'kitchentools_all_products.json');
  if (!fs.existsSync(ktPath)) {
    console.log('KitchenTools raw file not found at', ktPath);
    return;
  }

  const rawKt = JSON.parse(fs.readFileSync(ktPath, 'utf8'));
  console.log(`KitchenTools raw products count: ${rawKt.length}`);

  // Let's inspect how kitchentools products were inserted into the DB (what SKU prefix, or titles/slugs)
  // Let's check products where SKU does NOT start with TIS-TEO
  const nonTeo = await prisma.product.findMany({
    where: {
      sku: {
        not: {
          startsWith: 'TIS-TEO'
        }
      }
    },
    select: {
      id: true,
      sku: true,
      title: true,
      slug: true,
      stock: true,
      isPublished: true,
      price: true
    }
  });

  console.log(`Non-TeoMarket products in DB: ${nonTeo.length}`);

  // Group by prefix
  const prefixes = {};
  for (const p of nonTeo) {
    const prefix = p.sku ? p.sku.split('-')[0] : 'NO_SKU';
    prefixes[prefix] = (prefixes[prefix] || 0) + 1;
  }
  console.log('Prefixes breakdown:', prefixes);

  // Map rawKt by handle or title or id
  const ktByHandle = new Map();
  const ktByTitle = new Map();
  for (const item of rawKt) {
    if (item.handle) ktByHandle.set(item.handle.toLowerCase().trim(), item);
    if (item.title) ktByTitle.set(item.title.toLowerCase().trim(), item);
  }

  let ktMatched = 0;
  let ktInStock = 0;
  let ktOutOfStock = 0;
  const ktOutList = [];

  for (const p of nonTeo) {
    // Check if matched in kt
    let match = ktByHandle.get(p.slug.toLowerCase().trim()) || ktByTitle.get(p.title.toLowerCase().trim());
    if (match) {
      ktMatched++;
      // check available
      const isAvailable = match.available === true || match.variants?.some(v => v.available);
      if (isAvailable) {
        ktInStock++;
      } else {
        ktOutOfStock++;
        ktOutList.push({ dbId: p.id, sku: p.sku, title: p.title, dbStock: p.stock });
      }
    }
  }

  console.log({
    ktMatched,
    ktInStock,
    ktOutOfStock,
    sampleOutOfStock: ktOutList.slice(0, 5)
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
