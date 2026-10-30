const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function checkTrees() {
  try {
    const teoRaw = JSON.parse(fs.readFileSync('scripts/teomarket_all_products_raw.json', 'utf8'));
    
    // Find all trees in TeoMarket raw
    const teoTrees = teoRaw.filter(p => /brad|brazi/i.test(p.name || ''));
    console.log(`TeoMarket raw trees count: ${teoTrees.length}`);
    const teoTreesGte30 = teoTrees.filter(p => (parseInt(p.stock_quantity) || 0) >= 30);
    const teoTreesLt30 = teoTrees.filter(p => {
      const s = parseInt(p.stock_quantity) || 0;
      return s > 0 && s < 30;
    });
    const teoTreesZero = teoTrees.filter(p => (parseInt(p.stock_quantity) || 0) === 0);
    console.log(`TeoMarket trees breakdown: >=30: ${teoTreesGte30.length}, 1..29: ${teoTreesLt30.length}, 0: ${teoTreesZero.length}`);

    // In DB currently
    const dbTrees = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: 'brad', mode: 'insensitive' } },
          { title: { contains: 'brazi', mode: 'insensitive' } }
        ]
      },
      select: { id: true, sku: true, title: true, stock: true }
    });
    console.log(`DB trees currently: ${dbTrees.length}`);

    // Victronic trees
    const vicRaw = JSON.parse(fs.readFileSync('scripts/victronic_complete_scraped.json', 'utf8'));
    const vicTrees = vicRaw.filter(p => /brad|brazi/i.test(p.title || ''));
    console.log(`Victronic trees count: ${vicTrees.length}`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkTrees();

