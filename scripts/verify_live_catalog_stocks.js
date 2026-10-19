const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('=== VERIFICARE STARE CATALOG TOPINSTOCK ===\n');

  // 1. Verificare DB
  const total = await prisma.product.count();
  const published = await prisma.product.count({ where: { isPublished: true } });
  const publishedWithStock = await prisma.product.count({ where: { isPublished: true, stock: { gt: 0 } } });
  const publishedZeroStock = await prisma.product.count({ where: { isPublished: true, stock: 0 } });
  const unpublished = await prisma.product.count({ where: { isPublished: false } });

  console.log({
    totalProduseDb: total,
    produsePublicateActive: published,
    publicateCuStocRealPozitiv: publishedWithStock,
    publicateFaraStoc: publishedZeroStock,
    produseDezactivateFaraStoc: unpublished
  });

  if (publishedZeroStock === 0 && published === publishedWithStock) {
    console.log('\n✓ REUȘIT: TOATE cele ' + published + ' produse valabile pe site au stoc real pozitiv (> 0)!');
    console.log('✓ NICIUN produs fără stoc la furnizor nu mai este publicat/valabil pe site.');
  } else {
    console.warn('\n⚠ ATENȚIE: Există produse publicate cu stoc 0!');
  }

  // 2. Verificare un eșantion de produse publicate vs dezactivate
  const sampleActive = await prisma.product.findMany({
    where: { isPublished: true },
    take: 3,
    select: { title: true, sku: true, stock: true, isPublished: true }
  });
  console.log('\nEșantion produse active pe site:', sampleActive);

  const sampleDeactivated = await prisma.product.findMany({
    where: { isPublished: false },
    take: 3,
    select: { title: true, sku: true, stock: true, isPublished: true }
  });
  console.log('\nEșantion produse dezactivate:', sampleDeactivated);

  await prisma.$disconnect();
}

verify().catch(console.error);
