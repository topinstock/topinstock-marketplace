'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Store,
  BadgeCheck,
  CheckCircle,
  Truck,
  RotateCcw,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogProduct } from '@/lib/products';
import type { Product } from '@/types';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { SEOManager } from '@/lib/seo';

export type ProductCardItem = CatalogProduct | Product | any;

export interface ProductCardProps {
  product: ProductCardItem;
  className?: string;
  priority?: boolean;
  showStockUrgency?: boolean;
  index?: number;
}

function ProductCard({
  product,
  className,
  priority = false,
  showStockUrgency = true,
  index = 0,
}: ProductCardProps) {
  const isWishlisted = useWishlistStore((s) => s.hasItem(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  // Normalize product properties
  const id = product.id;
  const title = product.title || product.name || 'Produs';
  const slug = product.slug || id;
  const price = Number(product.price) || 0;
  const originalPrice =
    product.originalPrice != null ? Number(product.originalPrice) : null;
  const stock = typeof product.stock === 'number' ? product.stock : 10;


  const rawImages = product.images;
  const imageUrl =
    Array.isArray(rawImages) && rawImages.length > 0 && rawImages[0]
      ? rawImages[0]
      : typeof rawImages === 'string'
      ? rawImages
      : '/images/product_laptop.jpg';

  const vendorName =
    product.vendor?.storeName ||
    product.seller?.storeName ||
    product.sellerName ||
    'TOPinStock';

  const isVerified =
    product.vendor?.isVerified ?? product.seller?.isVerified ?? true;

  const rating =
    typeof product.rating === 'number' && product.rating > 0
      ? product.rating
      : 4.8;
  const reviewsCount = product.reviewsCount ?? product.reviewCount ?? 18;

  // Staggered Entrance delay (30-50ms between cards)
  const staggerDelay = `${Math.min(index, 24) * 40}ms`;

  function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);

    toggleWishlist({
      productId: id,
      title: title,
      slug: slug,
      price: price,
      originalPrice: originalPrice,
      image: imageUrl,
      vendorId:
        product.vendorId ||
        product.sellerId ||
        (product.vendor as any)?.id ||
        '1',
      vendorName: vendorName,
      stock: stock,
      rating: rating,
    });
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (stock <= 0 || isAdding) return;

    setIsAdding(true);

    addItem({
      productId: id,
      title: title,
      price: price,
      originalPrice: originalPrice,
      image: imageUrl,
      size: product.sizes?.[0] || undefined,
      color: product.colors?.[0] || undefined,
      quantity: 1,
      vendorId:
        product.vendorId ||
        product.sellerId ||
        (product.vendor as any)?.id ||
        '1',
      vendorName: vendorName,
    });

    setIsAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <Link
      href={SEOManager.buildProductUrl({ slug, id, sku: product.sku })}
      id={`product-card-${id}`}
      style={{
        animationDelay: staggerDelay,
        animationFillMode: 'both',
      }}
      className={cn(
        'group relative flex flex-col bg-white rounded-xl sm:rounded-2xl overflow-hidden animate-card-enter',
        'border border-slate-100 hover:border-[#0a6c74]/25',
        'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_-6px_rgba(10,108,116,0.12)]',
        'transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1',
        className
      )}
    >
      {/* ── Visual Media Container (Centered 1:1 Aspect Ratio) ── */}
      <div className="relative aspect-square w-full overflow-hidden bg-white flex items-center justify-center p-3.5 sm:p-4.5 border-b border-slate-50">
        {/* Hover zoom effect: subtle scale(1.04) inside overflow:hidden container */}
        <div className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
          <Image
            src={imageUrl}
            alt={`${title} - Imagine`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'low'}
            className="object-contain object-center"
          />
        </div>

        {/* ── Top-Left Badges Stack (Stock Urgency) ── */}
        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {showStockUrgency && stock > 0 && stock <= 5 && (
            <span className="inline-flex items-center gap-1 bg-slate-900/85 backdrop-blur-xs text-amber-400 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
              <Flame size={9} className="text-amber-400 animate-pulse" />
              <span>Doar {stock} rămase</span>
            </span>
          )}
        </div>

        {/* ── Floating Wishlist Heart Button (Top-Right) ── */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Elimină din favorite' : 'Adaugă la favorite'}
          className={cn(
            'absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center',
            'bg-white/90 backdrop-blur-md shadow-md border transition-all duration-200',
            'hover:scale-110 hover:border-[#e11d48] hover:shadow-[0_4px_12px_rgba(225,29,72,0.2)] active:scale-90 group/heart',
            heartAnim && 'animate-heart-pop',
            isWishlisted
              ? 'text-[#e11d48] bg-white border-[#e11d48]/40 ring-1 ring-[#e11d48]/20 shadow-sm'
              : 'text-slate-400 border-white/80 hover:text-[#e11d48] hover:bg-white'
          )}
        >
          <Heart
            size={14}
            fill={isWishlisted ? 'currentColor' : 'none'}
            strokeWidth={isWishlisted ? 0 : 2}
            className={cn(
              'sm:w-[17px] sm:h-[17px] transition-transform duration-200 group-hover/heart:scale-115 group-hover/heart:text-[#e11d48]',
              isWishlisted && 'scale-105'
            )}
          />
        </button>
      </div>

      {/* ── Product Information Details ── */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 bg-white">
        {/* Vendor tag */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10.5px] sm:text-[11px] text-slate-500 font-medium mb-1 min-w-0">
          <Store size={11} className="text-slate-400 flex-shrink-0 sm:w-3 sm:h-3" />
          <span className="truncate flex-1 min-w-0">{vendorName}</span>
          {isVerified && (
            <span title="Vânzător Verificat" className="flex-shrink-0">
              <BadgeCheck size={12} className="text-[#0a6c74] sm:w-[13px] sm:h-[13px]" />
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-[12px] sm:text-[14px] font-semibold text-slate-800 leading-[1.3] mb-1 sm:mb-1.5 line-clamp-2 min-h-[2.6em] group-hover:text-[#0a6c74] transition-colors break-words"
          title={title}
        >
          {title}
        </h3>

        {/* Ratings with Review Count */}
        <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
          <div className="flex items-center text-amber-400 text-[11px] sm:text-xs">
            ★
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700">
            {rating.toFixed(1)}
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400">
            ({reviewsCount})
          </span>
        </div>

        {/* Pricing Architecture (Stacked on mobile to guarantee no collisions) */}
        <div className="mt-auto pt-1">
          {price <= 0 || product.category?.slug?.includes('engross') ? (
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded w-fit mb-0.5 border border-amber-200">
                En-Gross · B2B
              </span>
              <span className="text-[13.5px] sm:text-[17px] font-extrabold text-slate-900 tracking-tight">
                Preț la Cerere
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5 min-w-0">
              <span className="text-[14.5px] sm:text-[18px] font-extrabold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                {price % 1 === 0 ? price.toLocaleString('ro-RO') : price.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 ml-0.5 sm:ml-1">LEI</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Buton interactiv „Adaugă în coș” (full-width în culoarea #0a6c74) ── */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0 || isAdding}
          className={cn(
            'w-full py-2 sm:py-2.5 px-2 sm:px-3 mt-2 sm:mt-3 rounded-lg sm:rounded-xl text-[11.5px] sm:text-[12.5px] font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 border shadow-xs cursor-pointer',
            added
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : stock <= 0
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-[#0a6c74]/5 border-[#0a6c74]/25 text-[#0a6c74] hover:bg-[#0a6c74] hover:text-white group-hover:bg-[#0a6c74] group-hover:text-white group-hover:border-[#0a6c74] group-hover:shadow-[0_4px_14px_rgba(10,108,116,0.25)] active:scale-[0.98]'
          )}
        >
          {isAdding ? (
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : added ? (
            <>
              <CheckCircle size={14} className="text-white flex-shrink-0" />
              <span className="truncate">Adăugat!</span>
            </>
          ) : stock <= 0 ? (
            <span>Stoc epuizat</span>
          ) : (
            <>
              <ShoppingCart size={13} className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0 sm:w-[15px] sm:h-[15px]" />
              <span className="truncate">Adaugă în coș</span>
            </>
          )}
        </button>

        {/* Trust micro-badges (Livrare rapidă & 30 zile retur) */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10.5px] font-medium text-slate-500 mt-2 pt-1.5 sm:pt-2 border-t border-slate-100 min-w-0">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold truncate min-w-0">
            <Truck size={10} className="flex-shrink-0 sm:w-3 sm:h-3" />
            <span className="truncate">Livrare rapidă</span>
          </span>
          <span className="flex items-center gap-1 text-slate-600 flex-shrink-0 ml-1">
            <RotateCcw size={10} className="flex-shrink-0 text-[#0a6c74] sm:w-3 sm:h-3" />
            <span>30z retur</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCard);
