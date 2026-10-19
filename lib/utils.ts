import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
//   cn() — Tailwind class merge utility
//   Combines clsx (conditional classes) with
//   tailwind-merge (deduplication & conflict resolution)
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
//   Price formatting — Romanian locale (Lei)
// ============================================

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ============================================
//   Price rounding rule:
//   For prices > 5 Lei, round to nearest 9:
//   Unit >= 5 rounds up to 9 (e.g. 45 -> 49, 245 -> 249)
//   Unit < 5 rounds down to 9 (e.g. 44 -> 39, 40 -> 39)
// ============================================

export function roundPriceEndingIn9(rawPrice: number): number {
  if (rawPrice == null || isNaN(rawPrice)) return rawPrice;
  const num = Number(rawPrice);
  if (num <= 5) return num;

  const intVal = Math.floor(num);
  const units = intVal % 10;
  const tens = Math.floor(intVal / 10);

  if (units >= 5) {
    return tens * 10 + 9;
  } else {
    const prevTens = Math.max(0, tens - 1);
    return prevTens * 10 + 9;
  }
}

// ============================================
//   Discount calculation helper
// ============================================

export function calculateDiscount(
  originalPrice: number,
  currentPrice: number
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// ============================================
//   Slug generator
// ============================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ============================================
//   Truncate string
// ============================================

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '…';
}

// ============================================
//   JSON Parse & Stringify helpers (SQLite array/object support)
// ============================================

export function safeJsonParse<T>(value: any, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(value: any, fallback = '[]'): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}
