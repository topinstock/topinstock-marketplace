const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMore() {
  const inSlug = await prisma.product.findMany({
    where: {
      OR: [
        { slug: { contains: 'bohmann' } },
        { slug: { contains: 'bohman' } }
      ]
    },
    select: { id: true, slug: true }
  });

  const inAttr = await prisma.product.findMany({
    where: {
      OR: [
        { attributes: { contains: 'Bohmann' } },
        { attributes: { contains: 'bohmann' } }
      ]
    },
    select: { id: true }
  });

  console.log(`Products with bohmann in slug: ${inSlug.length}`);
  console.log(`Products with bohmann in attributes: ${inAttr.length}`);
}

checkMore().finally(() => prisma.$disconnect());

