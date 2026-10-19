const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  const users = await prisma.user.findMany({
    include: { vendor: true }
  });
  console.log('--- USERS & VENDORS ---');
  users.forEach(u => {
    console.log(`User: ${u.email} (${u.role}) - Name: ${u.name}`);
    if (u.vendor) {
      console.log(`  Vendor: ${u.vendor.storeName} (id: ${u.vendor.id}, slug: ${u.vendor.slug})`);
    }
  });

  const productCount = await prisma.product.count();
  console.log('\n--- TOTAL PRODUCTS IN DB ---:', productCount);

  const sampleProducts = await prisma.product.findMany({
    take: 20,
    select: {
      id: true,
      title: true,
      slug: true,
      sku: true,
      price: true,
      vendor: { select: { storeName: true, slug: true } },
      category: { select: { name: true, slug: true } }
    }
  });
  console.log('\n--- SAMPLE EXISTING PRODUCTS ---:');
  sampleProducts.forEach(p => {
    console.log(`[${p.vendor.storeName}] [${p.category.name}] ${p.title} (slug: ${p.slug}, sku: ${p.sku}, price: ${p.price})`);
  });

  // Check how many victronic or grunberg products are already in the DB
  const victronicCount = await prisma.product.count({
    where: {
      OR: [
        { title: { contains: 'Victronic' } },
        { title: { contains: 'Grunberg' } },
        { description: { contains: 'Victronic' } },
        { description: { contains: 'Grunberg' } }
      ]
    }
  });
  console.log('\nVictronic / Grunberg products already in DB:', victronicCount);

  const allSlugs = await prisma.product.findMany({ select: { slug: true, title: true, sku: true } });
  console.log('Total product slugs in DB:', allSlugs.length);

  await prisma.$disconnect();
}

checkDatabase().catch(console.error);
