'use client';

import Link from 'next/link';
import { Award, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Brand {
  name: string;
  category: string;
  productsCount: string;
  href: string;
  rating: string;
  tag: string;
}

const BRANDS: Brand[] = [
  {
    name: 'Grünberg',
    category: 'Veselă & Oale Inox',
    productsCount: '80+ produse',
    href: '/produse?search=grunberg',
    rating: '4.9 ★',
    tag: 'CALITATE GERMANĂ',
  },
  {
    name: 'Victronic',
    category: 'Electrocasnice & Încălzire',
    productsCount: '50+ produse',
    href: '/produse?search=victronic',
    rating: '4.8 ★',
    tag: 'OFICIAL TOPINSTOCK',
  },
  {
    name: 'Bohmann',
    category: 'Seturi Oale & Tăvi',
    productsCount: '40+ produse',
    href: '/produse?search=bohmann',
    rating: '4.9 ★',
    tag: 'INOX MULTISTRAT',
  },
  {
    name: 'Desigual',
    category: 'Rucsacuri & Genți Urbane',
    productsCount: '25+ produse',
    href: '/produse?category=genti-accesorii',
    rating: '4.8 ★',
    tag: 'FASHION & DESIGN',
  },
  {
    name: 'Berlinger Haus',
    category: 'Tigăi Non-Stick & Grill',
    productsCount: '30+ produse',
    href: '/produse?category=tigai',
    rating: '4.9 ★',
    tag: 'INDUCȚIE TURBO',
  },
  {
    name: 'Royalty Line',
    category: 'Cuțite & Ustensile Bucătărie',
    productsCount: '20+ produse',
    href: '/produse?category=bucatarie-menaj',
    rating: '4.7 ★',
    tag: 'PREMIUM QUALITY',
  },
];

export default function TopBrandsSection() {
  return (
    <section className="container-app py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#004f61] to-[#008fa8] text-white flex items-center justify-center shadow-xs">
              <Award size={18} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Branduri Oficiale & Producători de Top
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Descoperă gamele de produse de la producători consacrați, cu garanție oferită de furnizor
          </p>
        </div>

        <Link
          href="/produse"
          className="text-xs sm:text-sm font-bold text-[#008fa8] hover:text-[#C03653] flex items-center gap-1 transition-colors group"
        >
          <span>Vezi toate brandurile</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={brand.href}
            className="group relative flex flex-col justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#008fa8]/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-marketplace-hover transition-all duration-300 hover:-translate-y-1 text-center"
          >
            {/* Tag */}
            <span className="text-[9px] font-black text-[#008fa8] uppercase tracking-wider bg-cyan-50 px-2 py-0.5 rounded-full self-center mb-2">
              {brand.tag}
            </span>

            {/* Brand Logo Display */}
            <div className="my-2">
              <span className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#008fa8] transition-colors tracking-tight block">
                {brand.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5 line-clamp-1">
                {brand.category}
              </span>
            </div>

            {/* Micro stats */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600 mt-2">
              <span className="text-amber-500">{brand.rating}</span>
              <span className="text-slate-400 font-normal">{brand.productsCount}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
