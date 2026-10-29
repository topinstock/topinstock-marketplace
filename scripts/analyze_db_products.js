const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const total = await prisma.product.count();
    const published = await prisma.product.count({ where: { isPublished: true } });
    const teoTotal = await prisma.product.count({ where: { sku: { startsWith: 'TIS-TEO' } } });
    const ktTotal = await prisma.product.count({ where: { sku: { startsWith: 'KT-' } } });
    const spinTotal = await prisma.product.count({ where: { sku: { startsWith: 'SPIN-' } } });
    const vicTotal = await prisma.product.count({ where: { sku: { startsWith: 'TIS-VIC' } } });
    
    // Find sample SKUs of remaining
    const samples = await prisma.product.findMany({
      where: {
        NOT: [
          { sku: { startsWith: 'TIS-TEO' } },
          { sku: { startsWith: 'KT-' } },
          { sku: { startsWith: 'SPIN-' } },
          { sku: { startsWith: 'TIS-VIC' } }
        ]
      },
      select: { id: true, sku: true, title: true },
      take: 10
    });

    console.log({
      total,
      published,
      teoTotal,
      ktTotal,
      spinTotal,
      vicTotal,
      otherCount: samples.length,
      sampleOther: samples
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
