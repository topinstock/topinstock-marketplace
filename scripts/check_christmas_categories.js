const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkChristmasCategories() {
  const cats = await prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: 'brad', mode: 'insensitive' } },
        { name: { contains: 'craciun', mode: 'insensitive' } },
        { slug: { contains: 'brad', mode: 'insensitive' } },
        { slug: { contains: 'craciun', mode: 'insensitive' } }
      ]
    },
    include: {
      _count: { select: { products: true } }
    }
  });

  console.log('Christmas / tree categories:');
  for (const c of cats) {
    console.log(`- ${c.name} (${c.slug}) -> ${c._count.products} products`);
  }

  // Also check products in category Brazi de Crăciun
  const treeCat = cats.find(c => c.slug.includes('brazi'));
  if (treeCat) {
    const prods = await prisma.product.findMany({
      where: { categoryId: treeCat.id },
      select: { id: true, sku: true, title: true, images: true },
      take: 20
    });
    console.log(`\nSample products in ${treeCat.name}:`);
    for (const p of prods) {
      let imgs = [];
      try { imgs = JSON.parse(p.images); } catch {}
      console.log(`- [${p.sku}] ${p.title}`);
      console.log(`  Img: ${imgs[0]}`);
    }
  }
}

checkChristmasCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

