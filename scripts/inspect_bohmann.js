const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectBohmann() {
  const inTitle = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'Bohmann' } },
        { title: { contains: 'bohmann' } },
        { title: { contains: 'Bohman' } },
        { title: { contains: 'bohman' } }
      ]
    },
    select: { id: true, title: true, vendor: { select: { storeName: true } } }
  });

  const inDesc = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'Bohmann' } },
        { description: { contains: 'bohmann' } },
        { description: { contains: 'Bohman' } },
        { description: { contains: 'bohman' } }
      ]
    },
    select: { id: true, title: true }
  });

  const vendors = await prisma.vendor.findMany({
    where: {
      OR: [
        { storeName: { contains: 'Bohmann' } },
        { storeName: { contains: 'bohmann' } },
        { storeName: { contains: 'Bohman' } },
        { storeName: { contains: 'bohman' } }
      ]
    }
  });

  console.log(`Products with Bohmann in title: ${inTitle.length}`);
  if (inTitle.length > 0) {
    console.log('Sample titles:');
    inTitle.slice(0, 5).forEach(p => console.log(' • ' + p.title));
  }

  console.log(`Products with Bohmann in description: ${inDesc.length}`);
  console.log(`Vendors with Bohmann in storeName: ${vendors.length}`);
}

inspectBohmann().finally(() => prisma.$disconnect());

