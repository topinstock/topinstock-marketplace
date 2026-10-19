import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function generateFallbacks() {
  console.log('Extracting categories and catalog fallback...');

  // 1. All categories
  const allCats = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true, order: true },
    orderBy: { order: 'asc' }
  });

  const catCounts = await prisma.product.groupBy({
    by: ['categoryId'],
    where: { isPublished: true },
    _count: { id: true }
  });

  const countMap = new Map();
  catCounts.forEach(c => countMap.set(c.categoryId, c._count.id));

  const categoriesData = allCats.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    count: countMap.get(c.id) || 0
  }));

  console.log(`Extracted ${categoriesData.length} categories.`);

  // 2. Select products for each category that has products
  // We want to ensure ALL categories in the MegaMenu have at least 6-12 products.
  const productsToExtract = [];
  const seenProductIds = new Set();

  for (const cat of categoriesData) {
    if (cat.count === 0) continue;

    // Take top 8 products per category (sorted by rating / stock)
    const prods = await prisma.product.findMany({
      where: {
        categoryId: cat.id,
        isPublished: true,
      },
      take: 8,
      orderBy: [
        { stock: 'desc' },
        { rating: 'desc' }
      ],
      select: {
        id: true,
        vendorId: true,
        categoryId: true,
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
        attributes: true,
        rating: true,
        reviewsCount: true,
        isPublished: true,
        createdAt: true,
        vendor: {
          select: { id: true, storeName: true, slug: true, isVerified: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    for (const p of prods) {
      if (!seenProductIds.has(p.id)) {
        seenProductIds.add(p.id);

        let parsedImages = [];
        try {
          parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        } catch {
          parsedImages = ['/images/product_laptop.jpg'];
        }

        let parsedSizes = [];
        try {
          parsedSizes = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
        } catch {
          parsedSizes = [];
        }

        let parsedColors = [];
        try {
          parsedColors = typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors;
        } catch {
          parsedColors = [];
        }

        let parsedAttrs = null;
        try {
          parsedAttrs = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
        } catch {
          parsedAttrs = null;
        }

        const price = Number(p.price) || 0;
        const originalPrice = p.originalPrice ? Number(p.originalPrice) : null;
        let discount = p.discountPercentage;
        if (discount == null && originalPrice && originalPrice > price) {
          discount = Math.round(((originalPrice - price) / originalPrice) * 100);
        }

        productsToExtract.push({
          id: p.id,
          vendorId: p.vendorId,
          categoryId: p.categoryId,
          title: p.title,
          slug: p.slug,
          description: '',
          price,
          originalPrice,
          discountPercentage: discount,
          stock: p.stock || 10,
          sku: p.sku || '',
          images: Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages.slice(0, 3) : ['/images/product_laptop.jpg'],
          sizes: Array.isArray(parsedSizes) ? parsedSizes : [],
          colors: Array.isArray(parsedColors) ? parsedColors : [],
          attributes: parsedAttrs,
          rating: p.rating || 4.8,
          reviewsCount: p.reviewsCount || 12,
          isPublished: true,
          createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
          vendor: p.vendor,
          category: p.category
        });
      }
    }
  }

  console.log(`Total unique fallback products extracted: ${productsToExtract.length}`);

  const catJson = JSON.stringify(categoriesData);
  const prodJson = JSON.stringify(productsToExtract);

  console.log(`Categories JSON size: ${(catJson.length / 1024).toFixed(1)} KB`);
  console.log(`Products JSON size: ${(prodJson.length / (1024 * 1024)).toFixed(2)} MB (${(prodJson.length / 1024).toFixed(1)} KB)`);

  fs.writeFileSync('./lib/data/categories_catalog_fallback.json', catJson, 'utf-8');
  fs.writeFileSync('./lib/data/products_catalog_fallback.json', prodJson, 'utf-8');
  console.log('Saved both fallback datasets successfully!');
}

generateFallbacks().finally(() => prisma.$disconnect());
