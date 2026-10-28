'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { EMAG_CATALOG, type EmagCategory } from './emagMegaMenuData';
import { cn } from '@/lib/utils';

interface EmagMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function EmagMegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: EmagMegaMenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(EMAG_CATALOG[0].id);

  const activeCategory: EmagCategory =
    EMAG_CATALOG.find((cat) => cat.id === activeCategoryId) || EMAG_CATALOG[0];

  const ActiveIcon = activeCategory.icon;

  if (!isOpen) return null;

  return (
    <>
      {/* ── Dim Backdrop Overlay (eMAG style) ── */}
      <div
        className="hidden md:block fixed inset-x-0 bottom-0 top-[134px] bg-slate-950/25 backdrop-blur-[1px] z-40 transition-opacity duration-200 opacity-100 pointer-events-auto"
        onClick={onClose}
      />

      {/* ── Main Mega Menu Container (Desktop only) ── */}
      <div
        className="hidden md:flex absolute left-0 top-[calc(100%+4px)] z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all duration-200 origin-top-left opacity-100 scale-100 pointer-events-auto visible before:content-[''] before:absolute before:-top-4 before:left-0 before:right-0 before:h-4"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* ── 1. Left Vertical Category Sidebar (eMAG Screenshot 2) ── */}
        <div className="w-[240px] lg:w-[260px] bg-slate-50/70 border-r border-slate-200/80 py-2.5 flex flex-col shrink-0 max-h-[min(580px,calc(100vh-140px))] overflow-y-auto no-scrollbar">
          {EMAG_CATALOG.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.id === activeCategory.id;

            return (
              <Link
                key={cat.id}
                href={cat.href}
                onClick={onClose}
                onMouseEnter={() => setActiveCategoryId(cat.id)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 mx-1.5 rounded-xl cursor-pointer text-xs transition-all duration-150 group select-none',
                  isActive
                    ? 'bg-white text-[#008fa8] font-bold shadow-xs border-l-4 border-l-[#008fa8] translate-x-0.5'
                    : 'text-slate-700 font-medium hover:text-[#008fa8] hover:bg-white/80'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={16}
                    className={cn(
                      'shrink-0 transition-colors',
                      isActive ? 'text-[#008fa8]' : 'text-slate-400 group-hover:text-[#008fa8]'
                    )}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                <ChevronRight
                  size={13}
                  className={cn(
                    'shrink-0 transition-all',
                    isActive
                      ? 'text-[#008fa8] translate-x-0.5 opacity-100'
                      : 'text-slate-300 opacity-60 group-hover:opacity-100'
                  )}
                />
              </Link>
            );
          })}
        </div>

        {/* ── 2. Right Subcategories Flyout Panel (eMAG Screenshot 3) ── */}
        <div className="w-[660px] lg:w-[760px] xl:w-[800px] bg-white p-6 max-h-[min(580px,calc(100vh-140px))] overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Header / Breadcrumb strip */}
            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100">
              <Link
                href={activeCategory.href}
                onClick={onClose}
                className="flex items-center gap-2.5 group/title cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#008fa8]/10 text-[#008fa8] flex items-center justify-center group-hover/title:bg-[#008fa8] group-hover/title:text-white transition-colors">
                  <ActiveIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover/title:text-[#008fa8] tracking-tight leading-none mb-1 transition-colors">
                    {activeCategory.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {activeCategory.productCount} garantate în stoc
                  </span>
                </div>
              </Link>

              <Link
                href={activeCategory.href}
                onClick={onClose}
                className="text-xs font-bold text-[#008fa8] hover:text-[#005c6e] flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-[#008fa8]/10 transition-colors group"
              >
                <span>Toate subcategoriile</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Subcategory Columns Grid */}
            <div className="grid grid-cols-3 gap-x-7 gap-y-6">
              {activeCategory.groups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  {/* Bold Group Title */}
                  <Link
                    href={group.href}
                    onClick={onClose}
                    className="block text-[13px] font-black text-slate-900 hover:text-[#008fa8] tracking-tight transition-colors"
                  >
                    {group.title}
                  </Link>

                  {/* Subcategory Links */}
                  <ul className="space-y-1">
                    {group.items.map((sub, sIdx) => (
                      <li key={sIdx}>
                        <Link
                          href={sub.href}
                          onClick={onClose}
                          className="text-[12px] font-medium text-slate-600 hover:text-[#008fa8] hover:translate-x-0.5 transition-all py-0.5 flex items-center justify-between group"
                        >
                          <span className="group-hover:font-semibold">{sub.name}</span>
                          {sub.badge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. Bottom TOP Brands Strip (eMAG style) ── */}
          {activeCategory.topBrands && activeCategory.topBrands.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2.5 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">
                Branduri de TOP:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeCategory.topBrands.map((brand) => (
                  <Link
                    key={brand}
                    href={`/produse?search=${encodeURIComponent(brand)}`}
                    onClick={onClose}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-[#008fa8]/10 hover:text-[#008fa8] text-slate-700 text-[11px] font-bold border border-slate-200/60 transition-colors"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
