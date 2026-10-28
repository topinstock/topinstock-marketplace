import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getCategoryDetails, getCatalogProducts } from '@/lib/products';
import { SEOManager } from '@/lib/seo';
import FacetedCategoryView from '@/components/catalog/FacetedCategoryView';

export const revalidate = 120; // 2 minutes Edge ISR Cache

interface CategoryAttributePageProps {
  params: Promise<{ slug: string; attributeSlug: string }>;
  searchParams: Promise<{
    brand?: string;
    inStock?: string;
    onSale?: string;
    minPrice?: string;
    maxPrice?: string;
    sizes?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

// ── Dynamic SEO & Metadata (eMAG Category + 1 Attribute Facet Standard) ──
export async function generateMetadata({
  params,
  searchParams,
}: CategoryAttributePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const { slug, attributeSlug } = resolvedParams;

  if (attributeSlug === 'brand') {
    return {};
  }

  const parsedAttr = SEOManager.parseAttributeSlug(attributeSlug);
  const details = await getCategoryDetails(slug);
  const categoryName = details.category?.name || SEOManager.getCategoryDisplayName(slug);

  const catalogResult = await getCatalogProducts({
    category: slug,
    brand: resolvedQuery?.brand,
    attribute: parsedAttr.value,
    search: resolvedQuery?.search,
    inStock: resolvedQuery?.inStock === 'true',
    onSale: resolvedQuery?.onSale === 'true',
    minPrice: resolvedQuery?.minPrice ? Number(resolvedQuery.minPrice) : undefined,
    maxPrice: resolvedQuery?.maxPrice ? Number(resolvedQuery.maxPrice) : undefined,
    sizes: resolvedQuery?.sizes?.split(',').filter(Boolean) ?? [],
    sort: (resolvedQuery?.sort ?? 'newest') as any,
    page: Math.max(1, Number(resolvedQuery?.page ?? '1')),
  });

  return SEOManager.getFacetedCategoryMetadata({
    categoryName,
    categorySlug: slug,
    attributeSlug,
    brandsList: resolvedQuery?.brand ? [resolvedQuery.brand] : [],
    attributesList: resolvedQuery?.sizes ? resolvedQuery.sizes.split(',') : [],
    productsCount: catalogResult.total,
    minPrice: resolvedQuery?.minPrice,
    maxPrice: resolvedQuery?.maxPrice,
    sort: resolvedQuery?.sort,
    page: Math.max(1, Number(resolvedQuery?.page ?? '1')),
    inStock: resolvedQuery?.inStock === 'true',
    onSale: resolvedQuery?.onSale === 'true',
    search: resolvedQuery?.search,
  });
}

// ── eMAG-Style Category + 1 Attribute Facet Route: /{slug}/{attributeSlug}/c ──
export default async function CategoryAttributePage({
  params,
  searchParams,
}: CategoryAttributePageProps) {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const { slug, attributeSlug } = resolvedParams;

  // Protect against reserved segment 'brand' falling through
  if (attributeSlug === 'brand') {
    permanentRedirect(SEOManager.buildCategoryUrl(slug));
  }

  return (
    <FacetedCategoryView
      categorySlug={slug}
      attributeSlug={attributeSlug}
      searchParams={resolvedQuery}
    />
  );
}
