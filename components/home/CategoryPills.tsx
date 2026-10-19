'use client';

import Link from 'next/link';
import {
  ChevronRight,
  UtensilsCrossed,
  Tv,
  Baby,
  Backpack,
  Flame,
  Home,
  Sparkles,
  Shirt,
  HeartHandshake,
  Layers,
  Bike,
} from 'lucide-react';

interface CategoryItemData {
  label: string;
  count: string;
  href: string;
  icon: any;
  gradient: string;
  badge?: string;
}

const CATEGORY_ITEMS: CategoryItemData[] = [
  {
    label: 'Oale & Inox',
    count: '57 produse',
    href: '/oale/c',
    icon: UtensilsCrossed,
    gradient: 'from-amber-500/15 to-orange-500/20 text-amber-700',
    badge: 'TOP',
  },
  {
    label: 'Electrocasnice',
    count: '42 produse',
    href: '/electrocasnice/c',
    icon: Tv,
    gradient: 'from-cyan-500/15 to-teal-500/20 text-[#006b80]',
    badge: 'POPULAR',
  },
  {
    label: 'Încălzire & Confort',
    count: '38 produse',
    href: '/calorifere-tip-panou/c',
    icon: Flame,
    gradient: 'from-orange-500/15 to-amber-500/20 text-orange-700',
    badge: 'IARNĂ',
  },
  {
    label: 'Jucării & Copii',
    count: '34 produse',
    href: '/copii-jucarii/c',
    icon: Baby,
    gradient: 'from-blue-500/15 to-indigo-500/20 text-blue-700',
  },
  {
    label: 'Rucsacuri & Genți',
    count: '38 produse',
    href: '/genti-accesorii/c',
    icon: Backpack,
    gradient: 'from-purple-500/15 to-violet-500/20 text-purple-700',
    badge: 'DESIGUAL',
  },
  {
    label: 'Casă & Decorațiuni',
    count: '65 produse',
    href: '/casa-decoratiuni/c',
    icon: Home,
    gradient: 'from-emerald-500/15 to-teal-500/20 text-emerald-700',
  },
  {
    label: 'Instalații Crăciun',
    count: '48 produse',
    href: '/turturi-franjuri/c',
    icon: Sparkles,
    gradient: 'from-rose-500/15 to-red-500/20 text-rose-700',
    badge: 'FESTIV',
  },
  {
    label: 'Veselă & Porțelan',
    count: '30 produse',
    href: '/seturi-vesela/c',
    icon: Layers,
    gradient: 'from-sky-500/15 to-blue-500/20 text-sky-700',
  },
  {
    label: 'Modă & Încălțăminte',
    count: '45 produse',
    href: '/moda-incaltaminte/c',
    icon: Shirt,
    gradient: 'from-pink-500/15 to-rose-500/20 text-pink-700',
  },
];

export default function CategoryPills() {
  return (
    <section className="container-app py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-[#F5436A]">❖</span> Categorii Populare
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Navighează rapid prin departamentele magazinului TOPinStock
          </p>
        </div>

        <Link
          href="/produse"
          className="text-xs sm:text-sm font-bold text-[#008fa8] hover:text-[#C03653] flex items-center gap-1 transition-colors group"
        >
          <span>Toate cele 395 de produse</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-3">
        {CATEGORY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group relative flex flex-col items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-[#00AEC7]/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-marketplace-hover transition-all duration-300 hover:-translate-y-1.5 text-center min-h-[120px]"
            >
              {/* Badge if present */}
              {item.badge && (
                <span className="absolute -top-1.5 right-2 bg-gradient-to-r from-red-600 to-[#F5436A] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs">
                  {item.badge}
                </span>
              )}

              {/* Icon Container */}
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs mb-2`}
              >
                <Icon size={22} strokeWidth={2} />
              </div>

              {/* Label & Count */}
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#008fa8] line-clamp-1 transition-colors block">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  {item.count}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
