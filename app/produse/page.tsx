import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Package2, RotateCcw } from 'lucide-react';
import { getCatalogProducts, getCatalogCategories, getAvailableSizes, getCategoryFacetCounts } from '@/lib/products';
import { SEOManager } from '@/lib/seo';
import FilterSidebar from '@/components/catalog/FilterSidebar';
import ProductCard from '@/components/products/ProductCard';
import SortBar from '@/components/catalog/SortBar';
import PaginationControls from '@/components/catalog/PaginationControls';
import ActiveFilters from '@/components/catalog/ActiveFilters';
import { CatalogLoadingProvider } from '@/components/catalog/CatalogLoadingContext';
import CatalogGridWrapper from '@/components/catalog/CatalogGridWrapper';

// ============================================
//   /produse — Catalog produse (Server Component)
//   - Parsează dynamic URL query parameters:
//     category, minPrice, maxPrice, sizes, sort, page, search
//   - Preluare produse filtrate prin Prisma ORM (cu fallback)
//   - Grilă Trendyol: 2 coloane pe mobil, 4 coloane pe desktop
//   - Empty state conform cerințelor & Paginare
// ============================================

export async function generateMetadata({
  searchParams,
}: ProdusePageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const page = Math.max(1, Number(resolved?.page || '1'));
  const hasFilters = Boolean(
    resolved?.brand ||
    resolved?.minPrice ||
    resolved?.maxPrice ||
    resolved?.sizes ||
    resolved?.sort ||
    resolved?.inStock ||
    resolved?.onSale ||
    resolved?.search
  );

  const canonicalUrl = '/produse';
  const isSearchOrFilter = Boolean(resolved?.search || hasFilters);

  return {
    title: resolved?.search
      ? `Rezultate căutare: "${resolved.search}" — TOPinStock`
      : page > 1
      ? `Toate Produsele — Pagina ${page} | TOPinStock`
      : 'Toate Produsele — Catalog Online | TOPinStock',
    description:
      'Explorează catalogul complet TOPinStock cu zeci de mii de produse originale garantate pe stoc: electrocasnice, casă & bricolaj, bucătărie și modă.',
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isSearchOrFilter
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: 'Toate Produsele — Catalog Online | TOPinStock',
      description: 'Explorează catalogul complet TOPinStock România.',
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export const dynamic = 'force-dynamic';

interface ProdusePageProps {
  searchParams: Promise<{
    category?: string;
    vendor?: string;
    search?: string;
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
  }>;
}

const PAGE_SIZE = 16;

export default async function ProduseListPage({ searchParams }: ProdusePageProps) {
  const resolvedParams = await searchParams;

  // Redirecționare canonică 308 (permanentă) eMAG style pentru categorii individuale
  if (resolvedParams?.category && !resolvedParams?.search && !resolvedParams.category.includes(',')) {
    const paramsCopy = new URLSearchParams();
    Object.entries(resolvedParams).forEach(([k, v]) => {
      if (k !== 'category' && v) paramsCopy.set(k, v);
    });
    const qs = paramsCopy.toString();
    permanentRedirect(`${SEOManager.buildCategoryUrl(resolvedParams.category)}${qs ? `?${qs}` : ''}`);
  }

  // Redirecționare canonică 308 (permanentă) eMAG style pentru vânzători
  if (resolvedParams?.vendor && !resolvedParams?.search) {
    const paramsCopy = new URLSearchParams();
    Object.entries(resolvedParams).forEach(([k, v]) => {
      if (k !== 'vendor' && v) paramsCopy.set(k, v);
    });
    const qs = paramsCopy.toString();
    permanentRedirect(`${SEOManager.buildSellerUrl(resolvedParams.vendor)}${qs ? `?${qs}` : ''}`);
  }

  const currentPage = Math.max(1, Number(resolvedParams?.page ?? '1'));
  const sort = (resolvedParams?.sort ?? 'newest') as any;

  // Fetch all catalog data in parallel
  const [catalogResult, categories, availableSizes, facetCounts] = await Promise.all([
    getCatalogProducts({
      category: resolvedParams?.category,
      vendor: resolvedParams?.vendor,
      search: resolvedParams?.search,
      brand: resolvedParams?.brand,
      inStock: resolvedParams?.inStock === 'true',
      onSale: resolvedParams?.onSale === 'true',
      minPrice: resolvedParams?.minPrice ? Number(resolvedParams.minPrice) : undefined,
      maxPrice: resolvedParams?.maxPrice ? Number(resolvedParams.maxPrice) : undefined,
      sizes: resolvedParams?.sizes?.split(',').filter(Boolean) ?? [],
      color: resolvedParams?.color,
      attribute: resolvedParams?.attribute,
      sort,
      page: currentPage,
    }),
    getCatalogCategories(),
    getAvailableSizes(resolvedParams?.category),
    getCategoryFacetCounts(resolvedParams?.category),
  ]);

  const { products, total, totalPages } = catalogResult;

  const categoryName = resolvedParams?.category
    ? categories.flatMap((c) => [c, ...c.children]).find((c) => c.slug === resolvedParams.category)?.name
    : resolvedParams?.brand
    ? `Brand: ${resolvedParams.brand}`
    : resolvedParams?.onSale === 'true'
    ? 'Oferte Speciale & Reduceri'
    : resolvedParams?.vendor
    ? `Produse vândute de: ${resolvedParams.vendor}`
    : resolvedParams?.search
    ? `Rezultate pentru „${resolvedParams.search}”`
    : undefined;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] pb-12">
      {/* ── Page Header ── */}
      <div className="bg-gradient-to-r from-[#0a6c74] via-[#006b80] to-[#004f61] py-6 text-white shadow-inner">
        <div className="container-app">
          <nav className="text-[12px] text-white/70 mb-2 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Acasă</Link>
            <span>/</span>
            <Link href="/produse" className="hover:text-white transition-colors">Catalog Produse</Link>
            {categoryName && (
              <>
                <span>/</span>
                <span className="text-white font-medium">{categoryName}</span>
              </>
            )}
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {categoryName ? categoryName : 'Toate Produsele'}
              </h1>
              <p className="text-white/80 text-[13px] sm:text-[14px] mt-1 font-medium">
                {total.toLocaleString('ro-RO')} {total === 1 ? 'produs disponibil' : 'produse disponibile'}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                currentFilters={resolvedParams}
                totalResults={total}
                facetCounts={facetCounts}
              />
            </Suspense>

            {/* ── Main Catalog Content Area ── */}
            <div className="flex-1 min-w-0 w-full">
              {/* Active filters chips */}
              <Suspense>
                <ActiveFilters
                  filters={resolvedParams}
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

              {/* ── Product Grid Wrapped with Skeleton Loader & Smooth Scroll ── */}
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
                      Nu am găsit produse pentru filtrele selectate
                    </h2>
                    <p className="text-slate-500 text-[14px] max-w-md leading-relaxed mb-6">
                      Încearcă să resetezi sau să modifici criteriile de filtrare pentru a descoperi mai multe produse din marketplace.
                    </p>
                    <Link
                      href="/produse"
                      className="inline-flex items-center gap-2 bg-[#0a6c74] hover:bg-[#08565c] text-white font-semibold text-[13px] px-6 py-2.5 rounded-full transition-colors shadow-sm"
                    >
                      <RotateCcw size={15} />
                      <span>Resetează filtrele</span>
                    </Link>
                  </div>
                )}
              </CatalogGridWrapper>
            </div>
          </div>
        </CatalogLoadingProvider>
      </div>
    </main>
  );
}
