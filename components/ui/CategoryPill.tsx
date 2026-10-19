'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================
//   CategoryPill — Pastilă categorie
//   Used on the homepage Popular Categories section
//   Mirrors the mockup category-pill exactly
// ============================================

interface CategoryPillProps {
  icon: string;       // emoji
  label: string;
  href: string;
  className?: string;
}

export default function CategoryPill({
  icon,
  label,
  href,
  className,
}: CategoryPillProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-2 px-5 py-4 bg-white rounded-lg',
        'min-w-[100px] text-center cursor-pointer',
        'transition-all duration-250',
        'hover:-translate-y-1',
        className
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Icon container */}
      <div
        className="w-13 h-13 flex items-center justify-center bg-blue-50 rounded-md"
        style={{ width: '52px', height: '52px', fontSize: '28px' }}
      >
        {icon}
      </div>

      {/* Label */}
      <span className="text-[12px] font-semibold text-gray-700 whitespace-nowrap">
        {label}
      </span>
    </Link>
  );
}
