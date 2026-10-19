const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
      _count: { select: { products: true } }
    },
    orderBy: [{ parentId: 'asc' }, { order: 'asc' }]
  });

  console.log(`Total categories in DB: ${categories.length}`);
  const parents = categories.filter(c => !c.parentId);
  console.log(`\nParent categories (${parents.length}):`);
  parents.forEach(p => {
    console.log(`- [${p.id}] ${p.name} (${p.slug}) - ${p.children.length} subcategories, ${p._count.products} products`);
  });

  console.log(`\nSample child categories (first 25):`);
  const children = categories.filter(c => c.parentId);
  children.slice(0, 25).forEach(c => {
    console.log(`  - [${c.id}] ${c.name} (${c.slug}) -> Parent: ${c.parent?.name} (${c._count.products} products)`);
  });

  await prisma.$disconnect();
}

checkCategories().catch(console.error);
