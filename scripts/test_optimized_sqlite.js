const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function optimize() {
  await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
  await prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;');
  await prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;');
  await prisma.$queryRawUnsafe('PRAGMA temp_store = MEMORY;');
  await prisma.$queryRawUnsafe('PRAGMA mmap_size = 268435456;');
  console.log('PRAGMAs set!');

  // Test kitchen query
  console.time('kitchen_optimized');
  const k = await prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        {
          category: {
            slug: {
              in: [
                'oale',
                'tigai',
                'seturi-vesela',
                'cutit-si-set-de-cutite',
                'bucatarie-menaj',
                'materiale-pentru-gatit-si-servire',
              ],
            },
          },
        },
        { title: { contains: 'inox' } },
        { title: { contains: 'tigaie' } },
        { title: { contains: 'oale' } },
        { title: { contains: 'cutit' } },
        { title: { contains: 'vesela' } },
      ],
      NOT: [
        { title: { contains: 'pistol' } },
        { title: { contains: 'copii' } },
        { title: { contains: 'jucarie' } },
      ],
    },
    take: 8,
    orderBy: { stock: 'desc' },
    include: {
      vendor: { select: { id: true, storeName: true, slug: true, isVerified: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
  console.timeEnd('kitchen_optimized');
  console.log('Result count:', k.length);
  await prisma.$disconnect();
}

optimize();
