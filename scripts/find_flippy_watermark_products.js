const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findFlippyWatermarkProducts() {
  const prods = await prisma.product.findMany({
    where: {
      OR: [
        { images: { contains: 'flippy', mode: 'insensitive' } },
        { title: { contains: 'flippy', mode: 'insensitive' } },
        { description: { contains: 'flippy', mode: 'insensitive' } }
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

  console.log(`Found ${prods.length} products with 'flippy' in DB.`);

  // Group by category
  const catCount = {};
  for (const p of prods) {
    const cname = p.category?.name || 'Fara categorie';
    catCount[cname] = (catCount[cname] || 0) + 1;
  }
  console.log('Flippy products by category:', catCount);

  // Filter for Christmas / brazi
  const flippyTrees = prods.filter(p => /brad|brazi|craciun/i.test(p.title) || /brad|brazi|craciun/i.test(p.category?.name || ''));
  console.log(`Flippy Christmas/Tree products: ${flippyTrees.length}`);

  for (let i = 0; i < Math.min(25, flippyTrees.length); i++) {
    const p = flippyTrees[i];
    let imgs = [];
    try { imgs = JSON.parse(p.images); } catch {}
    console.log(`[${i+1}] [${p.category?.name}] ${p.title}`);
    console.log(`     Images (${imgs.length}): ${imgs.slice(0, 2).join(', ')}`);
  }
}

findFlippyWatermarkProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

