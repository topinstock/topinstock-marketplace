'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCatalogLoading } from './CatalogLoadingContext';

// ============================================
//   SortBar — Sortare produse catalog
//   Pill style with smooth hover translateY(-1px)
//   and #0a6c74 active pill with subtle shadow
// ============================================

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Cele mai noi' },
  { value: 'rating',     label: 'Cel mai bine cotate' },
  { value: 'popular',    label: 'Popularitate' },
  { value: 'price_asc',  label: 'Preț crescător' },
  { value: 'price_desc', label: 'Preț descrescător' },
] as const;

interface SortBarProps {
  currentSort?: string;
  total: number;
  currentPage: number;
  perPage: number;
}

export default function SortBar({ currentSort = 'newest', total, currentPage, perPage }: SortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, startCatalogTransition } = useCatalogLoading();

  function handleSort(value: string) {
    if (currentSort === value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');

    startCatalogTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
      {/* Results count */}
      <p className="text-[13px] text-slate-500">
        Afișând{' '}
        <span className="font-semibold text-[#1e293b]">
          {from}–{to}
        </span>{' '}
        din{' '}
        <span className="font-semibold text-[#1e293b]">
          {total.toLocaleString('ro-RO')}
        </span>{' '}
        produse
      </p>

      {/* Sort options pill bar (visible on lg screens; mobile uses the sticky bar sort button) */}
      <div className="hidden lg:flex items-center gap-2 max-w-full overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium flex-shrink-0">
          <ArrowUpDown size={13} className="text-[#0a6c74]" />
          <span>Sortează:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-nowrap sm:flex-wrap">
          {SORT_OPTIONS.map((opt) => {
            const isActive = currentSort === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSort(opt.value)}
                disabled={isPending}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-[12px] font-semibold border flex-shrink-0',
                  'transition-all duration-200 ease-out select-none cursor-pointer',
                  'hover:-translate-y-[1px]',
                  isActive
                    ? 'bg-[#0a6c74] text-white border-[#0a6c74] shadow-[0_2px_8px_rgba(10,108,116,0.25)]'
                    : 'text-[#1e293b] border-slate-200 bg-white hover:border-[#0a6c74]/50 hover:text-[#0a6c74] hover:bg-[#e6f4f5]/40 hover:shadow-xs'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
