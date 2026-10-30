const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAndCleanCategories() {
  console.log('=== FIXING MATCHES AND CLEANING EMPTY CATEGORIES ===\n');

  // 1. Assign Gratare si Accesorii BBQ
  const bbqCat = await prisma.category.findUnique({ where: { slug: 'gratare-si-accesorii-bbq' } });
  if (bbqCat) {
    const bbqProds = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: 'grătar de grădină', mode: 'insensitive' } },
          { title: { contains: 'gratar', mode: 'insensitive' } },
          { title: { contains: 'bbq', mode: 'insensitive' } }
        ]
      },
      select: { id: true, title: true }
    });
    console.log(`Assigning ${bbqProds.length} products to [Gratare si Accesorii BBQ]...`);
    await prisma.product.updateMany({
      where: { id: { in: bbqProds.map(p => p.id) } },
      data: { categoryId: bbqCat.id }
    });
  }

  // 2. Assign Decoratiune Muzicala Craciun
  const decorMuzCat = await prisma.category.findUnique({ where: { slug: 'decoratiune-muzicala-craciun' } });
  if (decorMuzCat) {
    const prods = await prisma.product.findMany({
      where: {
        title: { contains: 'Decoratiune muzicala', mode: 'insensitive' }
      },
      select: { id: true }
    });
    console.log(`Assigning ${prods.length} products to [Decoratiune Muzicala Craciun]...`);
    await prisma.product.updateMany({
      where: { id: { in: prods.map(p => p.id) } },
      data: { categoryId: decorMuzCat.id }
    });
  }

  // 3. Assign Maternitate
  const maternitateCat = await prisma.category.findUnique({ where: { slug: 'maternitate' } });
  if (maternitateCat) {
    const prods = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: 'gravide', mode: 'insensitive' } },
          { title: { contains: 'gravidelor', mode: 'insensitive' } },
          { title: { contains: 'maternitate', mode: 'insensitive' } }
        ]
      },
      select: { id: true }
    });
    console.log(`Assigning ${prods.length} products to [Maternitate]...`);
    await prisma.product.updateMany({
      where: { id: { in: prods.map(p => p.id) } },
      data: { categoryId: maternitateCat.id }
    });
  }

  // 4. Find all categories that are leaves (0 children) AND have 0 products
  const emptyLeaves = await prisma.category.findMany({
    where: {
      products: { none: {} },
      children: { none: {} }
    },
    select: { id: true, name: true, slug: true }
  });

  console.log(`Found ${emptyLeaves.length} empty leaf categories with 0 products.`);
  for (const c of emptyLeaves) {
    console.log(`Deleting empty category: ${c.name} (${c.slug})`);
    await prisma.category.delete({ where: { id: c.id } });
  }

  console.log('Category fix and cleanup complete.');
}

fixAndCleanCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

