const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // Load raw files to get IDs or URLs
  const victronicPath = path.join(__dirname, '..', 'scripts', 'victronic_complete_scraped.json');
  const spincomPath = path.join(__dirname, '..', 'scratch', 'spincom_products.json');
  const ktPath = path.join(__dirname, '..', 'scratch', 'kitchentools_all_products.json');

  const rawKt = JSON.parse(fs.readFileSync(ktPath, 'utf8'));
  const ktTitles = new Set(rawKt.map(p => p.title.toLowerCase().trim()));
  const ktHandles = new Set(rawKt.map(p => p.handle ? p.handle.toLowerCase().trim() : ''));

  // Get all products that are NOT TIS-TEO
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
      createdAt: true
    }
  });

  const ktItems = [];
  const otherItems = [];

  for (const p of nonTeo) {
    if (ktHandles.has(p.slug.toLowerCase().trim()) || ktTitles.has(p.title.toLowerCase().trim())) {
      ktItems.push(p);
    } else {
      otherItems.push(p);
    }
  }

  console.log(`Total non-Teo: ${nonTeo.length}`);
  console.log(`Matched to KitchenTools: ${ktItems.length}`);
  console.log(`Remaining other items: ${otherItems.length}`);

  // Sample and group other items
  const prefixGroup = {};
  for (const p of otherItems) {
    const pfx = (p.sku || 'NO_SKU').split('-')[0];
    prefixGroup[pfx] = (prefixGroup[pfx] || 0) + 1;
  }
  console.log('Other items prefix distribution:', prefixGroup);
  console.log('Sample other items:', otherItems.slice(0, 10).map(p => ({ sku: p.sku, title: p.title, stock: p.stock })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
