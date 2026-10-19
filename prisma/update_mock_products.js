const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function run() {
  const topProducts = await prisma.product.findMany({
    take: 20,
    orderBy: [
      { discountPercentage: 'desc' },
      { reviewsCount: 'desc' },
    ],
    include: {
      category: true,
      vendor: true,
    },
  });

  console.log(`Found ${topProducts.length} top products.`);

  const recommended = topProducts.slice(0, 10).map((p) => {
    const images = JSON.parse(p.images || '[]');
    return {
      id: p.id,
      name: p.title,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice,
      image: images[0] || 'https://cdn.dsmcdn.com/sfweb-search/images/trendyol-product-card-placeholder_1759241898120.svg',
      sellerName: p.vendor.storeName,
      rating: p.rating,
      reviewCount: p.reviewsCount,
      stock: p.stock,
      badge: p.discountPercentage && p.discountPercentage > 20 ? 'sale' : 'top',
      category: p.category.name,
    };
  });

  const flash = topProducts.slice(10, 20).map((p) => {
    const images = JSON.parse(p.images || '[]');
    return {
      id: p.id,
      name: p.title,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice,
      image: images[0] || 'https://cdn.dsmcdn.com/sfweb-search/images/trendyol-product-card-placeholder_1759241898120.svg',
      sellerName: p.vendor.storeName,
      rating: p.rating,
      reviewCount: p.reviewsCount,
      stock: p.stock,
      badge: 'sale',
      category: p.category.name,
    };
  });

  const targetPath = path.join(__dirname, '..', 'lib', 'data', 'products.ts');
  const fileContent = `// ============================================
//   Real TopinStock Products from Trendyol Store
//   Imported automatically for mid=1151915
// ============================================

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  sellerName: string;
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: 'sale' | 'new' | 'top';
  category: string;
}

export const RECOMMENDED_PRODUCTS: MockProduct[] = ${JSON.stringify(recommended, null, 2)};

export const FLASH_PRODUCTS: MockProduct[] = ${JSON.stringify(flash, null, 2)};
`;

  fs.writeFileSync(targetPath, fileContent, 'utf8');
  console.log('Successfully updated lib/data/products.ts with real imported products!');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
