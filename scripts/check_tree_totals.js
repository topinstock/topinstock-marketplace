const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rootCats = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          _count: { select: { products: true } }
        }
      },
      _count: { select: { products: true } }
    }
  });

  for (const root of rootCats) {
    const directCount = root._count.products;
    const childrenTotal = root.children.reduce((acc, c) => acc + c._count.products, 0);
    console.log(`Root: ${root.name} (${root.slug}) -> Direct: ${directCount}, In Children: ${childrenTotal}, Total: ${directCount + childrenTotal}`);
  }
}

main().finally(() => prisma.$disconnect());

