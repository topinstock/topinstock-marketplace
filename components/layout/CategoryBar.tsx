'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, Store, ArrowRight, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { MobileMenuDrawer, type MegaMenuCategory } from './MegaMenu';
import EmagMegaMenu from './EmagMegaMenu';
import { EMAG_CATALOG } from './emagMegaMenuData';

// ============================================
//   CategoryBar — Bara de navigare & Parteneriat
//   - Stânga: Meniu complet departamente eMAG (28.000+ produse)
//   - Centru / Dreapta: Începe-ți călătoria alături de noi, [Vinde pe TopinStock]
// ============================================

// Generăm categoriile complete pentru drawer-ul mobil din catalogul eMAG
const EMAG_MOBILE_CATEGORIES: MegaMenuCategory[] = EMAG_CATALOG.map((cat) => ({
  label: cat.name,
  href: cat.href,
  subcategories: cat.groups.flatMap((g) =>
    g.items.map((it) => ({
      label: it.name,
      href: it.href,
      isHot: Boolean(it.badge),
    }))
  ),
}));

export default function CategoryBar() {
  const [isEmagMenuOpen, setIsEmagMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const emagTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hover handlers pentru meniul eMAG "Toate Produsele"
  const handleEmagMouseEnter = useCallback(() => {
    if (emagTimeoutRef.current) clearTimeout(emagTimeoutRef.current);
    setIsEmagMenuOpen(true);
  }, []);

  const handleEmagMouseLeave = useCallback(() => {
    emagTimeoutRef.current = setTimeout(() => {
      setIsEmagMenuOpen(false);
    }, 180);
  }, []);

  return (
    <div className="relative z-30 bg-white border-b border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="container-app flex items-center justify-between h-[46px] sm:h-[48px] gap-3">
        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="flex items-center gap-1.5 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Menu size={16} />
            <span>Categorii</span>
          </button>
          <Link
            href="/cluburi-fotbal"
            className="flex items-center gap-1 text-[11px] font-black text-sky-900 bg-sky-50 border border-sky-300 px-2.5 py-1.5 rounded-xl whitespace-nowrap"
          >
            <span>⚽ Joma Cluburi</span>
          </Link>
        </div>

        {/* All Products Department Button with eMAG Mega Menu (Desktop only) */}
        <div
          className="hidden md:flex relative h-full items-center"
          onMouseEnter={handleEmagMouseEnter}
          onMouseLeave={handleEmagMouseLeave}
        >
          <Link
            href="/produse"
            className={`hidden md:flex relative z-50 items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-black tracking-tight text-white transition-all duration-150 whitespace-nowrap flex-shrink-0 cursor-pointer ${
              isEmagMenuOpen
                ? 'bg-[#003845] ring-2 ring-[#29DCFA]/40 shadow-sm'
                : 'bg-gradient-to-r from-[#004f61] to-[#006b80] hover:from-[#003845] hover:to-[#004f61] shadow-xs hover:shadow-sm'
            }`}
          >
            <Menu size={15} strokeWidth={2.5} />
            <span>Toate Produsele (16.000+)</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${isEmagMenuOpen ? 'rotate-180' : ''}`}
            />
          </Link>

          {/* eMAG Style Mega Menu (se deschide la hover peste Toate Produsele) */}
          <EmagMegaMenu
            isOpen={isEmagMenuOpen}
            onClose={() => setIsEmagMenuOpen(false)}
            onMouseEnter={handleEmagMouseEnter}
            onMouseLeave={handleEmagMouseLeave}
          />
        </div>

        {/* ── B2B Vendor Partner Strip ── */}
        <div className="hidden md:flex items-center justify-between flex-1 min-w-0 pl-3 lg:pl-6">
          {/* Slogan & Value Points */}
          <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4.5 min-w-0">
            <span className="inline-flex items-center px-3.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-[12px] font-black text-slate-900 shadow-xs uppercase tracking-wider whitespace-nowrap">
              Începe-ți călătoria alături de noi
            </span>

            {/* Micro-beneficii cu 0 mare */}
            <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-3.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-slate-800 border border-emerald-200/90 shadow-xs whitespace-nowrap">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span className="text-xs font-extrabold text-slate-700">Comision</span>
                <span className="text-base sm:text-lg font-black text-emerald-600 leading-none">0</span>
              </span>

              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-slate-800 border border-emerald-200/90 shadow-xs whitespace-nowrap">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span className="text-xs font-extrabold text-slate-700">Taxe</span>
                <span className="text-base sm:text-lg font-black text-emerald-600 leading-none">0</span>
              </span>

              <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/80 text-[11px] font-bold whitespace-nowrap">
                <Users size={12} className="text-slate-500 shrink-0" />
                <span>Mii de clienți activi</span>
              </span>

              {/* Joma Cluburi Fotbal Direct Link */}
              <Link
                href="/cluburi-fotbal"
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 shadow-xs transition-colors whitespace-nowrap cursor-pointer text-[11px] font-black uppercase tracking-wider"
              >
                <span>⚽ Cluburi Fotbal Joma</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black leading-none">MIN 8</span>
              </Link>
            </div>
          </div>

          {/* Red Button */}
          <div className="flex items-center shrink-0">
            <Link
              href="/vanzator"
              className="inline-flex items-center gap-1.5 px-3.5 lg:px-4 py-1.5 rounded-lg text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:via-rose-700 hover:to-red-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap cursor-pointer uppercase tracking-wider"
            >
              <Store size={14} className="text-white" />
              <span>Vinde pe TOPinStock</span>
              <ArrowRight size={13} className="text-white" />
            </Link>
          </div>
        </div>

        {/* Mobile Vendor CTA (Compact pe telefoane) */}
        <div className="flex md:hidden items-center">
          <Link
            href="/vanzator"
            className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-gradient-to-r from-red-600 to-rose-600 px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Store size={12} />
            <span>Vinde pe TOPinStock</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer cu toate categoriile eMAG */}
      <MobileMenuDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        categories={EMAG_MOBILE_CATEGORIES}
      />
    </div>
  );
}
