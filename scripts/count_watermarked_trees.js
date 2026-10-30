const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countWatermarkedTrees() {
  const allTrees = await prisma.product.findMany({
    where: {
      OR: [
        { category: { slug: 'brazi-de-craciun' } },
        { category: { slug: 'brazi-craciun' } },
        { title: { contains: 'brad artificial', mode: 'insensitive' } },
        { title: { contains: 'brazi artificiali', mode: 'insensitive' } },
        { title: { contains: 'brad de craciun', mode: 'insensitive' } },
        { title: { contains: 'brad de crăciun', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      sku: true,
      title: true,
      images: true,
      category: { select: { name: true, slug: true } }
    }
  });

  console.log(`Total Christmas tree products: ${allTrees.length}`);

  const teoTrees = allTrees.filter(t => t.sku && t.sku.startsWith('TIS-TEO-'));
  const vicTrees = allTrees.filter(t => t.sku && t.sku.startsWith('TIS-VIC-'));
  const dsmTrees = allTrees.filter(t => t.sku && /^TIS-\d+$/.test(t.sku));

  console.log({
    total: allTrees.length,
    teoTreesCount: teoTrees.length,
    vicTreesCount: vicTrees.length,
    dsmTreesCount: dsmTrees.length
  });

  // Let's filter real artificial trees (height in cm or m, excluding candles and napkins)
  const realTrees = allTrees.filter(t => {
    const s = t.title.toLowerCase();
    const isExcluded = s.includes('lumanare') || s.includes('farfurii') || s.includes('pahare') || s.includes('pungi') || s.includes('servetele');
    return !isExcluded;
  });

  console.log(`Real Christmas trees (excluding table accessories): ${realTrees.length}`);
  const realTeo = realTrees.filter(t => t.sku && t.sku.startsWith('TIS-TEO-'));
  console.log(`Of which from TeoMarket: ${realTeo.length}`);

  for (const t of realTeo) {
    let imgs = [];
    try { imgs = JSON.parse(t.images); } catch {}
    console.log(`- [${t.sku}] ${t.title} (${imgs.length} imgs) -> ${imgs[0]}`);
  }
}

countWatermarkedTrees()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

