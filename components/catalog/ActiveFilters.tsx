'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { CatalogCategory } from '@/lib/products';
import { SEOManager } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { useCatalogLoading } from './CatalogLoadingContext';

// ============================================
//   ActiveFilters — Filtre active (chips animate)
//   Fundal #e6f4f5, text #0a6c74, buton „×”
//   Animații: scale-in la adăugare, fade-out la eliminare
// ============================================

interface ActiveFiltersProps {
  filters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sizes?: string;
    color?: string;
    attribute?: string;
    sort?: string;
    brand?: string;
    inStock?: string;
    onSale?: string;
    brandSlug?: string | null;
    attributeSlug?: string | null;
  };
  categories: CatalogCategory[];
}

interface ChipItem {
  id: string;
  label: string;
  removeKey: string;
  removeValue?: string;
}

export default function ActiveFilters({ filters, categories }: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, startCatalogTransition } = useCatalogLoading();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const chips: ChipItem[] = [];

  // Category chips
  if (filters.category) {
    const cats = filters.category.split(',').map((c) => c.trim()).filter(Boolean);
    const flatCats = categories.flatMap((c) => [c, ...(c.children || [])]);
    cats.forEach((slug) => {
      const match = flatCats.find((c) => c.slug === slug);
      chips.push({
        id: `cat-${slug}`,
        label: match?.name ?? slug,
        removeKey: 'category',
        removeValue: slug,
      });
    });
  }

  // Brand chips
  const effectiveBrand =
    filters.brand || (filters.brandSlug ? SEOManager.parseBrandSlug(filters.brandSlug) : undefined);
  if (effectiveBrand) {
    const brands = effectiveBrand.split(',').map((b) => b.trim()).filter(Boolean);
    brands.forEach((b) => {
      chips.push({
        id: `brand-${b}`,
        label: `Brand: ${b}`,
        removeKey: 'brand',
        removeValue: b,
      });
    });
  }

  // Attribute chip (from faceted attributeSlug)
  if (filters.attributeSlug) {
    const parsed = SEOManager.parseAttributeSlug(filters.attributeSlug);
    chips.push({
      id: `attr-${filters.attributeSlug}`,
      label: parsed.displayName,
      removeKey: 'attributeSlug',
    });
  }

  // Availability chip (Oferte/onSale removed as requested)
  if (filters.inStock === 'true') {
    chips.push({
      id: 'inStock-true',
      label: 'Doar în stoc',
      removeKey: 'inStock',
    });
  }

  // Color chips
  const colors = filters.color?.split(',').filter(Boolean) ?? [];
  colors.forEach((col) => {
    chips.push({
      id: `color-${col}`,
      label: `Culoare: ${col.charAt(0).toUpperCase() + col.slice(1)}`,
      removeKey: 'color',
      removeValue: col,
    });
  });

  // Attribute chips
  const attrs = filters.attribute?.split(',').filter(Boolean) ?? [];
  attrs.forEach((attr) => {
    chips.push({
      id: `attribute-${attr}`,
      label: attr.charAt(0).toUpperCase() + attr.slice(1),
      removeKey: 'attribute',
      removeValue: attr,
    });
  });

  // Price chips
  if (filters.minPrice || filters.maxPrice) {
    const label =
      filters.minPrice && filters.maxPrice
        ? `${filters.minPrice}–${filters.maxPrice} Lei`
        : filters.minPrice
        ? `Min. ${filters.minPrice} Lei`
        : `Max. ${filters.maxPrice} Lei`;
    chips.push({
      id: `price-${filters.minPrice || '0'}-${filters.maxPrice || 'max'}`,
      label,
      removeKey: 'price',
    });
  }

  // Size chips
  const sizes = filters.sizes?.split(',').filter(Boolean) ?? [];
  sizes.forEach((size) => {
    chips.push({
      id: `size-${size}`,
      label: `Mărimea ${size}`,
      removeKey: 'size',
      removeValue: size,
    });
  });

  if (chips.length === 0) return null;

  function handleRemoveClick(chip: ChipItem) {
    if (isPending || removingId) return;
    setRemovingId(chip.id);

    // Wait for the fade-out exit animation before routing
    setTimeout(() => {
      executeRemove(chip.removeKey, chip.removeValue);
      setRemovingId(null);
    }, 150);
  }

  function executeRemove(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (key === 'category') {
      const current = (params.get('category') || filters.category || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const next = value ? current.filter((s) => s !== value) : [];

      startCatalogTransition(() => {
        if (next.length === 0) {
          router.push('/produse', { scroll: false });
        } else if (next.length === 1) {
          router.push(SEOManager.buildCategoryUrl(next[0]), { scroll: false });
        } else {
          params.set('category', next.join(','));
          router.push(`/produse?${params.toString()}`, { scroll: false });
        }
      });
      return;
    }

    if (key === 'brand') {
      const current = (params.get('brand') || effectiveBrand || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const next = value ? current.filter((b) => b.toLowerCase() !== value.toLowerCase()) : [];

      startCatalogTransition(() => {
        if (next.length === 0) {
          params.delete('brand');
          if (filters.brandSlug && filters.category && !filters.category.includes(',')) {
            const targetPath = SEOManager.buildFacetedCategoryUrl({
              categorySlug: filters.category,
              attributeSlug: filters.attributeSlug,
            });
            const queryStr = params.toString();
            router.push(queryStr ? `${targetPath}?${queryStr}` : targetPath, { scroll: false });
            return;
          }
        } else if (next.length === 1 && filters.category && !filters.category.includes(',')) {
          params.delete('brand');
          const targetPath = SEOManager.buildFacetedCategoryUrl({
            categorySlug: filters.category,
            brandSlug: SEOManager.toBrandSlug(next[0]),
            attributeSlug: filters.attributeSlug,
          });
          const queryStr = params.toString();
          router.push(queryStr ? `${targetPath}?${queryStr}` : targetPath, { scroll: false });
          return;
        } else {
          params.set('brand', next.join(','));
        }
        const queryStr = params.toString();
        const targetUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
        router.push(targetUrl, { scroll: false });
      });
      return;
    }

    if (filters.category && !filters.category.includes(',')) {
      if (key === 'attributeSlug') {
        const brandSlug =
          filters.brandSlug || (effectiveBrand ? SEOManager.toBrandSlug(effectiveBrand) : null);
        const targetPath = SEOManager.buildFacetedCategoryUrl({
          categorySlug: filters.category,
          brandSlug,
        });
        const queryStr = params.toString();
        const targetUrl = queryStr ? `${targetPath}?${queryStr}` : targetPath;
        startCatalogTransition(() => {
          router.push(targetUrl, { scroll: false });
        });
        return;
      }
    }

    if (key === 'inStock') params.delete('inStock');
    else if (key === 'onSale') params.delete('onSale');
    else if (key === 'color') {
      const current = params.get('color')?.split(',').filter(Boolean) ?? [];
      const next = current.filter((c) => c !== value);
      if (next.length === 0) params.delete('color');
      else params.set('color', next.join(','));
    } else if (key === 'attribute') {
      const current = params.get('attribute')?.split(',').filter(Boolean) ?? [];
      const next = current.filter((a) => a !== value);
      if (next.length === 0) params.delete('attribute');
      else params.set('attribute', next.join(','));
    } else if (key === 'price') {
      params.delete('minPrice');
      params.delete('maxPrice');
    } else if (key === 'size') {
      const current = params.get('sizes')?.split(',').filter(Boolean) ?? [];
      const next = current.filter((s) => s !== value);
      if (next.length === 0) params.delete('sizes');
      else params.set('sizes', next.join(','));
    }

    const queryStr = params.toString();
    const targetUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
    startCatalogTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  }

  function handleResetAll() {
    const search = searchParams.get('search');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const queryStr = params.toString();

    startCatalogTransition(() => {
      if (filters.category && !filters.category.includes(',')) {
        const base = SEOManager.buildCategoryUrl(filters.category);
        router.push(queryStr ? `${base}?${queryStr}` : base, { scroll: false });
      } else {
        router.push(queryStr ? `/produse?${queryStr}` : '/produse', { scroll: false });
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-[12px] text-slate-500 font-semibold tracking-tight">Filtre active:</span>
      {chips.map((chip) => {
        const isRemoving = removingId === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => handleRemoveClick(chip)}
            disabled={isPending}
            className={cn(
              'group flex items-center gap-1.5 text-[12px] font-semibold select-none',
              'bg-[#e6f4f5] text-[#0a6c74] border border-[#0a6c74]/25',
              'pl-3 pr-2 py-1 rounded-full shadow-2xs',
              'hover:bg-[#ffe4e6] hover:text-[#e11d48] hover:border-[#fecdd3]',
              'transition-colors duration-150',
              isRemoving ? 'animate-fade-out' : 'animate-scale-in'
            )}
          >
            <span>{chip.label}</span>
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center bg-[#0a6c74]/15 group-hover:bg-[#e11d48]/15 text-current transition-colors ml-0.5"
              aria-label="Șterge filtru"
            >
              <X size={10} className="stroke-[2.5]" />
            </span>
          </button>
        );
      })}

      {chips.length >= 2 && (
        <button
          type="button"
          onClick={handleResetAll}
          disabled={isPending}
          className="text-[11.5px] font-semibold text-slate-400 hover:text-[#e11d48] px-2 py-1 rounded-full transition-colors flex items-center gap-1 ml-1"
        >
          <RotateCcw size={11} />
          <span>Șterge toate</span>
        </button>
      )}
    </div>
  );
}
