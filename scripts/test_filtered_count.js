const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFilterCount() {
  try {
    const cats = await prisma.category.findMany({
      take: 2,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: {
              where: { isPublished: true }
            }
          }
        }
      }
    });
    console.log('Filtered relation count supported:', cats);
  } catch (err) {
    console.log('Filtered relation count error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFilterCount();
