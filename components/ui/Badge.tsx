'use client';

import { cn } from '@/lib/utils';

// ============================================
//   Badge — Etichetă produs
//   Variants: sale (red), new (blue), top (yellow), custom
// ============================================

type BadgeVariant = 'sale' | 'new' | 'top' | 'custom';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  sale:   'bg-red-500 text-white',
  new:    'bg-blue-500 text-white',
  top:    'bg-yellow-500 text-gray-900',
  custom: 'bg-gray-700 text-white',
};

export default function Badge({
  variant = 'custom',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
