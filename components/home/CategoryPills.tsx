'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface CategoryItemData {
  label: string;
  count: string;
  href: string;
  image: string;
}

// Cele 6 categorii principale cu stocuri mari, verificate direct în catalog
const CATEGORY_ITEMS: CategoryItemData[] = [
  {
    label: 'Instalații Crăciun',
    count: '1.300+ produse',
    href: '/turturi-franjuri/c',
    image: '/images/promo_christmas_lights.jpg',
  },
  {
    label: 'Telefoane & GSM',
    count: '400+ produse',
    href: '/gsm-si-gadgets/c',
    image: '/images/product_headphones.jpg',
  },
  {
    label: 'Oale & Inox',
    count: '160+ produse',
    href: '/oale/c',
    image: '/images/promo_cookware.jpg',
  },
  {
    label: 'Electrocasnice',
    count: '120+ produse',
    href: '/electrocasnice/c',
    image: '/images/promo_coffee.jpg',
  },
  {
    label: 'Jucării & Copii',
    count: '80+ produse',
    href: '/copii-jucarii/c',
    image: '/images/promo_toys.jpg',
  },
  {
    label: 'Casă & Decorațiuni',
    count: '50+ produse',
    href: '/casa-decoratiuni/c',
    image: '/images/cat_casa_decor.jpg',
  },
];

export default function CategoryPills() {
  return (
    <section className="container-app py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Categorii Populare
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Găsește rapid produsele căutate, organizate clar pe departamente
          </p>
        </div>

        <Link
          href="/produse"
          className="text-sm sm:text-base font-bold text-[#0a6c74] hover:text-[#C03653] flex items-center gap-1.5 transition-colors group w-fit pb-1"
        >
          <span>Vezi toate produsele</span>
          <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid of 6 Top Categories — Large Images, Clean Typography */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {CATEGORY_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex flex-col items-center justify-between p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 hover:border-[#0a6c74]/50 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(10,108,116,0.12)] transition-all duration-300 hover:-translate-y-1.5 text-center"
          >
            {/* Enlarged Photo Container */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner mb-4 transition-transform duration-300 group-hover:scale-105 shrink-0">
              <Image
                src={item.image}
                alt={item.label}
                fill
                sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 144px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Label & Clean Product Count */}
            <div className="w-full">
              <h3 className="text-sm sm:text-base lg:text-[17px] font-bold text-slate-900 group-hover:text-[#0a6c74] transition-colors leading-snug line-clamp-1">
                {item.label}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                {item.count}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
