const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findTeoTrees() {
  const prods = await prisma.product.findMany({
    where: {
      sku: { startsWith: 'TIS-TEO-' },
      title: { contains: 'brad', mode: 'insensitive' }
    },
    select: {
      id: true,
      sku: true,
      title: true,
      images: true,
      category: { select: { name: true, slug: true } }
    }
  });

  console.log(`Found ${prods.length} TeoMarket products with 'brad' in title.`);
  const sample = prods.filter(p => /brad artificial|brazi artificiali|brad de craciun|brad craciun/i.test(p.title));
  console.log(`Of which ${sample.length} have 'brad artificial' or 'brad de craciun'.`);
  for (let i = 0; i < Math.min(15, sample.length); i++) {
    const p = sample[i];
    let imgs = [];
    try { imgs = JSON.parse(p.images); } catch {}
    console.log(`[${p.sku}] [${p.category?.name}] ${p.title}`);
    console.log(`  Img: ${imgs[0]}`);
  }
}

findTeoTrees()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

