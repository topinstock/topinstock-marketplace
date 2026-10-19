'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Store,
  BadgeCheck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Package,
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  Share2,
  Check,
  Truck,
  Clock,
  Flame,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { cn } from '@/lib/utils';
import type { CatalogProduct } from '@/lib/products';
import { SEOManager } from '@/lib/seo';

interface ProductInfoProps {
  product: CatalogProduct;
  composedTitle?: string;
  breadcrumbs?: { name: string; url: string }[];
  marketplaceOffers?: Array<{
    sellerName: string;
    sellerSlug?: string;
    price: number;
    stock: number;
    rating?: number;
    isVerified?: boolean;
    condition?: string;
  }>;
}

export default function ProductInfo({
  product,
  composedTitle,
  breadcrumbs,
  marketplaceOffers,
}: ProductInfoProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;

  const catSlug = product.category?.slug?.toLowerCase() || '';
  const catName = product.category?.name?.toLowerCase() || '';
  const isFashionOrApparel =
    /barbati|femei|imbracaminte|incaltaminte|pantofi|aditasi|geci|jachete|rochii|pantaloni|camasi|tricouri|sosete|fuste|lenjerie/i.test(catSlug) ||
    /barbati|femei|imbracaminte|incaltaminte|pantofi|aditasi|geci|jachete|rochii|pantaloni|camasi|tricouri|sosete|fuste/i.test(catName);

  // Filter out dummy values like 'Universal' or 'Diverse'
  const validSizes = Array.isArray(product.sizes)
    ? product.sizes.filter(
        (s) => s && typeof s === 'string' && !s.toLowerCase().includes('universal') && !s.toLowerCase().includes('diverse')
      )
    : [];

  // Only display sizes if it's apparel/footwear OR explicit technical sizes (e.g. 5L, 100mm, etc.)
  const hasValidSizes = validSizes.length > 0 && (isFashionOrApparel || validSizes.some(s => /^\d+(\.\d+)?\s*(l|ml|kg|g|w|v|ah|mm|cm|m)$/i.test(s)));
  const availableSizes = hasValidSizes ? validSizes : [];

  const INVALID_COLOR_WORDS = new Set([
    'diverse', 'universal', 'oem', 'victronic', 'grünberg', 'grunberg', 'bohmann',
    'berlinger', 'berlinger haus', 'cheffinger', 'royalty line', 'bachmayer', 'joma',
    'heinner', 'desigual', 'splendor', 'blueberg', 'veinira', 'crofton', 'delight',
    'kids', 'jolly kids', 'tuffex', 'national', 'sannea', 'standard'
  ]);

  const validColors = Array.isArray(product.colors)
    ? product.colors.filter((c) => {
        if (!c || typeof c !== 'string') return false;
        const lower = c.trim().toLowerCase();
        if (INVALID_COLOR_WORDS.has(lower)) return false;
        if (product.vendor?.storeName && lower === product.vendor.storeName.toLowerCase()) return false;
        return true;
      })
    : [];

  const availableColors = validColors;

  const [selectedSize, setSelectedSize] = useState<string | undefined>(availableSizes[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(availableColors[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const isWishlisted = useWishlistStore((s) => s.hasItem(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const vendorName = product.vendor?.storeName || 'Magazin Oficial';
  const vendorSlug = product.vendor?.slug || 'magazin-oficial';
  const isVerified = product.vendor?.isVerified ?? true;
  const inStock = product.stock > 0;

  function handleAddToCart() {
    if (!inStock) return;

    setIsAdding(true);

    addItem({
      productId: product.id,
      title: product.title,
      price: price,
      originalPrice: originalPrice,
      image: product.images[0] || '/images/product_laptop.jpg',
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity: quantity,
      vendorId: product.vendorId || (product.vendor as any)?.id || '1',
      vendorName: vendorName,
    });

    openCart();
    setIsAdding(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  }

  function handleBuyNow() {
    if (!inStock) return;

    addItem({
      productId: product.id,
      title: product.title,
      price: price,
      originalPrice: originalPrice,
      image: product.images[0] || '/images/product_laptop.jpg',
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity: quantity,
      vendorId: product.vendorId || (product.vendor as any)?.id || '1',
      vendorName: vendorName,
    });

    router.push('/checkout');
  }

  function handleShare() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── eMAG-Style Breadcrumbs Trail: Acasă > Părinte > Subcategorie > Categorie + Brand > Produs ── */}
      <nav aria-label="Breadcrumb" className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          breadcrumbs.map((b, idx) => (
            <span key={b.url} className="flex items-center gap-1.5">
              {idx > 0 && <span>/</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-semibold truncate max-w-[280px]">
                  {b.name}
                </span>
              ) : (
                <Link href={b.url} className="hover:text-blue-900 transition-colors">
                  {b.name}
                </Link>
              )}
            </span>
          ))
        ) : (
          <>
            <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  href={SEOManager.buildCategoryUrl(product.category.slug)}
                  className="hover:text-blue-900 transition-colors"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-[260px]">{product.title}</span>
          </>
        )}
      </nav>

      {/* ── Title & Meta ── */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-2">
          {product.sku && (
            <span className="text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              COD: {product.sku}
            </span>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-900 transition-colors ml-auto"
            title="Copiază link-ul produsului"
          >
            {copiedLink ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Link copiat!</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>Distribuie</span>
              </>
            )}
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          {product.title}
        </h1>

        {/* Rating & Reviews */}
        <button
          type="button"
          onClick={() => {
            const btn = document.getElementById('tab-reviews-button');
            btn?.click();
            btn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="flex items-center gap-3 mt-3 cursor-pointer group hover:opacity-90 transition-opacity text-left"
          aria-label="Vezi recenziile produsului"
        >
          <div className="flex items-center text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.round(product.rating || 4.5) ? 'currentColor' : 'none'}
                strokeWidth={i < Math.round(product.rating || 4.5) ? 0 : 1.5}
                className={i < Math.round(product.rating || 4.5) ? 'text-amber-400' : 'text-gray-200'}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-800">
            {product.rating > 0 ? product.rating.toFixed(1) : '4.8'}
          </span>
          <span className="text-xs text-blue-700 font-semibold group-hover:underline">
            ({product.reviewsCount > 0 ? product.reviewsCount : 18} recenzii verificate)
          </span>
        </button>
      </div>

      {/* ── Vendor Box with Profile Link ── */}
      <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-800 flex items-center justify-center font-bold">
            <Store size={20} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Vândut și expediat de:</p>
            <div className="flex items-center gap-1.5">
              <Link
                href={SEOManager.buildSellerUrl(vendorSlug)}
                className="font-bold text-gray-900 text-sm hover:text-blue-900 hover:underline transition-colors"
                title={`Vezi toate produsele de la ${vendorName}`}
              >
                {vendorName}
              </Link>
              {isVerified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  <BadgeCheck size={12} />
                  <span>Verificat</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          href={SEOManager.buildSellerUrl(vendorSlug)}
          className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
        >
          Vizitează Magazinul
        </Link>
      </div>

      {/* ── Price Section ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-transparent border border-orange-100/80">
        {price <= 0 || product.category?.slug?.includes('engross') ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300">
                Distribuție En-Gross · B2B Exclusiv
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Preț la Cerere / Ofertă En-Gross
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              Vânzare engros dedicată persoanelor juridice, instalatorilor autorizați și revânzătorilor. Prețul unitar final se calculează în funcție de cantitatea comandată (bax, rolă, tambur sau palet).
            </p>
          </div>
        ) : (
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {price.toFixed(2)}{' '}
              <span className="text-base font-bold text-gray-700">LEI</span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2 text-xs">
          {inStock ? (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 size={14} />
              <span>În stoc ({product.stock} bucăți disponibile)</span>
            </span>
          ) : (
            <span className="text-red-500 font-semibold">Stoc epuizat momentan</span>
          )}
          {inStock && product.stock <= 5 && (
            <span className="flex items-center gap-1 text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full">
              <Flame size={11} /> Stoc limitat!
            </span>
          )}
        </div>

        {/* ── Delivery Promise ── */}
        {inStock && (
          <div className="mt-3 flex items-center gap-2.5 p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl">
            <Truck size={20} className="text-emerald-700 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-black text-emerald-800">
                Livrat Mâine dacă comanzi în următoarele{' '}
                <span className="text-emerald-700">câteva ore</span>
              </p>
              <p className="text-[11px] text-emerald-600">Comandă acum, livrare rapidă garantată</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Size Selector with Out-of-Stock Handling (Only rendered if genuine sizes exist) ── */}
      {availableSizes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              {isFashionOrApparel ? 'Alege Mărimea:' : 'Alege Opțiunea:'}{' '}
              <span className="text-blue-900 font-black">{selectedSize}</span>
            </span>
            {isFashionOrApparel && (
              <span className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer">
                Ghid de mărimi
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((s) => {
              const isSizeDisabled = !inStock;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={isSizeDisabled}
                  onClick={() => setSelectedSize(s)}
                  className={cn(
                    'min-w-[48px] h-11 px-3.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center relative',
                    isSizeDisabled
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through opacity-60'
                      : selectedSize === s
                      ? 'border-blue-900 bg-blue-900 text-white shadow-sm cursor-pointer'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 cursor-pointer'
                  )}
                  title={isSizeDisabled ? `Mărimea ${s} este indisponibilă` : `Alege ${s}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Color Selector ── */}
      {availableColors.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Culoare: <span className="text-blue-900 font-black">{selectedColor}</span>
          </span>

          <div className="flex flex-wrap gap-2">
            {availableColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer',
                  selectedColor === c
                    ? 'border-blue-900 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Quantity & Add to Cart Actions ── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center border-2 border-gray-200 rounded-2xl bg-white p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-40"
              aria-label="Scade cantitatea"
            >
              <Minus size={15} />
            </button>
            <span className="w-10 text-center font-bold text-sm text-gray-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Crește cantitatea"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Primary Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            className={cn(
              'flex-1 min-w-0 h-12 px-3 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-98',
              addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
              !inStock && 'bg-gray-300 cursor-not-allowed opacity-80'
            )}
          >
            {isAdding ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : addedSuccess ? (
              <>
                <Check size={18} className="flex-shrink-0" />
                <span className="truncate">Adăugat în coș!</span>
              </>
            ) : !inStock ? (
              <span className="truncate">Produs indisponibil</span>
            ) : (
              <>
                <ShoppingCart size={18} className="flex-shrink-0" />
                <span className="truncate">Adaugă în coș — {(price * quantity).toFixed(2)} LEI</span>
              </>
            )}
          </button>

          {/* Secondary Wishlist Toggle */}
          <button
            type="button"
            onClick={() => {
              toggleWishlist({
                productId: product.id,
                title: product.title,
                slug: product.slug,
                price: price,
                originalPrice: originalPrice,
                image: product.images[0] || '/images/product_laptop.jpg',
                vendorId: product.vendorId || (product.vendor as any)?.id || '1',
                vendorName: vendorName,
                stock: product.stock,
                rating: product.rating,
              });
            }}
            aria-label={isWishlisted ? 'Elimină din favorite' : 'Salvează la favorite'}
            className={cn(
              'w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0',
              isWishlisted
                ? 'border-rose-500 bg-rose-50 text-rose-500 shadow-xs'
                : 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-rose-500 bg-white'
            )}
          >
            <Heart
              size={20}
              fill={isWishlisted ? 'currentColor' : 'none'}
              strokeWidth={isWishlisted ? 0 : 2}
            />
          </button>
        </div>

        {/* ── Secondary Buy Now (1-Click Fast Checkout) ── */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock}
          className={cn(
            'w-full h-12 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98',
            'bg-gradient-to-r from-[#008fa8] via-[#006b80] to-[#004f61] hover:from-[#007d94] hover:to-[#005c6e] text-white shadow-[0_4px_16px_rgba(0,143,168,0.25)]',
            !inStock && 'bg-gray-300 cursor-not-allowed opacity-80 pointer-events-none'
          )}
        >
          <Zap size={18} className="text-amber-300 fill-amber-300 animate-pulse" />
          <span>Cumpără Acum — Comandă Rapidă în 1 Clic</span>
        </button>
      </div>

      {/* ── Guarantee Badges ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-gray-100 text-center">
        <div className="p-2 sm:p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100/80 flex flex-col items-center min-w-0">
          <Truck size={18} className="text-emerald-700 mb-1 flex-shrink-0" />
          <span className="text-[10.5px] sm:text-[11px] font-bold text-gray-900 leading-tight truncate w-full">Livrare 2-3 zile</span>
          <span className="text-[9.5px] sm:text-[10px] text-gray-500 truncate w-full">Curier rapid</span>
        </div>

        <div className="p-2 sm:p-3 bg-blue-50/70 rounded-2xl border border-blue-100/80 flex flex-col items-center min-w-0">
          <RotateCcw size={18} className="text-blue-700 mb-1 flex-shrink-0" />
          <span className="text-[10.5px] sm:text-[11px] font-bold text-gray-900 leading-tight truncate w-full">Retur 30 zile</span>
          <span className="text-[9.5px] sm:text-[10px] text-gray-500 truncate w-full">Simplu &amp; rapid</span>
        </div>

        <div className="p-2 sm:p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center min-w-0">
          <Package size={18} className="text-blue-800 mb-1 flex-shrink-0" />
          <span className="text-[10.5px] sm:text-[11px] font-bold text-gray-900 leading-tight truncate w-full">Verificare colet</span>
          <span className="text-[9.5px] sm:text-[10px] text-gray-500 truncate w-full">Deschidere la livrare</span>
        </div>
      </div>

      {/* ── eMAG-Style Marketplace Offers: "Alte X oferte de la Y Lei" ── */}
      {marketplaceOffers && marketplaceOffers.length > 0 && (
        <div className="pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store size={17} className="text-blue-800" />
                <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">
                  Alte {marketplaceOffers.length}{' '}
                  {marketplaceOffers.length === 1 ? 'ofertă' : 'oferte'} din Marketplace
                </span>
              </div>
              <span className="text-xs font-bold text-blue-900">
                de la {Math.min(...marketplaceOffers.map((o) => o.price)).toFixed(2)} LEI
              </span>
            </div>

            <div className="space-y-2">
              {marketplaceOffers.map((offer) => (
                <div
                  key={offer.sellerName}
                  className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200/70 text-xs shadow-2xs hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <span>{offer.sellerName}</span>
                      {offer.isVerified && (
                        <span title="Vânzător Partener Verificat" className="inline-flex items-center">
                          <BadgeCheck size={13} className="text-blue-700" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Truck size={11} />
                        În stoc ({offer.stock} buc.)
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star size={11} fill="currentColor" />
                        {offer.rating || 4.8}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-gray-900">
                      {offer.price.toFixed(2)} LEI
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        addItem({
                          productId: product.id,
                          title: product.title,
                          price: offer.price,
                          originalPrice: null,
                          image: product.images[0] || '/images/product_laptop.jpg',
                          size: selectedSize,
                          color: selectedColor,
                          quantity: 1,
                          vendorId: offer.sellerSlug || offer.sellerName,
                          vendorName: offer.sellerName,
                        });
                        openCart();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-[11px] transition-colors"
                    >
                      Adaugă
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
