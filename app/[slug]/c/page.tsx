import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Package2, RotateCcw } from 'lucide-react';
import {
  getCatalogProducts,
  getCatalogCategories,
  getAvailableSizes,
  getCategoryDetails,
  getCategoryFacetCounts,
} from '@/lib/products';
import { SEOManager } from '@/lib/seo';
import FilterSidebar from '@/components/catalog/FilterSidebar';
import ProductCard from '@/components/products/ProductCard';
import SortBar from '@/components/catalog/SortBar';
import PaginationControls from '@/components/catalog/PaginationControls';
import ActiveFilters from '@/components/catalog/ActiveFilters';
import { CatalogLoadingProvider } from '@/components/catalog/CatalogLoadingContext';
import CatalogGridWrapper from '@/components/catalog/CatalogGridWrapper';
import PopularSearches from '@/components/seo/PopularSearches';
import CategorySeoGuide from '@/components/seo/CategorySeoGuide';

export const revalidate = 120; // 2 minutes Edge ISR Cache

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    brand?: string;
    inStock?: string;
    onSale?: string;
    minPrice?: string;
    maxPrice?: string;
    sizes?: string;
    color?: string;
    attribute?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

const PAGE_SIZE = 16;

// ── Dynamic SEO & OpenGraph Metadata (eMAG.ro Standard) ───────
export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const categorySlug = resolvedParams.slug;
  const currentPage = Math.max(1, Number(resolvedQuery?.page ?? '1'));

  const details = await getCategoryDetails(categorySlug);
  const categoryName = details.category?.name || SEOManager.getCategoryDisplayName(categorySlug);

  const hasAnyQueryFilter = Boolean(
    resolvedQuery?.brand ||
    resolvedQuery?.sizes ||
    resolvedQuery?.minPrice ||
    resolvedQuery?.maxPrice ||
    (resolvedQuery?.sort && resolvedQuery.sort !== 'newest') ||
    (resolvedQuery?.page && Number(resolvedQuery.page) > 1) ||
    resolvedQuery?.inStock ||
    resolvedQuery?.onSale ||
    resolvedQuery?.search
  );

  if (hasAnyQueryFilter) {
    const brandsList = resolvedQuery?.brand ? resolvedQuery.brand.split(',').filter(Boolean) : [];
    const attributesList = resolvedQuery?.sizes ? resolvedQuery.sizes.split(',').filter(Boolean) : [];

    return SEOManager.getFacetedCategoryMetadata({
      categoryName,
      categorySlug,
      brandsList,
      attributesList,
      productsCount: details.totalProducts,
      minPrice: resolvedQuery?.minPrice,
      maxPrice: resolvedQuery?.maxPrice,
      sort: resolvedQuery?.sort,
      page: currentPage,
      inStock: resolvedQuery?.inStock === 'true',
      onSale: resolvedQuery?.onSale === 'true',
      search: resolvedQuery?.search,
    });
  }

  return SEOManager.getCategoryMetadata({
    categoryName,
    categorySlug,
    productsCount: details.totalProducts,
    minPrice: details.minPrice,
    topBrands: details.topBrands,
    page: currentPage,
  });
}

