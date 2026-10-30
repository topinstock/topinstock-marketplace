const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function inspectChristmasTrees() {
  const trees = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'brad artificial', mode: 'insensitive' } },
        { title: { contains: 'brazi artificiali', mode: 'insensitive' } },
        { title: { contains: 'brad de craciun', mode: 'insensitive' } },
        { title: { contains: 'brad de crăciun', mode: 'insensitive' } },
        { title: { contains: 'pom de craciun', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      sku: true,
      title: true,
      images: true
    }
  });

  console.log(`Found ${trees.length} actual Christmas trees in DB.`);

  for (let i = 0; i < Math.min(20, trees.length); i++) {
    const t = trees[i];
    let imgs = [];
    try { imgs = JSON.parse(t.images); } catch {}
    console.log(`[${i+1}] SKU: ${t.sku} | Title: ${t.title}`);
    console.log(`    First Image: ${imgs[0]}`);
  }
}

inspectChristmasTrees()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

