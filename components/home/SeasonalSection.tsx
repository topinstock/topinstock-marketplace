import Link from 'next/link';
import {
  Sparkles,
  ChefHat,
  Gift,
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import type { SeasonalSectionConfig } from '@/lib/seasonal';

interface SeasonalSectionProps {
  section: SeasonalSectionConfig;
}

export default function SeasonalSection({ section }: SeasonalSectionProps) {
  const {
    id,
    badgeText,
    badgeTheme,
    title,
    subtitle,
    ctaText,
    ctaHref,
    highlight1,
    products,
  } = section;

  if (!products || products.length === 0) return null;

  // Theme-specific styling tokens
  const themeStyles = {
    festive: {
      card: 'bg-gradient-to-b from-rose-50/70 via-white to-white rounded-3xl p-5 sm:p-8 border border-rose-100 shadow-[0_4px_24px_rgba(225,29,72,0.06)]',
      headerBorder: 'border-rose-100/80',
      badge: 'bg-gradient-to-r from-red-600 to-rose-700 text-white',
      badgeIcon: <Sparkles size={13} className="text-amber-300 fill-amber-300" />,
      button:
        'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 shadow-md',
      pillBg: 'border-rose-100/60',
    },
    kitchen: {
      card: 'bg-gradient-to-b from-amber-50/60 via-white to-white rounded-3xl p-5 sm:p-8 border border-amber-200/70 shadow-[0_4px_24px_rgba(217,119,6,0.06)]',
      headerBorder: 'border-amber-100',
      badge: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white',
      badgeIcon: <ChefHat size={13} className="text-amber-200" />,
      button:
        'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 shadow-md',
      pillBg: 'border-amber-100/60',
    },
    toys: {
      card: 'bg-gradient-to-b from-purple-50/60 via-white to-white rounded-3xl p-5 sm:p-8 border border-purple-100 shadow-[0_4px_24px_rgba(147,51,234,0.06)]',
      headerBorder: 'border-purple-100',
      badge: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
      badgeIcon: <Gift size={13} className="text-purple-200" />,
      button:
        'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-md',
      pillBg: 'border-purple-100/60',
    },
    comfort: {
      card: 'bg-gradient-to-b from-sky-50/70 via-white to-white rounded-3xl p-5 sm:p-8 border border-sky-100 shadow-[0_4px_24px_rgba(0,143,168,0.06)]',
      headerBorder: 'border-sky-100/80',
      badge: 'bg-gradient-to-r from-[#004f61] to-[#008fa8] text-white',
      badgeIcon: <Zap size={13} className="text-[#29DCFA] fill-[#29DCFA]" />,
      button:
        'bg-gradient-to-r from-[#008fa8] to-[#005c6e] hover:from-[#005c6e] hover:to-[#004f61] shadow-md',
      pillBg: 'border-sky-100/60',
    },
  }[badgeTheme];

  return (
    <section id={id} className="container-app py-8">
      {/* ── Section Container Card ── */}
      <div className={themeStyles.card}>
        {/* Section Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7 pb-6 border-b ${themeStyles.headerBorder}`}
        >
          <div className="space-y-2 max-w-2xl">
            <div
              className={`inline-flex items-center gap-1.5 ${themeStyles.badge} text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm`}
            >
              {themeStyles.badgeIcon}
              <span>{badgeText}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{subtitle}</p>
          </div>

          {/* Quick Category Link */}
          <Link
            href={ctaHref}
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white ${themeStyles.button} px-5 py-2.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shrink-0`}
          >
            <span>{ctaText}</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Value Highlights Pill Strip */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-3 bg-white/80 rounded-2xl border ${themeStyles.pillBg} text-xs font-semibold text-slate-700`}
        >
          <div className="flex items-center gap-2 px-3 py-1">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{highlight1}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1">
            <ShieldCheck size={16} className="text-[#008fa8] shrink-0" />
            <span>Garanție oferită conform furnizorului</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1">
            <Truck size={16} className="text-amber-500 shrink-0" />
            <span>Expediere în 2-3 zile prin curier rapid</span>
          </div>
        </div>

        {/* Product Grid (4 columns responsive) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
