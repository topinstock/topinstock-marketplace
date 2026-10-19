'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface CategoryItemData {
  label: string;
  count: string;
  href: string;
  image: string;
  badge?: string;
}

// Numerele exacte de produse din fiecare categorie (verificate direct în catalog)
const CATEGORY_ITEMS: CategoryItemData[] = [
  {
    label: 'Instalații Crăciun',
    count: '1.363 produse',
    href: '/turturi-franjuri/c',
    image: '/images/promo_christmas_lights.jpg',
    badge: 'FESTIV',
  },
  {
    label: 'Telefoane & GSM',
    count: '430 produse',
    href: '/gsm-si-gadgets/c',
    image: '/images/product_headphones.jpg',
    badge: 'HOT',
  },
  {
    label: 'Oale & Inox',
    count: '394 produse',
    href: '/oale/c',
    image: '/images/promo_cookware.jpg',
    badge: 'TOP',
  },
  {
    label: 'Electrocasnice',
    count: '108 produse',
    href: '/electrocasnice/c',
    image: '/images/promo_coffee.jpg',
    badge: 'POPULAR',
  },
  {
    label: 'Jucării & Copii',
    count: '78 produse',
    href: '/copii-jucarii/c',
    image: '/images/promo_toys.jpg',
  },
  {
    label: 'Casă & Decorațiuni',
    count: '43 produse',
    href: '/casa-decoratiuni/c',
    image: '/images/cat_casa_decor.jpg',
  },
  {
    label: 'Rucsacuri & Genți',
    count: '30 produse',
    href: '/genti-accesorii/c',
    image: '/images/cat_genti_rucsacuri.jpg',
    badge: 'DESIGUAL',
  },
  {
    label: 'Sport & Fitness',
    count: '18 produse',
    href: '/sport-timp-liber/c',
    image: '/images/promo_bike.jpg',
  },
  {
    label: 'IT & Laptopuri',
    count: '18 produse',
    href: '/laptopuri-accesorii/c',
    image: '/images/product_laptop.jpg',
  },
  {
    label: 'Veselă & Porțelan',
    count: '15 produse',
    href: '/seturi-vesela/c',
    image: '/images/cat_vesela_portelan.jpg',
  },
  {
    label: 'Modă & Pantofi',
    count: '9 produse',
    href: '/moda-incaltaminte/c',
    image: '/images/product_sneakers.jpg',
  },
  {
    label: 'Încălzire & Confort',
    count: '7 produse',
    href: '/calorifere-tip-panou/c',
    image: '/images/promo_heater.jpg',
    badge: 'IARNĂ',
  },
];

export default function CategoryPills() {
  return (
    <section className="container-app py-10 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#F5436A] text-base sm:text-lg">❖</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              Departamente Populare
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explorează Categoriile Magazinului
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Produse organizate atent pe categorii, verificate și gata de livrare rapidă
          </p>
        </div>

        <Link
          href="/produse"
          className="text-xs sm:text-sm font-bold text-[#0a6c74] hover:text-[#C03653] flex items-center gap-1.5 transition-colors group w-fit pb-1"
        >
          <span>Vezi toate cele 3.000+ de produse</span>
          <ChevronRight size={17} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid of Categories — Large, Spacious & High-Definition */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
        {CATEGORY_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group relative flex flex-col items-center justify-between p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 hover:border-[#0a6c74]/50 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(10,108,116,0.12)] transition-all duration-300 hover:-translate-y-2 text-center"
          >
            {/* Badge if present */}
            {item.badge && (
              <span className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-[#F5436A] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs z-10">
                {item.badge}
              </span>
            )}

            {/* Large High-Definition Photo Container */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner mb-3.5 transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
              <Image
                src={item.image}
                alt={item.label}
                fill
                sizes="(max-width: 640px) 96px, (max-width: 1024px) 112px, 128px"
                className="object-cover transition-transform duration-500 group-hover:scale-115"
              />
            </div>

            {/* Label & Exact Live Product Count */}
            <div className="w-full">
              <h3 className="text-[13px] sm:text-[14px] lg:text-[15px] font-extrabold text-slate-800 group-hover:text-[#0a6c74] transition-colors leading-tight line-clamp-1">
                {item.label}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">
                {item.count}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
