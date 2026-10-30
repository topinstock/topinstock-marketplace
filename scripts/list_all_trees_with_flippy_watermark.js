const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
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
      images: true
    }
  });

  // Filter actual artificial trees (not candles, napkins, wrapping paper)
  const realTrees = allTrees.filter(t => {
    const s = t.title.toLowerCase();
    return !s.includes('lumanare') && !s.includes('farfurii') && !s.includes('pahare') && !s.includes('pungi') && !s.includes('servetele') && !s.includes('bentita') && !s.includes('costum');
  });

  console.log(`Real artificial tree products in DB: ${realTrees.length}`);

  const treesWithTeoFlippyImages = [];
  for (const t of realTrees) {
    let imgs = [];
    try { imgs = JSON.parse(t.images); } catch {}
    const hasTeoS3 = imgs.some(img => img.includes('images-teomarket') || img.includes('flippy'));
    if (hasTeoS3) {
      treesWithTeoFlippyImages.push({
        id: t.id,
        sku: t.sku,
        title: t.title,
        images: imgs
      });
    }
  }

  console.log(`Trees with TeoMarket/Flippy images: ${treesWithTeoFlippyImages.length}`);
  for (let i = 0; i < treesWithTeoFlippyImages.length; i++) {
    const item = treesWithTeoFlippyImages[i];
    console.log(`[${i+1}] [${item.sku}] ${item.title}`);
    console.log(`     Image: ${item.images[0]}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());