// ── eMAG-Style Category Page: /{slug}/c ───────────────────────
export default async function EmagCategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const categorySlug = resolvedParams.slug;
  const currentPage = Math.max(1, Number(resolvedQuery?.page ?? '1'));
  const sort = (resolvedQuery?.sort ?? 'newest') as any;

  // Preluare date catalog & detalii SEO în paralel
  const [catalogResult, categories, availableSizes, details, facetCounts] = await Promise.all([
    getCatalogProducts({
      category: categorySlug,
      search: resolvedQuery?.search,
      brand: resolvedQuery?.brand,
      inStock: resolvedQuery?.inStock === 'true',
      onSale: resolvedQuery?.onSale === 'true',
      minPrice: resolvedQuery?.minPrice ? Number(resolvedQuery.minPrice) : undefined,
      maxPrice: resolvedQuery?.maxPrice ? Number(resolvedQuery.maxPrice) : undefined,
      sizes: resolvedQuery?.sizes?.split(',').filter(Boolean) ?? [],
      color: resolvedQuery?.color,
      attribute: resolvedQuery?.attribute,
      sort,
      page: currentPage,
    }),
    getCatalogCategories(),
    getAvailableSizes(categorySlug),
    getCategoryDetails(categorySlug),
    getCategoryFacetCounts(categorySlug),
  ]);

  const { products, total, totalPages } = catalogResult;
  const categoryName = details.category?.name || SEOManager.getCategoryDisplayName(categorySlug);

  // Schema.org JSON-LD Structured Data for Googlebot & Rich Snippets
  const breadcrumbJsonLd = SEOManager.getBreadcrumbsJsonLd([
    { name: 'Acasă', url: '/' },
    { name: 'Produse', url: '/produse' },
    { name: categoryName, url: SEOManager.buildCategoryUrl(categorySlug) },
  ]);

  const categoryJsonLd = SEOManager.getCategoryJsonLd({
    categoryName,
    categorySlug,
    products,
    totalProducts: total,
  });

  return (
    <>
      {/* ── JSON-LD Structured Data for Googlebot ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />

      <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] pb-12">
        {/* ── eMAG-Style Category Header Banner ── */}
        <div className="bg-gradient-to-r from-[#0a6c74] via-[#006b80] to-[#004f61] py-7 text-white shadow-inner">
          <div className="container-app">
            {/* Breadcrumb Navigation */}
            <nav className="text-[12px] text-white/70 mb-3 flex items-center gap-1.5 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                Acasă
              </Link>
              <span>/</span>
              <Link href="/produse" className="hover:text-white transition-colors">
                Catalog Produse
              </Link>
              <span>/</span>
              <span className="text-white font-semibold">{categoryName}</span>
            </nav>

            {/* Clean Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  {categoryName}
                </h1>
                <p className="text-white/85 text-sm sm:text-base mt-1.5 font-medium">
                  {total.toLocaleString('ro-RO')} {total === 1 ? 'produs' : 'produse'} disponibile direct din stoc • Prețuri de la{' '}
                  <span className="font-bold text-amber-300">
                    {Math.round(details.minPrice || 39)} Lei
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Catalog Content Area ── */}
        <div className="container-app py-6">
          <CatalogLoadingProvider>
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start" style={{ alignItems: 'flex-start' }}>
              {/* ── Left Sidebar Filter (Client Component) ── */}
              <Suspense
                fallback={
                  <>
                    <div className="lg:hidden w-full h-[52px] bg-white/95 rounded-2xl animate-pulse border border-slate-200/80 mb-3" />
                    <div className="hidden lg:block w-[260px] h-[500px] bg-white rounded-2xl animate-pulse border border-slate-100 shadow-sm" />
                  </>
                }
              >
                <FilterSidebar
                  categories={categories}
                  availableSizes={availableSizes}
                  currentFilters={{ ...resolvedQuery, category: categorySlug }}
                  totalResults={total}
                  facetCounts={facetCounts}
                />
              </Suspense>

              {/* ── Products Content Area ── */}
              <div className="flex-1 min-w-0 w-full">
                {/* Active filters chips */}
                <Suspense>
                  <ActiveFilters
                    filters={{ ...resolvedQuery, category: categorySlug }}
                    categories={categories}
                  />
                </Suspense>

                {/* Sort Bar */}
                <Suspense>
                  <SortBar
                    currentSort={sort}
                    total={total}
                    currentPage={currentPage}
                    perPage={PAGE_SIZE}
                  />
                </Suspense>

                {/* ── Product Grid: 2 columns on mobile, 4 columns on desktop ── */}
                <CatalogGridWrapper count={8}>
                  {products.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px] sm:gap-4 md:gap-5">
                        {products.map((product, idx) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            index={idx}
                            priority={idx < 4}
                          />
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      <Suspense>
                        <PaginationControls
                          currentPage={currentPage}
                          totalPages={totalPages}
                        />
                      </Suspense>
                    </>
                  ) : (
                    /* ── Empty State View ── */
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-2">
                      <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-5 text-[#e11d48] shadow-xs">
                        <Package2 size={38} strokeWidth={1.5} />
                      </div>
                      <h2 className="text-xl font-bold text-[#1e293b] mb-2">
                        Nu am găsit produse pentru filtrele selectate în categoria {categoryName}
                      </h2>
                      <p className="text-slate-500 text-[14px] max-w-md leading-relaxed mb-6">
                        Încearcă să resetezi sau să modifici criteriile de filtrare pentru a descoperi ofertele disponibile.
                      </p>
                      <Link
                        href={SEOManager.buildCategoryUrl(categorySlug)}
                        className="inline-flex items-center gap-2 bg-[#0a6c74] hover:bg-[#08565c] text-white font-semibold text-[13px] px-6 py-2.5 rounded-full transition-colors shadow-sm"
                      >
                        <RotateCcw size={15} />
                        <span>Resetează filtrele din {categoryName}</span>
                      </Link>
                    </div>
                  )}
                </CatalogGridWrapper>
              </div>
            </div>
          </CatalogLoadingProvider>

          {/* ── Popular Searches / Faceted Links (Internal Linking) ── */}
          <PopularSearches categorySlug={categorySlug} categoryName={categoryName} />

          {/* ── Category SEO Buying Guide Block (eMAG & Trendyol Standard) ── */}
          <CategorySeoGuide
            categorySlug={categorySlug}
            categoryName={categoryName}
            minPrice={details.minPrice}
            total={total}
            brands={details.topBrands}
          />
        </div>
      </main>
    </>
  );
}
