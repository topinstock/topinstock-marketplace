'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ArrowRight, Store, Check, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useHydratedWishlist, type WishlistItem } from '@/lib/store/useWishlistStore';
import { SEOManager } from '@/lib/seo';

export default function FavoritePage() {
  const { items, totalCount, removeItem, clearWishlist, isReady } = useHydratedWishlist();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  function handleAddToCart(item: WishlistItem) {
    addItem({
      productId: item.productId,
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice ?? undefined,
      image: item.image,
      quantity: 1,
      vendorId: item.vendorId || '1',
      vendorName: item.vendorName || 'TOPinStock',
    });
    openCart();
    setAddedMap((prev) => ({ ...prev, [item.productId]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.productId]: false }));
    }, 2000);
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50/70 py-12 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#008fa8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 py-10">
      <div className="container-app max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 flex items-center gap-1.5 mb-6">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Favorite</span>
        </nav>

        {/* Title */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-xs">
                <Heart size={22} fill="currentColor" />
              </span>
              <span>Produsele mele favorite</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Ai salvat {totalCount} {totalCount === 1 ? 'produs' : 'produse'} pentru mai târziu
            </p>
          </div>

          {totalCount > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>Șterge toate</span>
            </button>
          )}
        </div>

        {totalCount === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 border border-gray-100 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Heart size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Nu ai adăugat încă niciun produs la favorite
            </h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Explorează catalogul nostru cu peste 390 de produse reale, apasă pe inimioara oricărui articol și salvează-l aici pentru a-l găsi rapid oricând.
            </p>
            <Link
              href="/produse"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#008fa8] to-[#006b80] hover:from-[#007d94] hover:to-[#005c6e] text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <Sparkles size={16} />
              <span>Explorează Catalogul de Produse</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isAdded = addedMap[item.productId];

              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
                >
                  {/* Delete button (top right) */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Șterge din favorite"
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-rose-50 text-gray-400 hover:text-rose-500 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div>
                    {/* Image */}
                    <Link
                      href={SEOManager.buildProductUrl({ slug: item.slug, id: item.productId })}
                      className="block relative aspect-square w-full rounded-2xl overflow-hidden bg-white p-3 border border-slate-100 mb-4 flex items-center justify-center"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain object-center group-hover:scale-105 transition-transform duration-300 p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Link>

                    {/* Vendor */}
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-1.5">
                      <Store size={13} />
                      <span className="truncate">{item.vendorName || 'TOPinStock'}</span>
                    </div>

                    {/* Title */}
                    <Link
                      href={SEOManager.buildProductUrl({ slug: item.slug, id: item.productId })}
                      className="block text-sm font-bold text-gray-900 hover:text-[#008fa8] transition-colors line-clamp-2 mb-3"
                    >
                      {item.title}
                    </Link>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-gray-50 space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-gray-900">
                        {item.price.toFixed(2)} LEI
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#C03653] hover:bg-[#A02B44] text-white hover:shadow-md'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={15} />
                          <span>Adăugat în Coș!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={15} />
                          <span>Adaugă în coș</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
