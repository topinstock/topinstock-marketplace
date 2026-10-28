const sitemap = require('../lib/data/all_products_sitemap.json');
console.log('Total products in sitemap dataset:', sitemap.length);

const PRODUCTS_PER_SITEMAP = 5000;
const totalPages = Math.ceil(sitemap.length / PRODUCTS_PER_SITEMAP);
console.log('Total product sitemaps (chunks):', totalPages);

for (let i = 1; i <= totalPages; i++) {
  const skip = (i - 1) * PRODUCTS_PER_SITEMAP;
  const chunk = sitemap.slice(skip, skip + PRODUCTS_PER_SITEMAP);
  console.log(`Page ${i}: ${chunk.length} products (from index ${skip} to ${skip + chunk.length - 1})`);
}

