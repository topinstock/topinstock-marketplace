const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Extracting all published products for Google Sitemap...');
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      sku: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Extracted ${products.length} products from SQLite.`);

  const sitemapItems = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    sku: p.sku || '',
    u: p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : (p.createdAt ? p.createdAt.toISOString().split('T')[0] : '2026-10-28'),
  }));

  const outPath = path.join(__dirname, '..', 'lib', 'data', 'all_products_sitemap.json');
  fs.writeFileSync(outPath, JSON.stringify(sitemapItems), 'utf-8');

  const stat = fs.statSync(outPath);
  console.log(`Saved ${sitemapItems.length} products to ${outPath}`);
  console.log(`File size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB (${(stat.size / 1024).toFixed(1)} KB)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

