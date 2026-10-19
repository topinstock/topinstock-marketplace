const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { products: true } },
    },
    orderBy: { products: { _count: 'desc' } },
  });

  console.log('Categories with product counts:');
  categories.forEach(c => {
    console.log(`- ${c.name} (${c.slug}): ${c._count.products} produse`);
  });

  const electroCount = await prisma.product.count({
    where: {
      OR: [
        { category: { slug: { contains: 'electro' } } },
        { title: { contains: 'electric' } },
        { title: { contains: 'calorifer' } },
        { title: { contains: 'incalzitor' } },
        { title: { contains: 'aspirator' } },
      ],
    },
  });
  console.log(`\nElectrocasnice / aparate electro: ${electroCount} produse`);

  const oaleCount = await prisma.product.count({
    where: {
      OR: [
        { category: { slug: { contains: 'bucatarie' } } },
        { category: { slug: { contains: 'oale' } } },
        { category: { slug: { contains: 'vesela' } } },
        { title: { contains: 'inox' } },
        { title: { contains: 'oale' } },
      ],
    },
  });
  console.log(`Bucătărie / Gătit / Oale: ${oaleCount} produse`);
}

main().finally(() => prisma.$disconnect());
