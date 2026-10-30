import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getProductByCodeOrSlug,
  getRelatedProducts,
  getProductReviews,
  getMarketplaceOffersForProduct,
} from '@/lib/products';
import { SEOManager } from '@/lib/seo';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductTabs from '@/components/products/ProductTabs';
import RelatedProducts from '@/components/products/RelatedProducts';

export const revalidate = 300; // 5 minutes Edge ISR Cache

interface EmagProductDetailPageProps {
  params: Promise<{ slug: string; code: string }>;
}

// ── Dynamic SEO & OpenGraph Metadata (eMAG.ro Standard) ───────
export async function generateMetadata({
  params,
}: EmagProductDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductByCodeOrSlug(resolvedParams.code, resolvedParams.slug);

  if (!product) {
    return {
      title: 'Produs negăsit — TOPinStock',
    };
  }

  return SEOManager.getProductMetadata(product);
}

// ── eMAG-Style Product Detail Page (PDP) ──────────────────────
export default async function EmagProductDetailPage({ params }: EmagProductDetailPageProps) {
  const resolvedParams = await params;
  const product = await getProductByCodeOrSlug(resolvedParams.code, resolvedParams.slug);

  if (!product || !product.isPublished) {
    notFound();
  }

  // Fetch related products from the same category
  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  // eMAG composed title from technical attributes
  const composedTitle = SEOManager.composeProductTitle(product);

  // Reviews & Marketplace Offers (Modelul eMAG)
  const productReviews = getProductReviews(product);
  const marketplaceOffers = getMarketplaceOffersForProduct(product);

  // Schema.org JSON-LD Structured Data for Googlebot & Rich Snippets (Product & BreadcrumbList)
  const productJsonLd = SEOManager.getProductJsonLd({
    product,
    additionalOffers: marketplaceOffers,
    reviews: productReviews,
  });

  const breadcrumbs = SEOManager.buildProductBreadcrumbs(product);
  const breadcrumbJsonLd = SEOManager.getBreadcrumbsJsonLd(breadcrumbs);

  return (
    <>
      {/* ── JSON-LD Structured Data for Googlebot & Rich Snippets ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50/70 py-8">
        <div className="container-app max-w-6xl space-y-12">
          {/* ── Main PDP Card: Gallery + Product Info with single <h1> ── */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Gallery (Left: 6 cols) */}
              <div className="lg:col-span-6">
                <ProductGallery
                  images={product.images}
                  title={product.title}
                  discountPercentage={product.discountPercentage}
                />
              </div>

              {/* Product Info (Right: 6 cols) — Contains the single clean <h1> */}
              <div className="lg:col-span-6">
                <ProductInfo
                  product={product}
                  composedTitle={composedTitle}
                  breadcrumbs={breadcrumbs}
                  marketplaceOffers={marketplaceOffers}
                />
              </div>
            </div>
          </div>

          {/* ── Product Tabs & Detailed Specifications ── */}
          <ProductTabs product={product} />

          {/* ── Recommended / Similar Products Carousel ── */}
          {related.length > 0 && <RelatedProducts products={related} />}


        </div>
      </div>
    </>
  );
}
