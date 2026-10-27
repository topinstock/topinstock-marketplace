'use client';

import Link from 'next/link';
import { Award, ChevronRight } from 'lucide-react';

interface Brand {
  name: string;
  category: string;
  productsCount: string;
  href: string;
}

const BRANDS: Brand[] = [
  {
    name: 'Grünberg',
    category: 'Veselă & Oale Inox',
    productsCount: '80+ produse',
    href: '/produse?search=grunberg',
  },
  {
    name: 'Victronic',
    category: 'Electrocasnice & Încălzire',
    productsCount: '50+ produse',
    href: '/produse?search=victronic',
  },
  {
    name: 'TOPinStock',
    category: 'Seturi Oale & Tăvi',
    productsCount: '150+ produse',
    href: '/produse?search=topinstock',
  },
  {
    name: 'Desigual',
    category: 'Rucsacuri & Genți Urbane',
    productsCount: '25+ produse',
    href: '/produse?category=genti-accesorii',
  },
  {
    name: 'Berlinger Haus',
    category: 'Tigăi Non-Stick & Grill',
    productsCount: '30+ produse',
    href: '/produse?category=tigai',
  },
  {
    name: 'Royalty Line',
    category: 'Cuțite & Ustensile Bucătărie',
    productsCount: '20+ produse',
    href: '/produse?category=bucatarie-menaj',
  },
];

export default function TopBrandsSection() {
  return (
    <section className="container-app py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Branduri de Încredere
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Produse originale de la producători consacrați, cu livrare direct din stoc
          </p>
        </div>

        <Link
          href="/produse"
          className="text-sm sm:text-base font-bold text-[#0a6c74] hover:text-[#C03653] flex items-center gap-1.5 transition-colors group"
        >
          <span>Vezi toate brandurile</span>
          <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={brand.href}
            className="group flex flex-col justify-between p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-[#0a6c74]/50 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(10,108,116,0.1)] transition-all duration-300 hover:-translate-y-1 text-center"
          >
            <div className="my-1">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-[#0a6c74] transition-colors tracking-tight block">
                {brand.name}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium block mt-1 line-clamp-1">
                {brand.category}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-center text-xs font-semibold text-slate-400 mt-3">
              <span>{brand.productsCount}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
