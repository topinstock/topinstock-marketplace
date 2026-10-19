import Link from 'next/link';
import { Zap, ArrowRight, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDbProduct } from '@/lib/products';
import ProductCard from '@/components/products/ProductCard';

const APPLIANCE_CATEGORY_SLUGS = [
  'calorifere-tip-panou',
  'ventilator',
  'electrocasnice',
  'aspirator-vertical',
  'mixer-si-set-de-mixere',
  'blender-si-set-de-blender',
  'fierbator-de-apa-si-ceainic',
  'masini-de-tocat-carne',
  'rasnite-de-cafea-si-condimente',
  'prajitor-de-paine',
  'aparate-de-gatit',
  'fiare-de-calcat',
  'aspiratoare',
];

// In-memory cache for instant 0ms responses on homepage
let cachedApplianceProducts: any[] | null = null;
let lastApplianceFetch = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function getTopAppliances() {
  if (cachedApplianceProducts && Date.now() - lastApplianceFetch < CACHE_TTL_MS) {
    return cachedApplianceProducts;
  }

  try {
    const rawProducts = await prisma.product.findMany({
      where: {
        isPublished: true,
        category: {
          slug: { in: APPLIANCE_CATEGORY_SLUGS },
        },
      },
      take: 8,
      orderBy: { stock: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        originalPrice: true,
        discountPercentage: true,
        stock: true,
        sku: true,
        images: true,
        sizes: true,
        colors: true,
        attributes: true,
        rating: true,
        reviewsCount: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        vendor: { select: { id: true, storeName: true, slug: true, isVerified: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    const formatted = rawProducts.map(formatDbProduct);
    if (formatted.length > 0) {
      cachedApplianceProducts = formatted;
      lastApplianceFetch = Date.now();
      return formatted;
    }
  } catch (err) {
    console.error('Error loading top appliances:', err);
  }

  return cachedApplianceProducts || [];
}

export default async function TopAppliancesSection() {
  const products = await getTopAppliances();

  if (products.length === 0) return null;

  return (
    <section className="container-app py-8">
      {/* ── Section Container Card with Electric / Modern Theme ── */}
      <div className="bg-gradient-to-b from-sky-50/70 via-white to-white rounded-3xl p-5 sm:p-8 border border-sky-100 shadow-[0_4px_24px_rgba(0,143,168,0.06)]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7 pb-6 border-b border-sky-100/80">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#004f61] to-[#008fa8] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Zap size={13} className="text-[#29DCFA] fill-[#29DCFA]" />
              <span>Electrocasnice de Top Acum</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Aparate Electrocasnice &amp; Confort Casnic
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Soluții eficiente pentru încălzire, preparare rapidă și curățenie în casă. Garanția este oferită de către furnizor conform website-ului acestuia.
            </p>
          </div>

          {/* Quick Category Link */}
          <Link
            href="/electrocasnice/c"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#008fa8] to-[#005c6e] hover:from-[#005c6e] hover:to-[#004f61] px-5 py-2.5 rounded-full shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shrink-0"
          >
            <span>Vezi toate electrocasnicele</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Value Highlights Pill Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-3 bg-white/80 rounded-2xl border border-sky-100/60 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2 px-3 py-1">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Consum energetic optimizat &amp; eficiență</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1">
            <ShieldCheck size={16} className="text-[#008fa8] shrink-0" />
            <span>Garanție oferită de către furnizor</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1">
            <Truck size={16} className="text-amber-500 shrink-0" />
            <span>Expediere în 2-3 zile prin curier rapid</span>
          </div>
        </div>

        {/* Product Grid (4 columns) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
