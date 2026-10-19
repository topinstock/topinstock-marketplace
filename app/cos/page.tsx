'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Store,
  AlertTriangle,
} from 'lucide-react';
import { useCartStore, useHydratedCart, FLAT_DELIVERY_FEE, MINIMUM_ORDER_AMOUNT } from '@/lib/store/useCartStore';

export default function CartPage() {
  const {
    items,
    totalCount,
    subtotal,
    deliveryFee,
    grandTotal,
    isHydrated,
    isMinimumMet,
    minimumDifference,
    minimumOrderAmount,
  } = useHydratedCart();
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  if (!isHydrated) {
    return (
      <div className="container-app py-16 text-center">
        <div className="w-12 h-12 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Se încarcă coșul de cumpărături...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-16 max-w-xl text-center">
        <div className="w-24 h-24 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShoppingBag size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          Coșul tău este gol
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Nu ai adăugat încă niciun produs în coș. Descoperă ofertele noastre speciale și miile de articole de la comercianți verificați.
        </p>
        <Link
          href="/produse"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-3.5 rounded-full shadow-lg transition-all duration-200 hover:-translate-y-0.5"
        >
          <span>Explorează Catalogul</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 py-10">
      <div className="container-app max-w-6xl">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Coșul meu de cumpărături
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Ai {totalCount} {totalCount === 1 ? 'articol' : 'articole'} în coș
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors cursor-pointer"
          >
            Golește coșul
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (Left: 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  {/* Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 p-2 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-contain object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                      <Store size={12} />
                      <span className="truncate">{item.vendorName}</span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                      <Link
                        href={`/produse/${item.productId}`}
                        className="hover:text-blue-900 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </h3>

                    {/* Size & Color */}
                    {(item.size || item.color) && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-medium">
                        {item.size && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                            Mărime: <strong>{item.size}</strong>
                          </span>
                        )}
                        {item.color && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                            Culoare: <strong>{item.color}</strong>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price on mobile */}
                    <div className="sm:hidden mt-3 font-black text-gray-900 text-base">
                      {(item.price * item.quantity).toFixed(2)} LEI
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {/* Quantity pill */}
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black hover:bg-white rounded-lg transition-colors cursor-pointer"
                        aria-label="Scade"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black hover:bg-white rounded-lg transition-colors cursor-pointer"
                        aria-label="Crește"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Total item price desktop */}
                    <div className="hidden sm:block text-right min-w-[90px]">
                      <div className="font-black text-gray-900 text-base">
                        {(item.price * item.quantity).toFixed(2)} LEI
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {item.price.toFixed(2)} LEI / buc.
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Șterge produsul"
                      aria-label="Șterge produsul"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Back to shopping link */}
            <div className="pt-2">
              <Link
                href="/produse"
                className="text-xs sm:text-sm font-bold text-blue-900 hover:underline inline-flex items-center gap-1.5"
              >
                ← Continuă cumpărăturile în magazin
              </Link>
            </div>
          </div>

          {/* Order Summary (Right: 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-gray-900 pb-3 border-b border-gray-100">
                Sumar Comandă
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal produse:</span>
                  <span className="font-bold text-gray-900">{subtotal.toFixed(2)} LEI</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>Livrare Curier Rapid:</span>
                  </div>
                  <span className="font-bold text-gray-900">{FLAT_DELIVERY_FEE.toFixed(2)} LEI</span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-gray-900">Total de plată:</span>
                  <span className="text-2xl font-black text-gray-900">
                    {grandTotal.toFixed(2)} <span className="text-sm font-bold text-gray-700">LEI</span>
                  </span>
                </div>
              </div>

              {/* Minimum Order Alert */}
              {!isMinimumMet && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2.5">
                  <div className="flex items-start gap-2.5 text-amber-900 font-semibold leading-relaxed">
                    <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Comandă minimă pe TOPinStock: <strong>{minimumOrderAmount} LEI</strong>. Mai adaugă produse în valoare de <strong>{minimumDifference.toFixed(2)} LEI</strong> pentru a putea plasa comanda.
                    </span>
                  </div>
                  <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round((subtotal / minimumOrderAmount) * 100))}%` }}
                    />
                  </div>
                </div>
              )}

              {isMinimumMet ? (
                <Link
                  href="/checkout"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Continuă spre Finalizare</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <div className="space-y-2">
                  <div className="w-full h-12 bg-gray-200 text-gray-500 font-bold rounded-2xl flex items-center justify-center text-xs text-center px-4 cursor-not-allowed">
                    Minim de comandă 50 LEI (mai adaugă {minimumDifference.toFixed(2)} LEI)
                  </div>
                  <Link
                    href="/produse"
                    className="block text-center text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline pt-1"
                  >
                    + Adaugă produse în coș din catalog
                  </Link>
                </div>
              )}
            </div>

            {/* Guarantees */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <Truck size={16} className="text-blue-900 flex-shrink-0" />
                <span>Livrare rapidă prin curierat în 2-3 zile</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw size={16} className="text-blue-900 flex-shrink-0" />
                <span>Drept de retur în 14 zile calendaristice</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0" />
                <span>Cumpărături 100% sigure și protejate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
