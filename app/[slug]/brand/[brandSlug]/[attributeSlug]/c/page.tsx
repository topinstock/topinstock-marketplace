import type { Metadata } from 'next';
import { getCategoryDetails, getCatalogProducts } from '@/lib/products';
import { SEOManager } from '@/lib/seo';
import FacetedCategoryView from '@/components/catalog/FacetedCategoryView';

export const dynamic = 'force-dynamic';

interface CategoryBrandAttributePageProps {
  params: Promise<{ slug: string; brandSlug: string; attributeSlug: string }>;
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

// ── Dynamic SEO & Metadata (eMAG Category + Brand + 1 Attribute Facet Standard) ──
export async function generateMetadata({
  params,
  searchParams,
}: CategoryBrandAttributePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const { slug, brandSlug, attributeSlug } = resolvedParams;

  const brandName = SEOManager.parseBrandSlug(brandSlug);
  const parsedAttr = SEOManager.parseAttributeSlug(attributeSlug);
  const details = await getCategoryDetails(slug);
  const categoryName = details.category?.name || SEOManager.getCategoryDisplayName(slug);

  const catalogResult = await getCatalogProducts({
    category: slug,
    brand: brandName,
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
    brandSlug,
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

// ── eMAG-Style Category + Brand + Attribute Facet Route: /{slug}/brand/{brandSlug}/{attributeSlug}/c ──
export default async function CategoryBrandAttributePage({
  params,
  searchParams,
}: CategoryBrandAttributePageProps) {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;

  return (
    <FacetedCategoryView
      categorySlug={resolvedParams.slug}
      brandSlug={resolvedParams.brandSlug}
      attributeSlug={resolvedParams.attributeSlug}
      searchParams={resolvedQuery}
    />
  );
}
