const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Generating complete 28,074 products fallback...');
  const start = Date.now();

  const products = await prisma.product.findMany({
    where: { isPublished: true },
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
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Fetched ${products.length} products in ${Date.now() - start}ms.`);

  const defaultVendor = {
    id: 'cmuul4drh0002qmgwo3xxew3l',
    storeName: 'TOPinStock',
    slug: 'topinstock-oficial',
    isVerified: true,
  };

  const formatted = products.map((p) => {
    let images = [];
    try {
      images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
    } catch {
      images = ['/images/product_laptop.jpg'];
    }
    if (!Array.isArray(images) || images.length === 0) {
      images = ['/images/product_laptop.jpg'];
    }

    let sizes = [];
    try {
      sizes = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
    } catch {
      sizes = [];
    }

    let colors = [];
    try {
      colors = typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors;
    } catch {
      colors = [];
    }

    let attributes = null;
    try {
      attributes = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
    } catch {
      attributes = null;
    }

    const price = Number(p.price) || 0;
    const originalPrice = p.originalPrice ? Number(p.originalPrice) : null;
    let discount = p.discountPercentage;
    if (discount == null && originalPrice && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    return {
      id: p.id,
      vendorId: p.vendorId || defaultVendor.id,
      categoryId: p.categoryId,
      title: p.title,
      slug: p.slug,
      description: '',
      price,
      originalPrice,
      discountPercentage: discount,
      stock: p.stock || 10,
      sku: p.sku || '',
      images: images.slice(0, 3),
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      attributes,
      rating: p.rating || 4.8,
      reviewsCount: p.reviewsCount || 12,
      isPublished: true,
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      vendor: defaultVendor,
      category: p.category,
    };
  });

  const outPath = path.join(__dirname, '..', 'lib', 'data', 'products_catalog_fallback.json');
  fs.writeFileSync(outPath, JSON.stringify(formatted), 'utf-8');

  const stat = fs.statSync(outPath);
  console.log(`Saved ${formatted.length} products to ${outPath}`);
  console.log(`File size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB (${(stat.size / 1024).toFixed(1)} KB)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

