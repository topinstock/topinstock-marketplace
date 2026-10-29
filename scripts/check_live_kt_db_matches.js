const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function run() {
  try {
    const ktFresh = JSON.parse(fs.readFileSync('scratch/kitchentools_live_fresh.json', 'utf8'));
    
    const ktByHandle = new Map();
    const ktByTitle = new Map();
    for (const p of ktFresh) {
      const isAvailable = p.variants?.some(v => v.available === true);
      const data = {
        id: p.id,
        handle: p.handle.toLowerCase().trim(),
        title: p.title.toLowerCase().trim(),
        isAvailable
      };
      ktByHandle.set(data.handle, data);
      ktByTitle.set(data.title, data);
    }

    const nonTeo = await prisma.product.findMany({
      where: {
        NOT: {
          sku: { startsWith: 'TIS-TEO' }
        }
      },
      select: { id: true, sku: true, title: true, slug: true, isPublished: true }
    });

    let ktMatched = 0;
    let ktInStock = 0;
    let ktOutOfStock = 0;
    const toRemove = [];

    for (const p of nonTeo) {
      const slugKey = p.slug.toLowerCase().trim();
      const titleKey = p.title.toLowerCase().trim();
      const match = ktByHandle.get(slugKey) || ktByTitle.get(titleKey);
      if (match) {
        ktMatched++;
        if (match.isAvailable) {
          ktInStock++;
        } else {
          ktOutOfStock++;
          toRemove.push({ id: p.id, sku: p.sku, title: p.title, slug: p.slug });
        }
      }
    }

    console.log({
      totalNonTeoInDb: nonTeo.length,
      ktMatchedInDb: ktMatched,
      ktInStockInDb: ktInStock,
      ktOutOfStockInDb: ktOutOfStock,
      sampleToRemove: toRemove.slice(0, 10)
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
