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
      className="sticky z-40 top-0 shadow-md"
      style={{
        background: 'linear-gradient(135deg, #008fa8 0%, #006b80 100%)',
      }}
    >
      {/* Main header row */}
      <div className="container-app flex items-center h-[72px] gap-4 md:gap-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex flex-col justify-center group select-none">
          <div className="flex items-baseline leading-none">
            <span
              className="text-[25px] md:text-[27px] font-black italic text-white tracking-tight leading-none transition-transform duration-150 group-hover:scale-[1.01]"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
            >
              TOPin<span style={{ color: '#F5436A', textShadow: '0 2px 10px rgba(245, 67, 106, 0.45)' }}>Stock</span>
            </span>
          </div>
          <div className="flex items-center -mt-0.5 pl-0.5">
            <span
              className="text-[9.5px] md:text-[10.5px] font-extrabold italic tracking-[0.08em] text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-150 group-hover:text-amber-200"
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
