const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findBestProducts() {
  // Check categories in database
  const cats = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } }
  });
  
  console.log('--- ALL CATEGORIES WITH PRODUCTS ---');
  cats
    .filter(c => c._count.products > 0)
    .sort((a, b) => b._count.products - a._count.products)
    .forEach(c => console.log(`${c.slug} (${c.name}): ${c._count.products} products`));

  await prisma.$disconnect();
}

findBestProducts().catch(console.error);
