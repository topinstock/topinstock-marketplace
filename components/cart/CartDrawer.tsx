'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Store,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useCartStore, useHydratedCart, FLAT_DELIVERY_FEE } from '@/lib/store/useCartStore';
import { cn } from '@/lib/utils';

// ============================================
//   CartDrawer — Slide-over Drawer din dreapta
//   Deschide automat la adăugarea unui produs sau
//   la click pe coș din header
// ============================================

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    totalCount,
    subtotal,
    deliveryFee,
    grandTotal,
    isReady,
    isMinimumMet,
    minimumDifference,
    minimumOrderAmount,
  } = useHydratedCart();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isReady) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 overflow-hidden transition-all duration-300',
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      )}
    >
      {/* ── Backdrop Overlay ── */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeCart}
      />

      {/* ── Slide-Over Panel ── */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 w-full max-w-[440px] bg-white shadow-2xl flex flex-col',
          'transform transition-transform duration-300 ease-out z-10',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* ── Drawer Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900 leading-tight">
                Coșul tău
              </h2>
              <p className="text-[12px] text-gray-500">
                {totalCount} {totalCount === 1 ? 'produs' : 'produse'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Închide coșul"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Drawer Body: Item List or Empty State ── */}
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100 p-1.5 flex items-center justify-center">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-contain object-center"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Vendor badge */}
                        <div className="flex items-center gap-1 text-[11px] text-blue-700 font-medium mb-0.5">
                          <Store size={10} className="flex-shrink-0" />
                          <span className="truncate">Vândut de {item.vendorName}</span>
                        </div>

                        {/* Title */}
                        <h4
                          className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2"
                          title={item.title}
                        >
                          {item.title}
                        </h4>

                        {/* Size / Color badges */}
                        {(item.size || item.color) && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500 flex-wrap">
                            {item.size && (
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                                Mărime: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                                {item.color}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity Selector & Price */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200/60 rounded-l-lg transition-colors"
                            aria-label="Scade cantitatea"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-[12px] font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200/60 rounded-r-lg transition-colors"
                            aria-label="Crește cantitatea"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-extrabold text-gray-900">
                            {itemTotal.toFixed(2)} LEI
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                            aria-label="Șterge produsul din coș"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Summary & Checkout CTA ── */}
            <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-3">
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal produse:</span>
                  <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} LEI</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cost livrare (curier rapid):</span>
                  <span className="font-semibold text-gray-900">
                    {subtotal >= 300 ? (
                      <span className="text-emerald-600 font-bold uppercase text-xs">Gratuit</span>
                    ) : (
                      `${deliveryFee.toFixed(2)} LEI`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs pt-0.5">
                  <span>TVA inclusă (19%):</span>
                  <span>{Math.round(((subtotal >= 300 ? subtotal : subtotal + deliveryFee) - (subtotal >= 300 ? subtotal : subtotal + deliveryFee) / 1.19) * 100) / 100} LEI</span>
                </div>
                <div className="pt-2 border-t border-gray-200/80 flex justify-between text-[16px] font-black text-gray-900">
                  <span>Total de plată:</span>
                  <span className="text-blue-900">
                    {(subtotal >= 300 ? subtotal : grandTotal).toFixed(2)} LEI
                  </span>
                </div>
              </div>

              {/* Minimum Order Warning & Progress */}
              {!isMinimumMet && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-start gap-2 text-amber-900 font-semibold">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Comandă minimă: <strong>{minimumOrderAmount} LEI</strong>. Mai adaugă produse de <strong>{minimumDifference.toFixed(2)} LEI</strong> pentru a putea plasa comanda.
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

              {/* Sticky Checkout CTA */}
              <button
                type="button"
                disabled={!isMinimumMet}
                onClick={() => {
                  if (!isMinimumMet) return;
                  closeCart();
                  router.push('/checkout');
                }}
                className={cn(
                  "w-full font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2",
                  isMinimumMet
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white active:scale-98 cursor-pointer"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                )}
              >
                {isMinimumMet ? (
                  <>
                    <span>Finalizează comanda</span>
                    <ArrowRight size={17} />
                  </>
                ) : (
                  <span>Minim de comandă 50 LEI (mai adaugă {minimumDifference.toFixed(2)} LEI)</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Tranzacție securizată • Date protejate</span>
              </div>
            </div>
          </>
        ) : (
          /* ── Empty Cart State ── */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-4 shadow-xs">
              <ShoppingBag size={38} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Coșul tău este gol
            </h3>
            <p className="text-gray-500 text-[13px] max-w-xs mb-6">
              Descoperă miile de produse de la vânzătorii TOPinStock și adaugă articolele preferate în coș.
            </p>
            <button
              onClick={() => {
                closeCart();
                router.push('/produse');
              }}
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold text-[13px] px-6 py-3 rounded-full transition-colors shadow-sm"
            >
              Continuă cumpărăturile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
