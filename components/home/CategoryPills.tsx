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

const CATEGORY_ITEMS: CategoryItemData[] = [
  {
    label: 'Oale & Inox',
    count: '2.400+ produse',
    href: '/oale/c',
    image: '/images/promo_cookware.jpg',
    badge: 'TOP',
  },
  {
    label: 'Electrocasnice',
    count: '1.200+ produse',
    href: '/electrocasnice/c',
    image: '/images/promo_coffee.jpg',
    badge: 'POPULAR',
  },
  {
    label: 'Încălzire & Confort',
    count: '1.500+ produse',
    href: '/calorifere-tip-panou/c',
    image: '/images/promo_heater.jpg',
    badge: 'IARNĂ',
  },
  {
    label: 'Jucării & Copii',
    count: '1.800+ produse',
    href: '/copii-jucarii/c',
    image: '/images/promo_toys.jpg',
  },
  {
    label: 'Rucsacuri & Genți',
    count: '2.100+ produse',
    href: '/genti-accesorii/c',
    image: '/images/cat_genti_rucsacuri.jpg',
    badge: 'DESIGUAL',
  },
  {
    label: 'Casă & Decor',
    count: '3.800+ produse',
    href: '/casa-decoratiuni/c',
    image: '/images/cat_casa_decor.jpg',
  },
  {
    label: 'Instalații Crăciun',
    count: '1.900+ produse',
    href: '/turturi-franjuri/c',
    image: '/images/promo_christmas_lights.jpg',
    badge: 'FESTIV',
  },
  {
    label: 'Veselă & Porțelan',
    count: '1.100+ produse',
    href: '/seturi-vesela/c',
    image: '/images/cat_vesela_portelan.jpg',
  },
  {
    label: 'Modă & Pantofi',
    count: '2.500+ produse',
    href: '/moda-incaltaminte/c',
    image: '/images/product_sneakers.jpg',
  },
  {
    label: 'Telefoane & GSM',
    count: '3.300+ produse',
    href: '/gsm-si-gadgets/c',
    image: '/images/product_headphones.jpg',
    badge: 'HOT',
  },
  {
    label: 'Sport & Fitness',
    count: '1.400+ produse',
    href: '/sport-timp-liber/c',
    image: '/images/promo_bike.jpg',
  },
  {
    label: 'IT & Laptopuri',
    count: '1.600+ produse',
    href: '/laptopuri-accesorii/c',
    image: '/images/product_laptop.jpg',
  },
];

export default function CategoryPills() {
  return (
    <section className="container-app py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-[#F5436A]">❖</span> Categorii Populare
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Navighează rapid prin toate departamentele magazinului TOPinStock
          </p>
        </div>

        <Link
          href="/produse"
          className="text-xs sm:text-sm font-bold text-[#0a6c74] hover:text-[#C03653] flex items-center gap-1.5 transition-colors group w-fit"
        >
          <span>Toate cele 28.000+ de produse</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid of Categories with High-Resolution Photos */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2.5 sm:gap-3">
        {CATEGORY_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group relative flex flex-col items-center justify-between p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 hover:border-[#0a6c74]/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-marketplace-hover transition-all duration-300 hover:-translate-y-1.5 text-center min-h-[125px] sm:min-h-[135px]"
          >
            {/* Badge if present */}
            {item.badge && (
              <span className="absolute -top-1.5 right-1.5 bg-gradient-to-r from-red-600 to-[#F5436A] text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs z-10">
                {item.badge}
              </span>
            )}

            {/* Photo Container */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xs mb-2 transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
              <Image
                src={item.image}
                alt={item.label}
                fill
                sizes="(max-width: 640px) 56px, 64px"
                className="object-cover transition-transform duration-500 group-hover:scale-115"
              />
            </div>

            {/* Label & Total Product Count */}
            <div className="w-full">
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-[#0a6c74] line-clamp-1 transition-colors block">
                {item.label}
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-semibold block mt-0.5 whitespace-nowrap">
                {item.count}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
