import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Store,
  BadgeCheck,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Clock,
  Package2,
  Calendar,
} from 'lucide-react';
import {
  getCatalogProducts,
  getCatalogCategories,
  getAvailableSizes,
  getVendorDetails,
} from '@/lib/products';
import { SEOManager } from '@/lib/seo';
import ProductCard from '@/components/products/ProductCard';
import SortBar from '@/components/catalog/SortBar';
import PaginationControls from '@/components/catalog/PaginationControls';

export const dynamic = 'force-dynamic';

interface SellerPageProps {
  params: Promise<{ vendorSlug: string }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

const PAGE_SIZE = 16;

// ── Dynamic SEO & OpenGraph Metadata (eMAG.ro Standard) ───────
export async function generateMetadata({
  params,
  searchParams,
}: SellerPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const vendorSlug = resolvedParams.vendorSlug;
  const currentPage = Math.max(1, Number(resolvedQuery?.page ?? '1'));

  const { vendor, totalProducts } = await getVendorDetails(vendorSlug);

  const vendorName = vendor?.storeName || vendorSlug.replace(/-/g, ' ').toUpperCase();

  return SEOManager.getSellerMetadata({
    vendorName,
    vendorSlug,
    rating: vendor?.rating || 4.8,
    productsCount: totalProducts,
    logo: vendor?.logo,
    page: currentPage,
  });
}

// ── eMAG-Style Seller Page: /seller/{vendorSlug}/v ─────────────
export default async function EmagSellerPage({
  params,
  searchParams,
}: SellerPageProps) {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  const vendorSlug = resolvedParams.vendorSlug;
  const currentPage = Math.max(1, Number(resolvedQuery?.page ?? '1'));
  const sort = (resolvedQuery?.sort ?? 'newest') as any;

  // Preluare detalii vendor & produse în paralel
  const [{ vendor, totalProducts }, catalogResult] = await Promise.all([
    getVendorDetails(vendorSlug),
    getCatalogProducts({
      vendor: vendorSlug,
      minPrice: resolvedQuery?.minPrice ? Number(resolvedQuery.minPrice) : undefined,
      maxPrice: resolvedQuery?.maxPrice ? Number(resolvedQuery.maxPrice) : undefined,
      sort,
      page: currentPage,
    }),
  ]);

  if (!vendor && catalogResult.products.length === 0) {
    notFound();
  }

  const vendorName = vendor?.storeName || vendorSlug.replace(/-/g, ' ');
  const rating = vendor?.rating || 4.8;
  const isVerified = vendor?.isVerified ?? true;
  const description =
    vendor?.description ||
    `Magazin partener oficial verificat pe platforma TOPinStock România. Garanția este oferită de către furnizor conform website-ului acestuia.`;

  const { products, total, totalPages } = catalogResult;

  // Schema.org JSON-LD Structured Data for Googlebot & Rich Snippets
  const breadcrumbJsonLd = SEOManager.getBreadcrumbsJsonLd([
    { name: 'Acasă', url: '/' },
    { name: 'Magazine Partenere', url: '/produse' },
    { name: vendorName, url: SEOManager.buildSellerUrl(vendorSlug) },
  ]);

  const sellerJsonLd = SEOManager.getSellerJsonLd({
    vendorName,
    vendorSlug,
    description,
    rating,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sellerJsonLd) }}
      />

      <main className="min-h-screen bg-gray-50 pb-16">
        {/* ── Breadcrumb ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-app py-3">
            <nav className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
              <Link href="/" className="hover:text-blue-900 transition-colors">
                Acasă
              </Link>
              <span>/</span>
              <Link href="/produse" className="hover:text-blue-900 transition-colors">
                Vânzători
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-semibold">{vendorName}</span>
            </nav>
          </div>
        </div>

        {/* ── Seller Header Card (eMAG / Trendyol Vendor Storefront) ── */}
        <div className="container-app py-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Vendor Info + Avatar */}
              <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-900 to-[#008fa8] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md flex-shrink-0">
                  <Store size={36} />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Single Clean <h1> matching eMAG SEO Title */}
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      {vendorName}
                    </h1>

                    {isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                        <BadgeCheck size={14} />
                        <span>Partener Verificat</span>
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                    {description}
                  </p>

                  {/* Rating & Stats */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                      <Star size={14} fill="currentColor" />
                      <span>{rating.toFixed(1)} / 5.0</span>
                      <span className="text-gray-400 font-normal ml-0.5">(recenzii clienți)</span>
                    </div>

                    <div className="text-gray-600 font-medium bg-gray-100 px-2.5 py-1 rounded-lg">
                      <span className="font-bold text-gray-900">{total}</span> produse listate
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100/80 md:w-80 flex-shrink-0 text-[11px]">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Livrare Rapidă</p>
                    <p className="text-gray-500 text-[10px]">DPD &amp; Fan Courier</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">30 Zile Retur</p>
                    <p className="text-gray-500 text-[10px]">Retur gratuit</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Verificare Colet</p>
                    <p className="text-gray-500 text-[10px]">La livrare</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Livrare 2-3 zile</p>
                    <p className="text-gray-500 text-[10px]">Curier rapid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Products List by this Seller ── */}
        <div className="container-app">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Oferte de la {vendorName} ({total})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Toate produsele vândute și expediate direct de către acest partener.
            </p>
          </div>

          {/* Sort Bar */}
          <Suspense>
            <SortBar
              currentSort={sort}
              total={total}
              currentPage={currentPage}
              perPage={PAGE_SIZE}
            />
          </Suspense>

          {/* ── Products Grid ── */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px] sm:gap-4 md:gap-5 mt-4">
                {products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
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
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
              <Package2 size={40} className="text-gray-400 mb-3" />
              <h3 className="text-lg font-bold text-gray-900">
                Momentan nu sunt produse disponibile
              </h3>
              <p className="text-gray-500 text-xs max-w-md mt-1 mb-4">
                Acest vânzător își actualizează stocul. Te rugăm să revii în curând sau să explorezi celelalte oferte din marketplace.
              </p>
              <Link
                href="/produse"
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Vezi toate produsele
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
