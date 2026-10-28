const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function bench() {
  console.log('--- Profiling Supabase Queries ---');
  let t = Date.now();
  await prisma.$queryRawUnsafe('SELECT 1');
  console.log('1. Ping Supabase:', Date.now() - t, 'ms');

  t = Date.now();
  const cat = await prisma.category.findUnique({ where: { slug: 'oale' } });
  console.log('2. Find category (oale):', Date.now() - t, 'ms');

  t = Date.now();
  const allCats = await prisma.category.findMany({ select: { id: true, slug: true, name: true, parentId: true } });
  console.log('3. Find all 603 categories:', Date.now() - t, 'ms');

  t = Date.now();
  const prods = await prisma.product.findMany({
    where: { categoryId: cat.id, isPublished: true },
    take: 24,
    orderBy: { createdAt: 'desc' },
  });
  console.log('4. Find 24 products for oale:', Date.now() - t, 'ms');

  t = Date.now();
  const count = await prisma.product.count({
    where: { categoryId: cat.id, isPublished: true },
  });
  console.log('5. Count products for oale:', Date.now() - t, 'ms');

  t = Date.now();
  // What does getCategoryDetails or faceted queries do?
  // Let's test what app/[slug]/c/page.tsx does!
  const detailCat = await prisma.product.findMany({
    where: { categoryId: cat.id, isPublished: true },
    select: { price: true, title: true, attributes: true, vendor: { select: { storeName: true } } },
    take: 50,
  });
  console.log('6. CategoryDetails sample 50 prods:', Date.now() - t, 'ms');

  t = Date.now();
  const singleProd = await prisma.product.findFirst({
    where: {
      OR: [
        { id: 'cmvch5q5b01gm10957z9xi4mj' },
        { sku: 'cmvch5q5b01gm10957z9xi4mj' },
        { slug: 'cmvch5q5b01gm10957z9xi4mj' },
        { slug: 'set-trasare-detoolz-sfoara-creta-nivela' },
      ],
    },
    include: {
      vendor: true,
      category: {
        include: { parent: true },
      },
    },
  });
  console.log('7. PDP findFirst single product:', Date.now() - t, 'ms');
}

bench().catch(console.error).finally(() => prisma.$disconnect());

