const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    where: {
      OR: [
        { slug: { contains: 'electro' } },
        { name: { contains: 'Electro' } },
        { slug: { contains: 'electrocasnice' } },
        { slug: { in: ['electrocasnice-mici', 'aspiratoare', 'espressoare-cafetiere', 'fierbator-de-apa-si-ceainic', 'prajitor-de-paine'] } }
      ]
    },
    include: { _count: { select: { products: true } }, parent: true, children: true }
  });
  console.log(cats.map(c => ({
    name: c.name,
    slug: c.slug,
    count: c._count.products,
    parentId: c.parentId,
    parentName: c.parent?.name,
    childrenCount: c.children.length
  })));
}

main().finally(() => prisma.$disconnect());

