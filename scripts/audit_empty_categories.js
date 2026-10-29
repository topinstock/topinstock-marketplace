const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true, children: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Total categories in DB: ${categories.length}`);

    const emptyLeaves = [];
    const emptyWithChildren = [];
    const nonEmpty = [];

    for (const c of categories) {
      if (c._count.products === 0) {
        if (c._count.children === 0) {
          emptyLeaves.push(c);
        } else {
          emptyWithChildren.push(c);
        }
      } else {
        nonEmpty.push(c);
      }
    }

    console.log({
      total: categories.length,
      nonEmpty: nonEmpty.length,
      emptyLeavesCount: emptyLeaves.length,
      emptyWithChildrenCount: emptyWithChildren.length,
      sampleEmptyLeaves: emptyLeaves.slice(0, 15).map(c => ({ id: c.id, name: c.name, slug: c.slug }))
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
