'use client';

import { cn } from '@/lib/utils';

// ============================================
//   StarRating — Evaluare cu stele
// ============================================

interface StarRatingProps {
  rating: number;       // 0–5
  count?: number;       // number of reviews
  showCount?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StarRating({
  rating,
  count,
  showCount = true,
  size = 'sm',
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return '★';
    if (i < rating) return '★'; // simplified: treat 0.5 as filled
    return '☆';
  });

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'text-yellow-500 tracking-wide',
          size === 'sm' ? 'text-[13px]' : 'text-base'
        )}
      >
        {stars.join('')}
      </span>
      {showCount && count !== undefined && (
        <span className="text-gray-400 text-[12px]">({count.toLocaleString('ro-RO')})</span>
      )}
    </div>
  );
}
