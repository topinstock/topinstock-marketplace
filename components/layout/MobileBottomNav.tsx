'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, Heart, User } from 'lucide-react';
import { useHydratedCart } from '@/lib/store/useCartStore';
import { useHydratedWishlist } from '@/lib/store/useWishlistStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalCount: cartCount, openCart } = useHydratedCart();
  const { totalCount: wishlistCount } = useHydratedWishlist();
  const { isAuthenticated, user } = useAuth();

  const isHome = pathname === '/';
  const isCatalog = pathname.startsWith('/produse');
  const isWishlist = pathname.startsWith('/favorite');
  const isAccount = pathname.startsWith('/cont');

  return (
    <nav
      aria-label="Navigare Mobilă"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-15 items-center px-1">
        {/* 1. Acasă */}
        <Link
          href="/"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 py-1 transition-colors',
            isHome ? 'text-[#008fa8]' : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Home size={20} strokeWidth={isHome ? 2.5 : 1.75} />
          <span className={cn('text-[10px] tracking-tight', isHome ? 'font-black' : 'font-medium')}>
            Acasă
          </span>
        </Link>

        {/* 2. Categorii / Catalog */}
        <Link
          href="/produse"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 py-1 transition-colors',
            isCatalog ? 'text-[#008fa8]' : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <LayoutGrid size={20} strokeWidth={isCatalog ? 2.5 : 1.75} />
          <span className={cn('text-[10px] tracking-tight', isCatalog ? 'font-black' : 'font-medium')}>
            Categorii
          </span>
        </Link>

        {/* 3. Coș (deschide CartDrawer) */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-500 hover:text-slate-900 transition-colors relative cursor-pointer"
          aria-label={`Coș de cumpărături (${cartCount} articole)`}
        >
          <div className="relative">
            <ShoppingCart size={20} strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Coș</span>
        </button>

        {/* 4. Favorite */}
        <Link
          href="/favorite"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 py-1 transition-colors relative',
            isWishlist ? 'text-[#F5436A]' : 'text-slate-500 hover:text-slate-900'
          )}
          aria-label={`Favorite (${wishlistCount} produse)`}
        >
          <div className="relative">
            <Heart
              size={20}
              strokeWidth={isWishlist ? 0 : 1.75}
              fill={isWishlist ? 'currentColor' : 'none'}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </div>
          <span className={cn('text-[10px] tracking-tight', isWishlist ? 'font-black' : 'font-medium')}>
            Favorite
          </span>
        </Link>

        {/* 5. Contul Meu */}
        <Link
          href="/cont"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 py-1 transition-colors relative',
            isAccount ? 'text-[#008fa8]' : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <div className="relative">
            <User size={20} strokeWidth={isAccount ? 2.5 : 1.75} />
            {isAuthenticated && (
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </div>
          <span className={cn('text-[10px] tracking-tight truncate max-w-[58px]', isAccount ? 'font-black' : 'font-medium')}>
            {isAuthenticated && user?.name ? user.name.split(' ')[0] : 'Cont'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
