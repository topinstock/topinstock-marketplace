const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectCategoryPurity() {
  const categoriesToCheck = [
    { slug: 'oale', name: 'Oale' },
    { slug: 'seturi-oale-si-tigai', name: 'Seturi Oale & Tigăi' },
    { slug: 'tigai', name: 'Tigăi' },
    { slug: 'electrocasnice', name: 'Electrocasnice' },
    { slug: 'espressoare-cafetiere', name: 'Espressoare' },
    { slug: 'jucarii-si-jocuri', name: 'Jucării și Jocuri' },
    { slug: 'biciclete-pentru-copii', name: 'Biciclete Copii' },
  ];

  for (const c of categoriesToCheck) {
    const cat = await prisma.category.findUnique({
      where: { slug: c.slug },
      include: { products: { select: { id: true, title: true } } }
    });
    console.log(`\n========================================`);
    console.log(`Category: ${c.name} (${c.slug}) — Total: ${cat ? cat.products.length : 0} products`);
    console.log(`========================================`);
    if (cat && cat.products.length > 0) {
      console.log('Sample 10:');
      cat.products.slice(0, 10).forEach(p => console.log(' • ' + p.title));
    }
  }
}

inspectCategoryPurity().finally(() => prisma.$disconnect());

