const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testIndex() {
  // Let's find categories related to kitchen
  const cats = await prisma.category.findMany({
    where: {
      OR: [
        { slug: { contains: 'bucatarie' } },
        { slug: { contains: 'oale' } },
        { slug: { contains: 'tiga' } },
        { slug: { contains: 'vesela' } },
        { slug: { contains: 'gatit' } },
        { slug: { contains: 'cutit' } },
      ]
    },
    select: { id: true, slug: true, name: true }
  });
  console.log('Matching category count:', cats.length);
  const catIds = cats.map(c => c.id);

  console.time('indexed_query');
  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      categoryId: { in: catIds },
    },
    take: 8,
    orderBy: { stock: 'desc' },
    include: {
      vendor: { select: { id: true, storeName: true, slug: true, isVerified: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
  console.timeEnd('indexed_query');
  console.log('Indexed query result count:', products.length);

  await prisma.$disconnect();
}

testIndex();
