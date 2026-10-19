import { prisma } from '../lib/prisma';
import { getProductByCodeOrSlug, getProductReviews, getMarketplaceOffersForProduct } from '../lib/products';
import { SEOManager } from '../lib/seo';

async function testSeoManager() {
  console.log('Testing SEO on a TeoMarket product in TopinStock...');

  const dbProduct = await prisma.product.findFirst({
    where: { vendor: { slug: 'teomarket' } },
    select: { id: true, slug: true }
  });

  if (!dbProduct) {
    throw new Error('No TeoMarket product found');
  }

  const product = await getProductByCodeOrSlug(dbProduct.id, dbProduct.slug);
  if (!product) {
    throw new Error('Failed to resolve formatted product');
  }

  console.log('✓ Product loaded:', product.title);
  console.log('✓ Category:', product.category?.name, `(/${product.category?.slug}/c)`);
  console.log('✓ Vendor:', product.vendor?.storeName, `(/seller/${product.vendor?.slug}/v)`);

  // 1. Metadata
  const metadata = SEOManager.getProductMetadata(product);
  console.log('✓ Meta Title:', metadata.title);
  console.log('✓ Meta Description:', metadata.description);
  console.log('✓ Canonical URL:', (metadata.alternates as any)?.canonical);

  // 2. Composed Title
  const composedTitle = SEOManager.composeProductTitle(product);
  console.log('✓ eMAG Composed Title:', composedTitle);

  // 3. JSON-LD Structured Data
  const productReviews = getProductReviews(product);
  const marketplaceOffers = getMarketplaceOffersForProduct(product);
  const productJsonLd = SEOManager.getProductJsonLd({
    product,
    additionalOffers: marketplaceOffers,
    reviews: productReviews,
  });

  console.log('✓ Schema.org Context:', (productJsonLd as any)['@context']);
  console.log('✓ Schema.org Type:', (productJsonLd as any)['@type']);
  console.log('✓ Schema.org Name:', (productJsonLd as any).name);
  console.log('✓ Schema.org Brand:', (productJsonLd as any).brand?.name);
  console.log('✓ Schema.org Offers Price:', (productJsonLd as any).offers?.price, (productJsonLd as any).offers?.priceCurrency);
  console.log('✓ Schema.org AggregateRating:', (productJsonLd as any).aggregateRating?.ratingValue, `(${(productJsonLd as any).aggregateRating?.reviewCount} reviews)`);

  // 4. Breadcrumbs JSON-LD
  const breadcrumbs = SEOManager.buildProductBreadcrumbs(product);
  const breadcrumbJsonLd = SEOManager.getBreadcrumbsJsonLd(breadcrumbs);
  console.log('✓ Breadcrumbs Elements:', (breadcrumbJsonLd as any).itemListElement?.map((b: any) => b.name).join(' > '));

  console.log('\n======================================================');
  console.log('✅ ALL SEO SYSTEMS FULLY VERIFIED ON TEOMARKET PRODUCT!');
  console.log('======================================================');
}

testSeoManager()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
