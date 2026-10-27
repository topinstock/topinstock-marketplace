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
      {/* ── Visual Media Container (Centered 1:1 Aspect Ratio - Larger Image) ── */}
      <div className="relative aspect-square w-full overflow-hidden bg-white flex items-center justify-center p-2 sm:p-3 border-b border-slate-100">
        {/* Hover zoom effect */}
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

        {/* ── Floating Wishlist Heart Button (Top-Right) ── */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Elimină din favorite' : 'Adaugă la favorite'}
          className={cn(
            'absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center',
            'bg-white/90 backdrop-blur-md shadow-md border transition-all duration-200',
            'hover:scale-110 hover:border-[#e11d48] hover:shadow-[0_4px_12px_rgba(225,29,72,0.2)] active:scale-90 group/heart',
            heartAnim && 'animate-heart-pop',
            isWishlisted
              ? 'text-[#e11d48] bg-white border-[#e11d48]/40 ring-1 ring-[#e11d48]/20 shadow-sm'
              : 'text-slate-400 border-white/80 hover:text-[#e11d48] hover:bg-white'
          )}
        >
          <Heart
            size={15}
            fill={isWishlisted ? 'currentColor' : 'none'}
            strokeWidth={isWishlisted ? 0 : 2}
            className={cn(
              'sm:w-[17px] sm:h-[17px] transition-transform duration-200 group-hover/heart:scale-115 group-hover/heart:text-[#e11d48]',
              isWishlisted && 'scale-105'
            )}
          />
        </button>
      </div>

      {/* ── Product Information Details (Clean & Bold Typography) ── */}
      <div className="p-3 sm:p-4.5 flex flex-col flex-1 bg-white">
        {/* Vendor tag */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-slate-400 font-medium mb-1 min-w-0">
          <Store size={12} className="text-slate-400 flex-shrink-0" />
          <span className="truncate flex-1 min-w-0">{vendorName}</span>
          {isVerified && (
            <span title="Vânzător Verificat" className="flex-shrink-0">
              <BadgeCheck size={13} className="text-[#0a6c74]" />
            </span>
          )}
        </div>

        {/* Title — Larger & clearer */}
        <h3
          className="text-[13.5px] sm:text-[15px] font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2 min-h-[2.6em] group-hover:text-[#0a6c74] transition-colors break-words"
          title={title}
        >
          {title}
        </h3>

        {/* Ratings with Review Count */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-amber-400 text-xs leading-none">★</span>
          <span className="text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
          <span className="text-[11px] text-slate-400">({reviewsCount})</span>
        </div>

        {/* Pricing Architecture — Bold & Prominent */}
        <div className="mt-auto pt-1">
          {price <= 0 || product.category?.slug?.includes('engross') ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit mb-0.5 border border-amber-200">
                En-Gross · B2B
              </span>
              <span className="text-[15px] sm:text-[18px] font-extrabold text-slate-900 tracking-tight">
                Preț la Cerere
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[17px] sm:text-[21px] font-black text-slate-900 tracking-tight leading-none whitespace-nowrap">
                {price % 1 === 0 ? price.toLocaleString('ro-RO') : price.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs sm:text-sm font-bold text-slate-500 ml-1">LEI</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Buton „Adaugă în coș” (clean & comfortable) ── */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0 || isAdding}
          className={cn(
            'w-full h-10 sm:h-11 px-3 mt-3 rounded-xl text-[12.5px] sm:text-[13.5px] font-extrabold flex items-center justify-center gap-2 transition-all duration-200 border shadow-xs cursor-pointer',
            added
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : stock <= 0
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-[#0a6c74] text-white border-[#0a6c74] hover:bg-[#004f61] hover:border-[#004f61] shadow-sm hover:shadow-md active:scale-[0.98]'
          )}
        >
          {isAdding ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : added ? (
            <>
              <CheckCircle size={15} className="text-white flex-shrink-0" />
              <span>Adăugat!</span>
            </>
          ) : stock <= 0 ? (
            <span>Stoc epuizat</span>
          ) : (
            <>
              <ShoppingCart size={15} className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
              <span>Adaugă în coș</span>
            </>
          )}
        </button>
      </div>
    </Link>
  );
}

export default memo(ProductCard);
