'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, User } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import CategoryBar from './CategoryBar';

// ============================================
//   Header — Antetul principal
//   - Main Navigation Bar: Logo, Central Search Bar cu buton de curățare
//   - Quick Access Buttons: "Contul meu", "Favorite" (cu badge), "Coș" (cu badge)
//   - Sub-navigation bar cu categorii orizontale + Trendyol-style MegaMenu
// ============================================

import { useHydratedCart } from '@/lib/store/useCartStore';
import { useHydratedWishlist } from '@/lib/store/useWishlistStore';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Header() {
  const { totalCount, openCart } = useHydratedCart();
  const { totalCount: wishlistCount } = useHydratedWishlist();
  const { user, isAuthenticated } = useAuth();

  const displayName = user?.name ? user.name.split(' ')[0] : 'Contul meu';

  return (
    <header
      className="sticky z-40 top-0 shadow-md w-full max-w-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #008fa8 0%, #006b80 100%)',
      }}
    >
      {/* ── Mobile Header Bar (< md) ── */}
      <div className="md:hidden container-app pt-2.5 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col justify-center select-none py-0.5">
            <span
              className="text-[26px] sm:text-[30px] font-black italic text-white tracking-tight leading-none"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              TOPin<span style={{ color: '#FF1744' }}>Stock</span>
            </span>
            <span
              className="text-[11px] sm:text-[12px] font-black italic tracking-[0.05em] text-[#FFE600] mt-0.5 leading-none"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
            >
              Marketplace Outlet
            </span>
          </Link>

          {/* Quick Header Actions: Favorite & Coș */}
          <div className="flex items-center gap-1">
            <Link
              href="/favorite"
              className="p-2 text-white/90 hover:text-white relative rounded-lg hover:bg-white/10 transition-colors"
              aria-label={`Favorite (${wishlistCount} produse)`}
            >
              <Heart size={21} strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span
                  className="absolute top-1 right-1 bg-rose-500 text-white
                             text-[9px] font-bold w-[17px] h-[17px] rounded-full
                             flex items-center justify-center border-2 border-[#006b80] shadow-xs"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="p-2 text-white/90 hover:text-white relative rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={`Coș (${totalCount} produse)`}
            >
              <ShoppingCart size={21} strokeWidth={1.75} />
              {totalCount > 0 && (
                <span
                  className="absolute top-1 right-1 bg-orange-500 text-white
                             text-[9px] font-bold w-[17px] h-[17px] rounded-full
                             flex items-center justify-center border-2 border-[#006b80] shadow-xs"
                >
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Full-width Search Bar for Mobile */}
        <div className="w-full">
          <Suspense fallback={<div className="h-[42px] bg-white/20 rounded-full animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* ── Desktop Header Bar (>= md) ── */}
      <div className="hidden md:flex container-app items-center min-h-[86px] py-2 gap-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex flex-col justify-center group select-none">
          <div className="flex items-baseline leading-none">
            <span
              className="text-[34px] sm:text-[38px] md:text-[42px] font-black italic text-white tracking-tight leading-none transition-transform duration-150 group-hover:scale-[1.01]"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              TOPin<span style={{ color: '#FF1744' }}>Stock</span>
            </span>
          </div>
          <div className="flex items-center mt-0.5 pl-0.5">
            <span
              className="text-[13px] sm:text-[14px] md:text-[15.5px] font-black italic tracking-[0.06em] text-[#FFE600] transition-all duration-150 group-hover:text-amber-200"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
            >
              Marketplace Outlet
            </span>
          </div>
        </Link>

        {/* Central Search Bar with clear button */}
        <div className="flex-1 max-w-[680px]">
          <Suspense fallback={<div className="h-[46px] bg-white/20 rounded-full animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Header Actions: Contul meu, Favorite, Coș */}
        <nav className="flex items-center gap-1 md:gap-2">
          {/* Contul meu */}
          <Link
            href="/cont"
            className="flex flex-col items-center gap-0.5 text-white/90
                       px-2.5 md:px-3.5 py-1.5 rounded-lg transition-all duration-150
                       hover:bg-white/10 hover:text-white group relative"
            aria-label="Contul meu"
          >
            <div className="relative">
              <User size={21} strokeWidth={1.75} />
              {isAuthenticated && (
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#006b80]" />
              )}
            </div>
            <span className="text-[11px] font-medium whitespace-nowrap hidden sm:inline max-w-[90px] truncate">
              {displayName}
            </span>
          </Link>

          {/* Favorite (cu counter badge) */}
          <Link
            href="/favorite"
            className="flex flex-col items-center gap-0.5 text-white/90
                       px-2.5 md:px-3.5 py-1.5 rounded-lg transition-all duration-150
                       hover:bg-white/10 hover:text-white relative"
            aria-label={`Favorite (${wishlistCount} produse)`}
          >
            <div className="relative">
              <Heart size={21} strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 bg-rose-500 text-white
                             text-[10px] font-bold w-[18px] h-[18px] rounded-full
                             flex items-center justify-center border-2 border-[#006b80] shadow-sm animate-pulse"
                >
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium whitespace-nowrap hidden sm:inline">
              Favorite
            </span>
          </Link>

          {/* Coș (deschide CartDrawer) */}
          <button
            type="button"
            onClick={openCart}
            className="flex flex-col items-center gap-0.5 text-white/90
                       px-2.5 md:px-3.5 py-1.5 rounded-lg transition-all duration-150
                       hover:bg-white/10 hover:text-white relative cursor-pointer"
            aria-label={`Coș (${totalCount} produse)`}
          >
            <div className="relative">
              <ShoppingCart size={21} strokeWidth={1.75} />
              {totalCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 bg-orange-500 text-white
                             text-[10px] font-bold w-[18px] h-[18px] rounded-full
                             flex items-center justify-center border-2 border-[#006b80] shadow-sm"
                >
                  {totalCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium whitespace-nowrap hidden sm:inline">
              Coș
            </span>
          </button>
        </nav>
      </div>

      {/* Sub-navigation bar with horizontal top-level categories */}
      <CategoryBar />
    </header>
  );
}
