const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const keywords = [
    'costum de antrenament',
    'academy',
    'championship',
    'danubio',
    'campus',
    'phoenix',
    'combi',
    'islandia',
    'joma',
    'trening',
    'echipament fotbal',
    'echipament sportiv'
  ];

  const orConditions = [];
  keywords.forEach(k => {
    orConditions.push({ title: { contains: k, mode: 'insensitive' } });
    orConditions.push({ description: { contains: k, mode: 'insensitive' } });
  });

  const products = await prisma.product.findMany({
    where: {
      OR: orConditions
    },
    select: {
      id: true,
      sku: true,
      title: true,
      price: true,
      images: true,
      category: { select: { name: true, slug: true } },
      attributes: true
    }
  });

  console.log(`Found ${products.length} matching products.`);
  products.forEach(p => {
    console.log(`- ${p.sku} | ${p.category?.name} | ${p.title}`);
  });
}

main().finally(() => prisma.$disconnect());

