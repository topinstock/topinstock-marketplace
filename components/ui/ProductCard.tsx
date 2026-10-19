'use client';

// ============================================
//   UI ProductCard — Proxy export of unified ProductCard
//   Ensures full design parity across all views & sections
// ============================================

import ProductCard, { type ProductCardProps } from '@/components/products/ProductCard';

export type { ProductCardProps };
export default ProductCard;
