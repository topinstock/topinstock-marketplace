import Link from 'next/link';
import {
  Sparkles,
  ChefHat,
  Gift,
  Zap,
  ArrowRight,
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
    products,
  } = section;

  if (!products || products.length === 0) return null;

  // Theme-specific styling tokens
  const themeStyles = {
    festive: {
      card: 'bg-gradient-to-b from-rose-50/60 via-white to-white rounded-3xl p-5 sm:p-8 border border-rose-100 shadow-[0_4px_24px_rgba(225,29,72,0.05)]',
      headerBorder: 'border-rose-100/70',
      badge: 'bg-gradient-to-r from-red-600 to-rose-700 text-white',
      badgeIcon: <Sparkles size={14} className="text-amber-300 fill-amber-300" />,
      button:
        'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 shadow-md',
    },
    kitchen: {
      card: 'bg-gradient-to-b from-amber-50/50 via-white to-white rounded-3xl p-5 sm:p-8 border border-amber-200/60 shadow-[0_4px_24px_rgba(217,119,6,0.05)]',
      headerBorder: 'border-amber-100',
      badge: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white',
      badgeIcon: <ChefHat size={14} className="text-amber-200" />,
      button:
        'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 shadow-md',
    },
    toys: {
      card: 'bg-gradient-to-b from-purple-50/50 via-white to-white rounded-3xl p-5 sm:p-8 border border-purple-100 shadow-[0_4px_24px_rgba(147,51,234,0.05)]',
      headerBorder: 'border-purple-100',
      badge: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
      badgeIcon: <Gift size={14} className="text-purple-200" />,
      button:
        'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-md',
    },
    comfort: {
      card: 'bg-gradient-to-b from-sky-50/60 via-white to-white rounded-3xl p-5 sm:p-8 border border-sky-100 shadow-[0_4px_24px_rgba(0,143,168,0.05)]',
      headerBorder: 'border-sky-100/70',
      badge: 'bg-gradient-to-r from-[#004f61] to-[#008fa8] text-white',
      badgeIcon: <Zap size={14} className="text-[#29DCFA] fill-[#29DCFA]" />,
      button:
        'bg-gradient-to-r from-[#008fa8] to-[#005c6e] hover:from-[#005c6e] hover:to-[#004f61] shadow-md',
    },
  }[badgeTheme];

  return (
    <section id={id} className="container-app py-6 sm:py-8">
      {/* ── Section Container Card ── */}
      <div className={themeStyles.card}>
        {/* Section Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b ${themeStyles.headerBorder}`}
        >
          <div className="space-y-2 max-w-2xl">
            <div
              className={`inline-flex items-center gap-1.5 ${themeStyles.badge} text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs`}
            >
              {themeStyles.badgeIcon}
              <span>{badgeText}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">{subtitle}</p>
          </div>

          {/* Quick Category Link */}
          <Link
            href={ctaHref}
            className={`inline-flex items-center gap-2 text-sm sm:text-base font-bold text-white ${themeStyles.button} px-6 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shrink-0`}
          >
            <span>{ctaText}</span>
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Product Grid (4 columns responsive) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
