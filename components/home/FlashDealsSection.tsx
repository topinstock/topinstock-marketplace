'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, Clock, Flame, Sparkles } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { FLASH_PRODUCTS } from '@/lib/data/products';
import type { Product } from '@/types';

export default function FlashDealsSection() {
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (n: number) => n.toString().padStart(2, '0');

  // Adapt mock products
  const products: Product[] = FLASH_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: '',
    price: p.price,
    originalPrice: p.originalPrice,
    images: [p.image],
    status: 'ACTIVE',
    stock: p.stock,
    sellerId: '1',
    seller: {
      id: '1',
      userId: '1',
      storeName: p.sellerName,
      storeSlug: p.sellerName.toLowerCase().replace(/\s+/g, '-'),
      description: null,
      logoUrl: null,
      isVerified: true,
      positiveRating: 98,
      totalSales: 450,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categoryId: '1',
    rating: p.rating,
    reviewCount: p.reviewCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Synthetic stock sold percentages for flash feel
  const soldPercentages = [84, 91, 76, 88, 95];

  return (
    <section className="container-app py-8">
      {/* Container Card with Flash Theme */}
      <div className="bg-gradient-to-b from-rose-50/80 via-white to-white rounded-3xl p-5 sm:p-7 border border-rose-100/80 shadow-[0_4px_20px_rgba(245,67,106,0.06)]">
        {/* Header with countdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-rose-100">
          {/* Title block */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C03653] to-[#F5436A] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(245,67,106,0.35)] flex-shrink-0">
              <Zap size={24} className="animate-pulse fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Ofertele Zilei — Flash Deals
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-[#F5436A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Flame size={11} className="fill-current" />
                  DOAR AZI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Prețuri speciale valabile 24h în limita stocului disponibil din depozit
              </p>
            </div>
          </div>

          {/* Countdown timer & View All */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Modern Flip Clock Pill */}
            <div className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2 rounded-2xl shadow-md border border-slate-800">
              <Clock size={15} className="text-[#F5436A] animate-pulse" />
              <span className="text-[11px] text-slate-400 font-medium">Expiră în:</span>
              <div className="flex items-center gap-1 font-mono font-black text-sm tracking-wider">
                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">
                  {formatDigits(timeLeft.hours)}
                </span>
                <span className="text-slate-500">:</span>
                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">
                  {formatDigits(timeLeft.minutes)}
                </span>
                <span className="text-slate-500">:</span>
                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-rose-400">
                  {formatDigits(timeLeft.seconds)}
                </span>
              </div>
            </div>

            <Link
              href="/produse?sort=popular"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#008fa8] hover:text-[#C03653] transition-colors py-2 px-3 rounded-xl hover:bg-white"
            >
              <span>Toate ofertele</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* Grid of 5 flash products with stock urgency progress */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {products.map((product, idx) => {
            const soldPct = soldPercentages[idx % soldPercentages.length];
            return (
              <div key={product.id} className="flex flex-col">
                <ProductCard product={product} index={idx} />
                {/* Stock progress indicator underneath */}
                <div className="mt-2 px-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span className="flex items-center gap-1 text-rose-600">
                      <Flame size={10} className="fill-current text-rose-600" />
                      {soldPct}% rezervat
                    </span>
                    <span className="text-slate-400">Stoc redus</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-[#F5436A] rounded-full transition-all duration-500"
                      style={{ width: `${soldPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
