import type { Metadata } from 'next';
import { getCategoryDetails, getCatalogProducts } from '@/lib/products';
import { SEOManager } from '@/lib/seo';
import FacetedCategoryView from '@/components/catalog/FacetedCategoryView';

export const revalidate = 120; // 2 minutes Edge ISR Cache

interface CategoryBrandPageProps {
  params: Promise<{ slug: string; brandSlug: string }>;
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

// ── Dynamic SEO & Metadata (eMAG Brand Facet Standard) ────────
export async function generateMetadata({
  params,
  searchParams,
}: CategoryBrandPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const { slug, brandSlug } = resolvedParams;

  const brandName = SEOManager.parseBrandSlug(brandSlug);
  const details = await getCategoryDetails(slug);
  const categoryName = details.category?.name || SEOManager.getCategoryDisplayName(slug);

  const catalogResult = await getCatalogProducts({
    category: slug,
    brand: brandName,
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
    brandSlug,
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

// ── eMAG-Style Category + Brand Facet Route: /{slug}/brand/{brandSlug}/c ──
export default async function CategoryBrandPage({
  params,
  searchParams,
}: CategoryBrandPageProps) {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;

  return (
    <FacetedCategoryView
      categorySlug={resolvedParams.slug}
      brandSlug={resolvedParams.brandSlug}
      searchParams={resolvedQuery}
    />
  );
}
