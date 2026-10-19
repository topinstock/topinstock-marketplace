const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- OPTIMIZING SQLITE DATABASE ---');

  // 1. Pragmas
  await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
  await prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;');
  await prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;');
  await prisma.$queryRawUnsafe('PRAGMA temp_store = MEMORY;');
  await prisma.$queryRawUnsafe('PRAGMA mmap_size = 268435456;');

  // 2. High-performance composite indexes
  console.log('Creating database indexes on products...');
  await prisma.$queryRawUnsafe('CREATE INDEX IF NOT EXISTS idx_products_published_stock ON products(isPublished, stock DESC);');
  await prisma.$queryRawUnsafe('CREATE INDEX IF NOT EXISTS idx_products_cat_stock ON products(categoryId, stock DESC);');
  await prisma.$queryRawUnsafe('CREATE INDEX IF NOT EXISTS idx_products_published_cat ON products(isPublished, categoryId);');

  // Verify indexes
  const indexes = await prisma.$queryRawUnsafe('PRAGMA index_list(products);');
  console.log('Indexes on products:', indexes);

  // 3. Find Kitchen Categories
  const kitchenCategories = await prisma.category.findMany({
    where: {
      OR: [
        { slug: { contains: 'bucatarie' } },
        { slug: { contains: 'oale' } },
        { slug: { contains: 'tiga' } },
        { slug: { contains: 'vesela' } },
        { slug: { contains: 'gatit' } },
        { slug: { contains: 'cutit' } },
        { slug: { contains: 'menaj' } },
        { slug: { in: ['oale', 'tigai', 'seturi-vesela', 'cutit-si-set-de-cutite', 'bucatarie-menaj', 'materiale-pentru-gatit-si-servire'] } }
      ]
    },
    select: { id: true, slug: true, name: true }
  });
  console.log('Kitchen categories count:', kitchenCategories.length);

  // 4. Find Appliances Categories
  const appliancesCategories = await prisma.category.findMany({
    where: {
      OR: [
        { slug: { contains: 'electrocasnice' } },
        { slug: { contains: 'calorifer' } },
        { slug: { contains: 'ventilator' } },
        { slug: { contains: 'aspirator' } },
        { slug: { contains: 'mixer' } },
        { slug: { contains: 'blender' } },
        { slug: { contains: 'fierbator' } },
        { slug: { contains: 'tocat' } },
        { slug: { contains: 'rasnita' } },
        { slug: { in: ['calorifere-tip-panou', 'ventilator', 'electrocasnice', 'aspirator-vertical', 'mixer-si-set-de-mixere', 'blender-si-set-de-blender', 'fierbator-de-apa-si-ceainic', 'masini-de-tocat-carne', 'rasnite-de-cafea-si-condimente', 'prajitor-de-paine'] } }
      ]
    },
    select: { id: true, slug: true, name: true }
  });
  console.log('Appliances categories count:', appliancesCategories.length);

  // 5. Test speed with new indexes
  console.time('ultra_fast_kitchen_query');
  const kitchenProds = await prisma.product.findMany({
    where: {
      isPublished: true,
      categoryId: { in: kitchenCategories.map(c => c.id) },
    },
    take: 8,
    orderBy: { stock: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      originalPrice: true,
      discountPercentage: true,
      stock: true,
      sku: true,
      images: true,
      sizes: true,
      colors: true,
      rating: true,
      reviewsCount: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      vendor: { select: { id: true, storeName: true, slug: true, isVerified: true } },
      category: { select: { id: true, name: true, slug: true } },
    }
  });
  console.timeEnd('ultra_fast_kitchen_query');
  console.log('Kitchen products loaded:', kitchenProds.length);

  console.time('ultra_fast_appliances_query');
  const applianceProds = await prisma.product.findMany({
    where: {
      isPublished: true,
      categoryId: { in: appliancesCategories.map(c => c.id) },
    },
    take: 8,
    orderBy: { stock: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      originalPrice: true,
      discountPercentage: true,
      stock: true,
      sku: true,
      images: true,
      sizes: true,
      colors: true,
      rating: true,
      reviewsCount: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      vendor: { select: { id: true, storeName: true, slug: true, isVerified: true } },
      category: { select: { id: true, name: true, slug: true } },
    }
  });
  console.timeEnd('ultra_fast_appliances_query');
  console.log('Appliance products loaded:', applianceProds.length);

  await prisma.$disconnect();
}

run();
