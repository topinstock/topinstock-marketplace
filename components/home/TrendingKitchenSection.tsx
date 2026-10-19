import Link from 'next/link';
import { Flame, ArrowRight, ShieldCheck, Truck, ChefHat } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDbProduct } from '@/lib/products';
import ProductCard from '@/components/products/ProductCard';

const KITCHEN_CATEGORY_SLUGS = [
  'oale',
  'tigai',
  'seturi-vesela',
  'cutit-si-set-de-cutite',
  'bucatarie-menaj',
  'materiale-pentru-gatit-si-servire',
  'oale-sub-presiune',
  'seturi-de-tacamuri',
  'caserole-pentru-mancare',
  'termos',
  'tocatoare',
  'cratite',
  'tavi-si-forme-copt',
  'pahare-si-cani',
  'vesela-pentru-gatit',
];

// In-memory cache for instant 0ms responses on homepage
let cachedKitchenProducts: any[] | null = null;
let lastKitchenFetch = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function getKitchenProducts() {
  if (cachedKitchenProducts && Date.now() - lastKitchenFetch < CACHE_TTL_MS) {
    return cachedKitchenProducts;
  }

  try {
    const rawProducts = await prisma.product.findMany({
      where: {
        isPublished: true,
        category: {
          slug: { in: KITCHEN_CATEGORY_SLUGS },
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
      cachedKitchenProducts = formatted;
      lastKitchenFetch = Date.now();
      return formatted;
    }
  } catch (err) {
    console.error('Error loading trending kitchen products:', err);
  }

  return cachedKitchenProducts || [];
}

export default async function TrendingKitchenSection() {
  const products = await getKitchenProducts();

  if (products.length === 0) return null;

  return (
    <section className="container-app py-8">
      {/* ── Section Container Card with Warm Gourmet / Culinary Theme ── */}
      <div className="bg-gradient-to-b from-amber-50/60 via-white to-white rounded-3xl p-5 sm:p-8 border border-amber-200/70 shadow-[0_4px_24px_rgba(217,119,6,0.06)]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7 pb-6 border-b border-amber-100">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Flame size={13} className="text-amber-200 fill-amber-200" />
              <span>Produse Hot în Tendințe</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Bucătărie &amp; Gătit: Seturi Profesionale de Top
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Seturi complete de oale din inox alimentar, tigăi antiaderente din piatră granit și cuțite profesionale pentru gătit sănătos și durabil.
            </p>
          </div>

          {/* Quick Category Link */}
          <Link
            href="/bucatarie-menaj/c"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 px-5 py-2.5 rounded-full shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shrink-0"
          >
            <span>Vezi articole de bucătărie</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Value Highlights Pill Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-3 bg-white/80 rounded-2xl border border-amber-100/70 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2 px-3 py-1">
            <ChefHat size={16} className="text-amber-600 shrink-0" />
            <span>Inox 18/10 alimentar &amp; acoperire granit</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Compatibile inducție, gaz &amp; vitroceramic</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1">
            <Truck size={16} className="text-rose-600 shrink-0" />
            <span>Ambalare protejată &amp; livrare directă</span>
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
