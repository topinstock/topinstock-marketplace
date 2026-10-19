const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addIndexes() {
  await prisma.$queryRawUnsafe('CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(createdAt DESC);');
  await prisma.$queryRawUnsafe('CREATE INDEX IF NOT EXISTS idx_products_vendor_created ON products(vendorId, createdAt DESC);');
  console.log('Created createdAt indexes successfully!');

  console.time('admin_table_query');
  const prods = await prisma.product.findMany({
    take: 50,
    skip: 0,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, price: true, stock: true },
  });
  console.timeEnd('admin_table_query');
  console.log('Loaded products:', prods.length);

  await prisma.$disconnect();
}

addIndexes();
