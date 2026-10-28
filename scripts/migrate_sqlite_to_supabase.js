const { PrismaClient: SqliteClient } = require('../prisma/generated/sqlite-client');
const { PrismaClient: PostgresClient } = require('@prisma/client');

const sqlite = new SqliteClient();
const pg = new PostgresClient();

async function main() {
  console.log('--- Starting Migration from SQLite to Supabase PostgreSQL ---');
  const startTime = Date.now();

  // 1. Users
  const users = await sqlite.user.findMany();
  console.log(`Migrating ${users.length} users...`);
  for (const u of users) {
    await pg.user.upsert({
      where: { id: u.id },
      update: u,
      create: u,
    });
  }

  // 2. Vendors
  const vendors = await sqlite.vendor.findMany();
  console.log(`Migrating ${vendors.length} vendors...`);
  for (const v of vendors) {
    await pg.vendor.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  }

  // 3. Categories (Insert without parentId first to avoid FK constraint issues, then update parentIds)
  const categories = await sqlite.category.findMany();
  console.log(`Migrating ${categories.length} categories...`);
  for (const c of categories) {
    await pg.category.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        order: c.order,
      },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        order: c.order,
      },
    });
  }

  // Update parent relationships
  console.log('Linking category parent relationships...');
  for (const c of categories) {
    if (c.parentId) {
      await pg.category.update({
        where: { id: c.id },
        data: { parentId: c.parentId },
      }).catch((e) => {
        // Parent might not exist
      });
    }
  }

  // 4. Marketplace Settings
  const settings = await sqlite.marketplaceSettings.findMany();
  for (const s of settings) {
    await pg.marketplaceSettings.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  // 5. Products
  const totalProducts = await sqlite.product.count();
  console.log(`Migrating ${totalProducts} products in batches of 500...`);

  const BATCH_SIZE = 500;
  let migrated = 0;

  for (let skip = 0; skip < totalProducts; skip += BATCH_SIZE) {
    const batch = await sqlite.product.findMany({
      skip,
      take: BATCH_SIZE,
      orderBy: { id: 'asc' },
    });

    const formattedBatch = batch.map((p) => ({
      id: p.id,
      vendorId: p.vendorId,
      categoryId: p.categoryId,
      title: p.title,
      slug: p.slug,
      description: p.description || '',
      price: p.price,
      originalPrice: p.originalPrice,
      discountPercentage: p.discountPercentage,
      stock: p.stock,
      sku: p.sku,
      images: p.images,
      sizes: p.sizes,
      colors: p.colors,
      attributes: p.attributes,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      isPublished: p.isPublished,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    await pg.product.createMany({
      data: formattedBatch,
      skipDuplicates: true,
    });

    migrated += batch.length;
    const percent = ((migrated / totalProducts) * 100).toFixed(1);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Progress: ${migrated} / ${totalProducts} products (${percent}%) [${elapsedSec}s]`);
  }

  const pgCount = await pg.product.count();
  console.log(`\n=== Migration Complete! ===`);
  console.log(`Products in Supabase PostgreSQL: ${pgCount}`);
  console.log(`Total duration: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await pg.$disconnect();
  });

