'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Flame, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { RECOMMENDED_PRODUCTS } from '@/lib/data/products';
import type { Product } from '@/types';

const CATEGORY_TABS = [
  { id: 'all', label: 'Toate Recomandările' },
  { id: 'bucatarie', label: 'Bucătărie & Gătit' },
  { id: 'electro', label: 'Electrocasnice' },
  { id: 'copii', label: 'Copii & Jucării' },
  { id: 'casa', label: 'Casă & Confort' },
];

export default function RecommendedProductsSection() {
  const [activeTab, setActiveTab] = useState('all');

  const allProducts: Product[] = RECOMMENDED_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: '',
    price: p.price,
    originalPrice: undefined,
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
      positiveRating: 99,
      totalSales: 890,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categoryId: '1',
    category: {
      id: '1',
      name: p.category,
      slug: p.category.toLowerCase().replace(/\s+/g, '-'),
      icon: null,
      parentId: null,
    },
    rating: p.rating,
    reviewCount: p.reviewCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Filter based on selected tab
  const filteredProducts = allProducts.filter((p) => {
    if (activeTab === 'all') return true;
    const cat = (p.category?.name || '').toLowerCase();
    const name = p.name.toLowerCase();
    if (activeTab === 'bucatarie') {
      return cat.includes('oale') || cat.includes('gratar') || cat.includes('bucatarie') || name.includes('oale');
    }
    if (activeTab === 'electro') {
      return cat.includes('calorifer') || cat.includes('electro') || name.includes('incalzitor') || name.includes('ulei');
    }
    if (activeTab === 'copii') {
      return cat.includes('copii') || cat.includes('biciclet') || cat.includes('jucari') || name.includes('trotineta') || name.includes('masinuta');
    }
    if (activeTab === 'casa') {
      return cat.includes('brad') || cat.includes('birou') || cat.includes('casa') || name.includes('brad') || name.includes('birou');
    }
    return true;
  });

  const displayProducts = filteredProducts.slice(0, 10);

  return (
    <section className="container-app py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#008fa8] to-[#29DCFA] text-white flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Recomandate pentru Tine
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Selectate pe baza celor mai mari reduceri și a popularității din marketplace
          </p>
        </div>

        <Link
          href="/produse"
          className="text-xs sm:text-sm font-bold text-[#008fa8] hover:text-[#C03653] flex items-center gap-1 transition-colors self-start sm:self-auto group"
        >
          <span>Catalog complet (395 produse)</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Filter Tabs Pills (Trendyol style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Grid (2 rows of 5 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {displayProducts.map((product, idx) => (
          <ProductCard key={product.id} product={product} index={idx} />
        ))}
      </div>
    </section>
  );
}
