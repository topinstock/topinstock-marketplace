const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function run() {
  try {
    const nonTeo = await prisma.product.findMany({
      where: {
        NOT: {
          sku: { startsWith: 'TIS-TEO' }
        }
      },
      select: { id: true, sku: true, title: true, slug: true, stock: true }
    });

    console.log(`Total non-Teo: ${nonTeo.length}`);
    const prefixes = {};
    for (const p of nonTeo) {
      const pfx = p.sku ? p.sku.slice(0, 7) : 'NONE';
      prefixes[pfx] = (prefixes[pfx] || 0) + 1;
    }
    console.log('Prefixes:', prefixes);

    // Let's check matching with kitchentools
    const ktRaw = JSON.parse(fs.readFileSync('scratch/kitchentools_all_products.json', 'utf8'));
    const ktTitles = new Set(ktRaw.map(k => k.title.toLowerCase().trim()));
    const ktHandles = new Set(ktRaw.map(k => k.handle.toLowerCase().trim()));

    // Let's check matching with victronic
    const vicRaw = JSON.parse(fs.readFileSync('scripts/victronic_complete_scraped.json', 'utf8'));
    const vicTitles = new Set(vicRaw.map(v => v.title.toLowerCase().trim()));

    // Let's check matching with spincom
    const spinRaw = JSON.parse(fs.readFileSync('scratch/spincom_products.json', 'utf8'));
    const spinTitles = new Set(spinRaw.map(s => s.title.toLowerCase().trim()));

    let ktMatch = 0, vicMatch = 0, spinMatch = 0, unmatch = 0;
    const unmatched = [];

    for (const p of nonTeo) {
      const t = p.title.toLowerCase().trim();
      const s = p.slug.toLowerCase().trim();
      if (ktTitles.has(t) || ktHandles.has(s)) {
        ktMatch++;
      } else if (vicTitles.has(t)) {
        vicMatch++;
      } else if (spinTitles.has(t)) {
        spinMatch++;
      } else {
        unmatch++;
        if (unmatched.length < 10) unmatched.push({ sku: p.sku, title: p.title });
      }
    }

    console.log({
      ktMatch,
      vicMatch,
      spinMatch,
      unmatch,
      sampleUnmatched: unmatched
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
