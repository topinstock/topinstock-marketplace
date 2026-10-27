const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Applying Final Category Purity Audit ---');

  // Find target categories
  const ustensileCat = await prisma.category.findUnique({ where: { slug: 'ustensile-pentru-bucatarie' } });
  const taviCat = await prisma.category.findUnique({ where: { slug: 'tavi-si-forme-copt' } });
  const seturiCat = await prisma.category.findUnique({ where: { slug: 'seturi-oale-si-tigai' } });

  // 1. Move 2 fry baskets out of oale
  const resBaskets = await prisma.product.updateMany({
    where: {
      category: { slug: 'oale' },
      title: { contains: 'Sita friteuza' }
    },
    data: { categoryId: ustensileCat.id }
  });
  console.log(`Moved ${resBaskets.count} 'Sita friteuza' items to 'ustensile-pentru-bucatarie'`);

  // 2. Move 'Vas dreptunghiular rezistent la căldură' out of oale to tavi
  const resVas = await prisma.product.updateMany({
    where: {
      category: { slug: 'oale' },
      title: { contains: 'Vas dreptunghiular' }
    },
    data: { categoryId: taviCat.id }
  });
  console.log(`Moved ${resVas.count} 'Vas dreptunghiular' items to 'tavi-si-forme-copt'`);

  // 3. Move 'Set oala cu capac + tigaie' out of tigai to seturi
  const resSet = await prisma.product.updateMany({
    where: {
      category: { slug: 'tigai' },
      title: { contains: 'Set oala cu capac + tigaie' }
    },
    data: { categoryId: seturiCat.id }
  });
  console.log(`Moved ${resSet.count} 'Set oala cu capac + tigaie' items to 'seturi-oale-si-tigai'`);

  // Verify final count of oale
  const finalOale = await prisma.product.count({ where: { category: { slug: 'oale' } } });
  console.log(`Final count of strictly genuine pots in 'oale': ${finalOale}`);

  // Re-export fallback JSON files
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

  // Update categories fallback
  console.log('Regenerating categories_catalog_fallback.json...');
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
}

main().finally(() => prisma.$disconnect());

