import { Suspense } from 'react';
import Link from 'next/link';
import { Package2, RotateCcw, ShieldCheck, Truck, RotateCw } from 'lucide-react';
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
import CategorySeoGuide from '@/components/seo/CategorySeoGuide';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 16;

export interface FacetedCategoryViewProps {
  categorySlug: string;
  brandSlug?: string | null;
  attributeSlug?: string | null;
  searchParams?: {
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
  };
}

export default async function FacetedCategoryView({
  categorySlug,
  brandSlug,
  attributeSlug,
  searchParams,
}: FacetedCategoryViewProps) {
  const currentPage = Math.max(1, Number(searchParams?.page ?? '1'));
  const sort = (searchParams?.sort ?? 'newest') as any;

  // Resolvare nume Brand și Atribut
  const brandName = brandSlug ? SEOManager.parseBrandSlug(brandSlug) : searchParams?.brand;
  const parsedAttr = attributeSlug ? SEOManager.parseAttributeSlug(attributeSlug) : null;
  const attributeValue = parsedAttr?.value || searchParams?.sizes;
  const attributeDisplayName = parsedAttr?.displayName;

  // Preluare catalog și detalii în paralel
  const [catalogResult, categories, availableSizes, details, facetCounts] = await Promise.all([
    getCatalogProducts({
      category: categorySlug,
      brand: brandName,
      attribute: [attributeValue, searchParams?.attribute].filter(Boolean).join(',') || undefined,
      color: searchParams?.color,
      search: searchParams?.search,
      inStock: searchParams?.inStock === 'true',
      onSale: searchParams?.onSale === 'true',
      minPrice: searchParams?.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined,
      sizes: searchParams?.sizes?.split(',').filter(Boolean) ?? [],
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

  // ── H1 Dinamic eMAG ──────────────────────────────────────────
  // "{Nume Categorie} {Brand} {Valoare Atribut}"
  const h1Title = SEOManager.composeFacetedH1({
    categoryName,
    brandName,
    attributeDisplayName,
  });

  // Breadcrumbs schema & UI
  const breadcrumbItems: { name: string; url: string }[] = [
    { name: 'Acasă', url: '/' },
    { name: 'Produse', url: '/produse' },
    { name: categoryName, url: SEOManager.buildCategoryUrl(categorySlug) },
  ];

  if (brandSlug && brandName) {
    breadcrumbItems.push({
      name: brandName,
      url: SEOManager.buildFacetedCategoryUrl({ categorySlug, brandSlug }),
    });
  }

  if (attributeSlug && attributeDisplayName) {
    breadcrumbItems.push({
      name: attributeDisplayName,
      url: SEOManager.buildFacetedCategoryUrl({ categorySlug, brandSlug, attributeSlug }),
    });
  }

  const breadcrumbJsonLd = SEOManager.getBreadcrumbsJsonLd(breadcrumbItems);
  const categoryJsonLd = SEOManager.getCategoryJsonLd({
    categoryName: h1Title,
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
              {breadcrumbItems.map((item, idx) => (
                <span key={item.url} className="flex items-center gap-1.5">
                  {idx > 0 && <span>/</span>}
                  {idx === breadcrumbItems.length - 1 ? (
                    <span className="text-white font-semibold">{item.name}</span>
                  ) : (
                    <Link href={item.url} className="hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            {/* Single Clean <h1> matching eMAG SEO Title */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  {h1Title}
                </h1>
                <p className="text-white/85 text-[13px] sm:text-[14px] mt-1.5 font-medium max-w-3xl leading-relaxed">
                  Alege din <span className="font-bold text-white">{total}</span> oferte disponibile.
                  Livrare rapidă prin curier direct la adresă (DPD, Fan Courier), deschiderea coletului la livrare și 30 de zile drept de retur.
                </p>
              </div>

              {/* Trust Micro-badges */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-white/90">
                <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                  <Truck size={14} className="text-emerald-300" />
                  <span>Curier DPD &amp; Fan Courier</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                  <RotateCw size={14} className="text-amber-300" />
                  <span>Retur 30 zile</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                  <ShieldCheck size={14} className="text-cyan-300" />
                  <span>Verificare colet</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Catalog Content Area ── */}
        <div className="container-app py-6">
          <CatalogLoadingProvider>
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start" style={{ alignItems: 'flex-start' }}>
              {/* ── Left Sidebar Filter ── */}
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
                  currentFilters={{
                    ...searchParams,
                    category: categorySlug,
                    brand: brandName || searchParams?.brand,
                    brandSlug,
                    attributeSlug,
                  }}
                  totalResults={total}
                  facetCounts={facetCounts}
                />
              </Suspense>

              {/* ── Products Content Area ── */}
              <div className="flex-1 min-w-0 w-full">
                {/* Active filters chips */}
                <Suspense>
                  <ActiveFilters
                    filters={{
                      ...searchParams,
                      category: categorySlug,
                      brand: brandName || searchParams?.brand,
                      brandSlug,
                      attributeSlug,
                    }}
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
                        Nu am găsit produse pentru filtrele selectate ({h1Title})
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
