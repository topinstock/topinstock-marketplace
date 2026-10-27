const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  console.log('=== REMOVING BOHMANN / REPLACING WITH TOPinStock ===');

  // 1. Check categories
  const cats = await prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: 'Bohman' } },
        { name: { contains: 'bohman' } },
        { slug: { contains: 'bohman' } }
      ]
    }
  });
  console.log(`Categories matching bohman: ${cats.length}`);
  for (const c of cats) {
    const newName = c.name.replace(/bohmann?/gi, 'TOPinStock');
    const newSlug = c.slug.replace(/bohmann?/gi, 'topinstock');
    await prisma.category.update({
      where: { id: c.id },
      data: { name: newName, slug: newSlug }
    });
    console.log(`Updated category [${c.id}]: ${c.name} -> ${newName}`);
  }

  // 2. Check and update products
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'Bohman' } },
        { title: { contains: 'bohman' } },
        { description: { contains: 'Bohman' } },
        { description: { contains: 'bohman' } },
        { slug: { contains: 'bohman' } },
        { attributes: { contains: 'Bohman' } },
        { attributes: { contains: 'bohman' } }
      ]
    }
  });

  console.log(`Total products to update: ${products.length}`);
  let updatedCount = 0;

  for (const p of products) {
    const newTitle = p.title.replace(/\bbohmann?\b/gi, 'TOPinStock');
    const newDescription = p.description ? p.description.replace(/\bbohmann?\b/gi, 'TOPinStock') : p.description;
    let newSlug = p.slug.replace(/bohmann?/gi, 'topinstock');
    let newAttributes = p.attributes;

    if (newAttributes) {
      newAttributes = newAttributes.replace(/bohmann?/gi, 'TOPinStock');
    }

    // Check slug collision
    if (newSlug !== p.slug) {
      const existing = await prisma.product.findUnique({ where: { slug: newSlug } });
      if (existing && existing.id !== p.id) {
        newSlug = `${newSlug}-${p.id.slice(-6)}`;
      }
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        title: newTitle,
        description: newDescription,
        slug: newSlug,
        attributes: newAttributes
      }
    });
    updatedCount++;
    if (updatedCount % 50 === 0 || updatedCount === products.length) {
      console.log(`Updated ${updatedCount}/${products.length} products`);
    }
  }

  // 3. Verification check in DB
  const remainingInTitle = await prisma.product.count({
    where: {
      OR: [
        { title: { contains: 'Bohman' } },
        { title: { contains: 'bohman' } }
      ]
    }
  });
  const remainingInDesc = await prisma.product.count({
    where: {
      OR: [
        { description: { contains: 'Bohman' } },
        { description: { contains: 'bohman' } }
      ]
    }
  });
  const remainingInSlug = await prisma.product.count({
    where: {
      OR: [
        { slug: { contains: 'bohman' } }
      ]
    }
  });

  console.log('--- VERIFICATION ---');
  console.log(`Remaining in titles: ${remainingInTitle}`);
  console.log(`Remaining in descriptions: ${remainingInDesc}`);
  console.log(`Remaining in slugs: ${remainingInSlug}`);

  // 4. Regenerate fallback JSONs
  console.log('Regenerating products_catalog_fallback.json...');
  const allProducts = await prisma.product.findMany({
    where: { isPublished: true, stock: { gt: 0 } },
    select: {
      id: true,
      vendorId: true,
      categoryId: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      originalPrice: true,
      discountPercentage: true,
      stock: true,
      sku: true,
      images: true,
      sizes: true,
      colors: true,
      attributes: true,
      rating: true,
      reviewsCount: true,
      isPublished: true,
      createdAt: true,
      vendor: {
        select: {
          id: true,
          storeName: true,
          slug: true,
          isVerified: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      },
    },
    take: 1200,
    orderBy: [{ reviewsCount: 'desc' }, { stock: 'desc' }],
  });

  const productsJsonPath = path.join(__dirname, '..', 'lib', 'data', 'products_catalog_fallback.json');
  fs.writeFileSync(productsJsonPath, JSON.stringify(allProducts, null, 2));
  console.log(`Wrote ${allProducts.length} items to products_catalog_fallback.json`);

  const allCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  const categoriesFallback = allCategories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    count: c._count.products
  }));

  const categoriesJsonPath = path.join(__dirname, '..', 'lib', 'data', 'categories_catalog_fallback.json');
  fs.writeFileSync(categoriesJsonPath, JSON.stringify(categoriesFallback, null, 2));
  console.log(`Wrote ${categoriesFallback.length} categories to categories_catalog_fallback.json`);

  console.log('=== DONE ===');
}

main().finally(() => prisma.$disconnect());

