const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vendors = await prisma.vendor.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  console.log('Vendors in DB:');
  vendors.forEach(v => {
    console.log(`- ${v.storeName} (${v.slug}): ${v._count.products} products`);
  });

  // Let's search all products in DB for any football or tracksuit or team sport items
  const sports = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'fotbal', mode: 'insensitive' } },
        { title: { contains: 'trening', mode: 'insensitive' } },
        { title: { contains: 'joma', mode: 'insensitive' } },
        { title: { contains: 'echipament', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      sku: true,
      title: true,
      vendor: { select: { storeName: true } }
    }
  });

  console.log(`\nTotal products matching fotbal / trening / joma / echipament: ${sports.length}`);
  const jomaOnly = sports.filter(s => s.title.toLowerCase().includes('joma'));
  console.log(`Joma in title: ${jomaOnly.length}`);
  jomaOnly.forEach(j => console.log(j.sku, '|', j.vendor?.storeName, '|', j.title));
}

main().finally(() => prisma.$disconnect());
