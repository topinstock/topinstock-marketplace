'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
//   PaginationControls — Paginare catalog
//   Client Component — updates `page` param
// ============================================

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationControls({
  currentPage,
  totalPages,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const queryStr = params.toString();
    const targetUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
    startTransition(() => {
      router.push(targetUrl, { scroll: true });
    });
  }

  // Build page numbers to display (max 7 slots)
  function getPageNumbers(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | '...')[] = [1];

    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push('...');

    pages.push(totalPages);
    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1.5 mt-10 mb-6"
      aria-label="Paginare"
    >
      {/* Prev */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className={cn(
          'flex items-center gap-1 px-3.5 py-2 rounded-lg text-[13px] font-semibold',
          'border border-slate-200 transition-all duration-150',
          currentPage <= 1
            ? 'text-slate-300 border-slate-100 cursor-not-allowed'
            : 'text-[#1e293b] hover:bg-slate-50 hover:border-[#0a6c74] hover:text-[#0a6c74]'
        )}
      >
        <ChevronLeft size={14} />
        Înapoi
      </button>

      {/* Page numbers */}
      {pageNumbers.map((num, idx) =>
        num === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-[13px]">
            …
          </span>
        ) : (
          <button
            key={num}
            onClick={() => goToPage(num as number)}
            disabled={isPending}
            className={cn(
              'min-w-[36px] h-9 px-2 rounded-lg text-[13px] font-semibold border',
              'transition-all duration-150',
              num === currentPage
                ? 'bg-[#0a6c74] text-white border-[#0a6c74] shadow-xs'
                : 'text-[#1e293b] border-slate-200 hover:bg-slate-50 hover:border-[#0a6c74] hover:text-[#0a6c74] bg-white'
            )}
          >
            {num}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages || isPending}
        className={cn(
          'flex items-center gap-1 px-3.5 py-2 rounded-lg text-[13px] font-semibold',
          'border border-slate-200 transition-all duration-150',
          currentPage >= totalPages
            ? 'text-slate-300 border-slate-100 cursor-not-allowed'
            : 'text-[#1e293b] hover:bg-slate-50 hover:border-[#0a6c74] hover:text-[#0a6c74]'
        )}
      >
        Înainte
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}
