const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { sku: { startsWith: 'BOH' } },
        { sku: { startsWith: 'BH' } },
        { attributes: { contains: 'Bohmann' } }
      ]
    },
    select: {
      id: true,
      sku: true,
      title: true,
      attributes: true,
      vendor: { select: { storeName: true, slug: true } },
      category: { select: { name: true, slug: true } }
    },
    take: 10
  });

  console.log(`Found ${products.length} products:`);
  products.forEach(p => console.log(`[${p.sku}] ${p.title} | Vendor: ${p.vendor?.storeName} | Cat: ${p.category?.name}`));
}

main().finally(() => prisma.$disconnect());

