'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronDown, X, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
//   MegaMenu — Trendyol-style hover panel
//   - Left: Subcategory columns & featured tags
//   - Right: Highlighted Promo / Trend Banner Card
//   - Mobile: Drawer Fallback with accordion
// ============================================

export interface MegaMenuPromo {
  title: string;
  subtitle: string;
  tag?: string;
  discountBadge?: string;
  image: string;
  href: string;
}

export interface MegaMenuCategory {
  label: string;
  href: string;
  subcategories?: { label: string; href: string; isHot?: boolean }[];
  featured?: { label: string; href: string; badge?: string }[];
  promo?: MegaMenuPromo;
}

interface MegaMenuProps {
  category?: MegaMenuCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function MegaMenu({
  category,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  if (!isOpen || !category || !category.subcategories?.length) return null;

  // Split subcategories into columns of max 5 items
  const subcategoryColumns: { label: string; href: string; isHot?: boolean }[][] = [];
  const chunkSize = 5;
  for (let i = 0; i < category.subcategories.length; i += chunkSize) {
    subcategoryColumns.push(category.subcategories.slice(i, i + chunkSize));
  }

  const promo = category.promo ?? {
    title: `Noua Colecție ${category.label}`,
    subtitle: 'Tendințe exclusive & cele mai bune prețuri',
    tag: 'TENDINȚE 2026',
    discountBadge: '-30% REDUCERE',
    image: '/images/hero1.jpg',
    href: category.href,
  };

  return (
    <div
      className={cn(
        'absolute left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl',
        'transition-all duration-200 origin-top',
        isOpen
          ? 'opacity-100 scale-y-100 pointer-events-auto'
          : 'opacity-0 scale-y-95 pointer-events-none'
      )}
      style={{
        top: '100%',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18)',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onClose}
    >
      <div className="container-app py-7">
        <div className="flex gap-8 items-stretch">
          {/* ── Left Column: Quick summary & featured ── */}
          <div className="w-[200px] flex-shrink-0 border-r border-gray-100 pr-6">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <Sparkles size={13} className="text-orange-500" />
              <span>{category.label}</span>
            </p>

            <Link
              href={category.href}
              onClick={onClose}
              className="flex items-center justify-between text-[14px] font-bold text-blue-900
                         hover:text-orange-500 transition-colors duration-150 mb-3 group"
            >
              <span>Toate produsele</span>
              <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Featured highlighted tags */}
            {category.featured && category.featured.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Recomandate
                </p>
                {category.featured.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between text-[12px] font-semibold text-gray-700
                               hover:text-orange-600 transition-colors py-1 group"
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Center: Subcategories Columns ── */}
          <div className="flex-1 grid grid-cols-3 gap-6">
            {subcategoryColumns.map((col, colIdx) => (
              <div key={colIdx} className="space-y-2">
                {col.map((sub) => (
                  <Link
                    key={sub.href + sub.label}
                    href={sub.href}
                    onClick={onClose}
                    className="flex items-center justify-between text-[13px] text-gray-700 hover:text-orange-600 hover:translate-x-1 transition-all py-1.5 font-medium group"
                  >
                    <span className="group-hover:font-semibold">{sub.label}</span>
                    {sub.isHot && (
                      <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                        HOT
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* ── Right Column: Trendyol-Style Highlighted Banner Promo Card ── */}
          <div className="w-[280px] flex-shrink-0">
            <Link
              href={promo.href}
              onClick={onClose}
              className="group block relative h-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Background image with overlay */}
              <div className="absolute inset-0">
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  sizes="280px"
                  className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              {/* Promo details */}
              <div className="relative h-full flex flex-col justify-end p-5 text-white">
                {promo.tag && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 mb-1">
                    {promo.tag}
                  </span>
                )}
                {promo.discountBadge && (
                  <div className="inline-flex self-start bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md mb-2 shadow-sm">
                    {promo.discountBadge}
                  </div>
                )}
                <h4 className="text-[16px] font-black leading-snug mb-1 group-hover:text-orange-300 transition-colors">
                  {promo.title}
                </h4>
                <p className="text-[12px] text-white/80 leading-snug mb-4 line-clamp-2">
                  {promo.subtitle}
                </p>

                <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white group-hover:translate-x-1 transition-transform">
                  <span>Vezi Colecția</span>
                  <ArrowRight size={14} className="text-orange-400" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Category item in horizontal bar ──

interface CategoryItemProps {
  category: MegaMenuCategory;
  isActive: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function CategoryItem({
  category,
  isActive,
  onEnter,
  onLeave,
  onMouseEnter,
  onMouseLeave,
}: CategoryItemProps) {
  const hasMega = (category.subcategories?.length ?? 0) > 0;
  const handleEnter = onMouseEnter || onEnter;
  const handleLeave = onMouseLeave || onLeave;

  return (
    <div
      className="relative flex items-center h-full flex-shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href={category.href}
        className={cn(
          'flex items-center gap-1.5 text-[13px] font-semibold tracking-tight',
          'px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer',
          isActive
            ? 'text-[#008fa8] bg-slate-100 font-bold'
            : 'text-slate-700 hover:text-[#008fa8] hover:bg-slate-100/80'
        )}
      >
        <span>{category.label}</span>
        {hasMega && (
          <ChevronDown
            size={13}
            className={cn(
              'transition-transform duration-200 opacity-60 text-slate-400',
              isActive && 'rotate-180 text-[#008fa8] opacity-100'
            )}
          />
        )}
      </Link>
    </div>
  );
}

// ── Mobile Drawer Fallback ──

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MegaMenuCategory[];
}

export function MobileMenuDrawer({ isOpen, onClose, categories }: MobileMenuDrawerProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className="fixed inset-y-0 left-0 w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#008fa8] to-[#006b80] text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <div className="flex flex-col">
              <span className="font-black italic text-[24px] tracking-tight leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                TOPin<span style={{ color: '#FF1744' }}>Stock</span>
              </span>
              <span className="text-[12px] font-black italic tracking-[0.06em] text-[#FFE600] mt-1 leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                Marketplace Outlet
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            aria-label="Închide meniul"
          >
            <X size={19} />
          </button>
        </div>

        {/* Quick links */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-3 gap-2 text-center text-[12px] font-semibold text-gray-700">
          <Link
            href="/cont"
            onClick={onClose}
            className="p-2 bg-white rounded-lg border border-gray-100 hover:border-blue-500 hover:text-blue-700 transition-colors shadow-xs"
          >
            Contul meu
          </Link>
          <Link
            href="/favorite"
            onClick={onClose}
            className="p-2 bg-white rounded-lg border border-gray-100 hover:border-red-500 hover:text-red-600 transition-colors shadow-xs"
          >
            Favorite
          </Link>
          <Link
            href="/cos"
            onClick={onClose}
            className="p-2 bg-white rounded-lg border border-gray-100 hover:border-orange-500 hover:text-orange-600 transition-colors shadow-xs"
          >
            Coș
          </Link>
        </div>

        {/* Categories Accordion */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">
            Categorii de produse
          </p>

          <Link
            href="/produse"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-bold text-blue-900 hover:bg-blue-50"
          >
            <span>Toate Produsele</span>
            <ChevronRight size={15} />
          </Link>

          {categories.map((cat) => {
            const isExpanded = expandedCat === cat.label;
            const hasChildren = (cat.subcategories?.length ?? 0) > 0;

            return (
              <div key={cat.label} className="border-b border-gray-50 last:border-none">
                <div className="flex items-center justify-between">
                  <Link
                    href={cat.href}
                    onClick={onClose}
                    className="flex-1 px-3 py-2.5 text-[14px] font-medium text-gray-800 hover:text-orange-600"
                  >
                    {cat.label}
                  </Link>

                  {hasChildren && (
                    <button
                      onClick={() => setExpandedCat(isExpanded ? null : cat.label)}
                      className="p-2.5 text-gray-400 hover:text-gray-700"
                      aria-label={`Deschide subcategoriile pentru ${cat.label}`}
                    >
                      <ChevronDown
                        size={16}
                        className={cn('transition-transform duration-200', isExpanded && 'rotate-180')}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {isExpanded && hasChildren && (
                  <div className="pl-6 pr-3 py-2 bg-gray-50/70 rounded-lg mb-2 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                    <Link
                      href={cat.href}
                      onClick={onClose}
                      className="block text-[12px] font-bold text-blue-800 py-1"
                    >
                      Toate din {cat.label} →
                    </Link>
                    {cat.subcategories!.map((sub) => (
                      <Link
                        key={sub.href + sub.label}
                        href={sub.href}
                        onClick={onClose}
                        className="block text-[13px] text-gray-600 hover:text-orange-600 py-1"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Popular Products link */}
          <Link
            href="/produse?sort=popular"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2.5 mt-2 rounded-lg text-[14px] font-bold text-[#008fa8] bg-teal-50 hover:bg-teal-100"
          >
            <span>✨ Produse Populare &amp; Noutăți</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
