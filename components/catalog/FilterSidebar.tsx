'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition, useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogCategory } from '@/lib/products';
import { SEOManager } from '@/lib/seo';
import { useCatalogLoading } from './CatalogLoadingContext';
import {
  getCategoryFilterConfig,
  STANDARD_COLORS,
  type ColorFilterOption,
  type AttributeFilterGroup,
} from '@/lib/categoryFiltersConfig';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Cele mai noi' },
  { value: 'rating',     label: 'Cel mai bine cotate' },
  { value: 'popular',    label: 'Popularitate' },
  { value: 'price_asc',  label: 'Preț crescător' },
  { value: 'price_desc', label: 'Preț descrescător' },
] as const;

// ============================================
//   FilterSidebar — Modern eMAG-style Filter Menu
//   Brand teal active color: #0a6c74
// ============================================

export interface FacetCounts {
  inStockCount?: number;
  onSaleCount?: number;
  brands?: { name: string; count: number }[];
}

interface FilterSidebarProps {
  categories: CatalogCategory[];
  availableSizes?: string[];
  currentFilters: {
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
  totalResults: number;
  facetCounts?: FacetCounts;
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

// Curated top brands with realistic product counts from database
const DEFAULT_CATALOG_BRANDS: { name: string; count: number }[] = [
  { name: 'TOPinStock', count: 26680 },
  { name: 'Victronic', count: 907 },
  { name: 'SPIN', count: 893 },
  { name: 'Grunberg', count: 726 },
  { name: 'Rosberg', count: 354 },
  { name: 'GOLDMANN', count: 275 },
  { name: 'Voltz', count: 257 },
  { name: 'Kitchen Tools', count: 189 },
  { name: 'Oliver Voltz', count: 187 },
  { name: 'Qlux', count: 45 },
  { name: 'Disney Frozen', count: 23 },
  { name: 'Splendor', count: 16 },
  { name: 'Tuffex', count: 14 },
  { name: 'Royalty Line', count: 12 },
  { name: 'Blueberg', count: 11 },
  { name: 'Sapir', count: 11 },
  { name: 'Zephyr', count: 9 },
  { name: 'Berlinger Haus', count: 8 },
  { name: 'Apple', count: 7 },
  { name: 'Desigual', count: 6 },
  { name: 'Opal', count: 5 },
];

const SLIDER_MIN = 0;
const SLIDER_MAX = 3000;

export default function FilterSidebar({
  categories,
  availableSizes = [],
  currentFilters,
  totalResults,
  facetCounts,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending: catalogPending, startCatalogTransition } = useCatalogLoading();
  const [localPending, startLocalTransition] = useTransition();
  const isPending = localPending || catalogPending;
  const startTransition = startCatalogTransition;

  // Mobile drawer and sort sheet state (lazy mounted to reduce DOM size)
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [hasOpenedMobile, setHasOpenedMobile] = useState(false);
  const [hasOpenedSort, setHasOpenedSort] = useState(false);

  const handleOpenMobile = useCallback(() => {
    setHasOpenedMobile(true);
    setMobileOpen(true);
  }, []);

  const handleOpenSort = useCallback(() => {
    setHasOpenedSort(true);
    setSortSheetOpen(true);
  }, []);

  // Lock body scroll when mobile drawer or sort sheet is open
  useEffect(() => {
    if (mobileOpen || sortSheetOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen, sortSheetOpen]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setSortSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Category-specific configuration (eMAG style)
  const categoryConfig = useMemo(() => {
    return getCategoryFilterConfig(currentFilters.category);
  }, [currentFilters.category]);

  // Accordion open/closed states (250ms smooth animated transitions)
  const [availExpanded, setAvailExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);
  const [catExpanded, setCatExpanded] = useState(true);
  const [brandExpanded, setBrandExpanded] = useState(true);
  const [colorExpanded, setColorExpanded] = useState(true);
  const [sizeExpanded, setSizeExpanded] = useState(false);
  const [openAttributes, setOpenAttributes] = useState<Record<string, boolean>>({});

  function isAttrOpen(id: string) {
    return openAttributes[id] ?? true;
  }

  function toggleAttr(id: string) {
    setOpenAttributes((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  }

  // Instant search input states
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  // Category subcategory expand/collapse states (keyed by category ID)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Active categories list (supports multiple categories)
  const selectedCategories = useMemo(() => {
    if (!currentFilters.category) return [];
    return currentFilters.category.split(',').map((s) => s.trim()).filter(Boolean);
  }, [currentFilters.category]);

  // Active colors list
  const selectedColors = useMemo(() => {
    if (!currentFilters.color) return [];
    return currentFilters.color.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
  }, [currentFilters.color]);

  // Active attributes list
  const selectedAttributes = useMemo(() => {
    if (!currentFilters.attribute) return [];
    return currentFilters.attribute.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean);
  }, [currentFilters.attribute]);

  // Auto-expand parent category if any of its children or itself is active
  useEffect(() => {
    if (selectedCategories.length > 0 && categories.length > 0) {
      const nextExpanded: Record<string, boolean> = {};
      categories.forEach((cat) => {
        const hasActiveChild = cat.children?.some((child) => selectedCategories.includes(child.slug));
        const isSelfActive = selectedCategories.includes(cat.slug);
        if (hasActiveChild || isSelfActive) {
          nextExpanded[cat.id] = true;
        }
      });
      setExpandedCategories((prev) => ({ ...prev, ...nextExpanded }));
    }
  }, [selectedCategories, categories]);

  // Active brand resolution
  const effectiveBrand =
    currentFilters.brand ||
    (currentFilters.brandSlug ? SEOManager.parseBrandSlug(currentFilters.brandSlug) : undefined);
  const effectiveBrandSlug =
    currentFilters.brandSlug || (effectiveBrand ? SEOManager.toBrandSlug(effectiveBrand) : null);

  const selectedBrands = useMemo(() => {
    if (!effectiveBrand) return [];
    return effectiveBrand.split(',').map((b) => b.trim()).filter(Boolean);
  }, [effectiveBrand]);

  // Combined brand list with product counts (uses dynamic category facets if available, plus category top brands)
  const displayBrands = useMemo(() => {
    const dbBrands = facetCounts?.brands && facetCounts.brands.length > 0 ? facetCounts.brands : [];
    const catBrands = (categoryConfig.topBrands || []).map((b) => ({ name: b.name, count: b.count || 0 }));

    const map = new Map<string, number>();
    dbBrands.forEach((b) => map.set(b.name.toLowerCase(), b.count));
    catBrands.forEach((b) => {
      const lower = b.name.toLowerCase();
      if (!map.has(lower)) {
        map.set(lower, b.count);
      }
    });

    if (map.size === 0) {
      DEFAULT_CATALOG_BRANDS.forEach((b) => map.set(b.name.toLowerCase(), b.count));
    }

    const list: { name: string; count: number }[] = [];
    map.forEach((count, lower) => {
      const orig =
        dbBrands.find((b) => b.name.toLowerCase() === lower)?.name ||
        catBrands.find((b) => b.name.toLowerCase() === lower)?.name ||
        DEFAULT_CATALOG_BRANDS.find((b) => b.name.toLowerCase() === lower)?.name ||
        lower;
      list.push({ name: orig, count });
    });

    // If active brand is not in list, add it at the top
    selectedBrands.forEach((sb) => {
      if (!list.some((b) => b.name.toLowerCase() === sb.toLowerCase())) {
        list.unshift({ name: sb, count: 1 });
      }
    });
    return list;
  }, [facetCounts?.brands, categoryConfig.topBrands, selectedBrands]);

  // Filtered brands based on search input
  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    if (!query) return displayBrands;
    return displayBrands.filter((b) => b.name.toLowerCase().includes(query));
  }, [displayBrands, brandSearch]);

  // Filtered categories based on search input
  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    if (!query) return categories;

    return categories
      .map((cat) => {
        const parentMatches = cat.name.toLowerCase().includes(query);
        const matchingChildren = cat.children?.filter((child) =>
          child.name.toLowerCase().includes(query)
        ) ?? [];

        if (parentMatches) {
          return cat;
        }
        if (matchingChildren.length > 0) {
          return {
            ...cat,
            children: matchingChildren,
          };
        }
        return null;
      })
      .filter(Boolean) as CatalogCategory[];
  }, [categories, categorySearch]);

  // Active sizes resolution
  const activeSizes = [...(currentFilters.sizes?.split(',').filter(Boolean) ?? [])];
  if (currentFilters.attributeSlug) {
    const parsedAttr = SEOManager.parseAttributeSlug(currentFilters.attributeSlug);
    if (parsedAttr.value && !activeSizes.includes(parsedAttr.value)) {
      activeSizes.push(parsedAttr.value);
    }
  }

  const currentCategory = currentFilters.category || '';
  const isFashionCat = /barbati|femei|imbracaminte|incaltaminte|pantofi|aditasi|geci|jachete|rochii|pantaloni|camasi|tricouri|sosete|fuste/i.test(currentCategory);

  const cleanAvailableSizes = (availableSizes || []).filter(
    (s) => s && typeof s === 'string' && !s.toLowerCase().includes('universal') && !s.toLowerCase().includes('diverse')
  );

  const displaySizes = cleanAvailableSizes.length > 0
    ? [...new Set(cleanAvailableSizes)]
    : (isFashionCat ? COMMON_SIZES : []);

  // Helper to update standard query params
  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete('page');
      const queryStr = params.toString();
      const targetUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      startTransition(() => {
        router.push(targetUrl, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  // ── Handlers ──────────────────────────────────────────────────

  function toggleCategoryExpand(id: string) {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function handleCategoryToggle(slug: string) {
    const isCurrentlySelected = selectedCategories.includes(slug);
    const nextCategories = isCurrentlySelected
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug];

    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (nextCategories.length === 0) {
      params.delete('category');
      startTransition(() => {
        const queryStr = params.toString();
        router.push(queryStr ? `/produse?${queryStr}` : '/produse', { scroll: false });
      });
    } else if (nextCategories.length === 1) {
      // Single category -> Clean SEO URL or query
      const singleSlug = nextCategories[0];
      params.delete('category');
      const queryStr = params.toString();
      const targetPath = SEOManager.buildCategoryUrl(singleSlug);
      startTransition(() => {
        router.push(queryStr ? `${targetPath}?${queryStr}` : targetPath, { scroll: false });
      });
    } else {
      // Multiple categories -> comma separated query on /produse
      params.set('category', nextCategories.join(','));
      startTransition(() => {
        router.push(`/produse?${params.toString()}`, { scroll: false });
      });
    }
  }

  function handleBrandToggle(brandName: string) {
    const isSelected = selectedBrands.some((b) => b.toLowerCase() === brandName.toLowerCase());
    const nextBrands = isSelected
      ? selectedBrands.filter((b) => b.toLowerCase() !== brandName.toLowerCase())
      : [...selectedBrands, brandName];

    // If currently on single category page and exactly 1 brand is selected -> Clean Faceted SEO URL
    if (currentFilters.category && !currentFilters.category.includes(',') && nextBrands.length <= 1) {
      const nextBrandSlug = nextBrands.length === 1 ? SEOManager.toBrandSlug(nextBrands[0]) : null;
      const nextAttributeSlug =
        currentFilters.attributeSlug ||
        (activeSizes.length === 1 ? SEOManager.toAttributeSlug(activeSizes[0], 'marime') : null);

      const targetPath = SEOManager.buildFacetedCategoryUrl({
        categorySlug: currentFilters.category,
        brandSlug: nextBrandSlug,
        attributeSlug: nextAttributeSlug,
      });

      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      params.delete('brand');
      if (activeSizes.length <= 1) params.delete('sizes');

      const queryStr = params.toString();
      const targetUrl = queryStr ? `${targetPath}?${queryStr}` : targetPath;
      startTransition(() => {
        router.push(targetUrl, { scroll: false });
      });
    } else if (currentFilters.category && !currentFilters.category.includes(',')) {
      // Multiple brands on single category: Route to base category URL with ?brand=Brand1,Brand2
      const baseCategoryPath = SEOManager.buildCategoryUrl(currentFilters.category);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      params.set('brand', nextBrands.join(','));
      const queryStr = params.toString();
      startTransition(() => {
        router.push(queryStr ? `${baseCategoryPath}?${queryStr}` : baseCategoryPath, { scroll: false });
      });
    } else {
      updateParam('brand', nextBrands.length > 0 ? nextBrands.join(',') : null);
    }
  }

  function handlePriceCommit(minVal: string, maxVal: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (minVal) params.set('minPrice', minVal);
    else params.delete('minPrice');

    if (maxVal) params.set('maxPrice', maxVal);
    else params.delete('maxPrice');

    params.delete('page');
    const queryStr = params.toString();
    const targetUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  }

  function handleInStockToggle() {
    const isActive = currentFilters.inStock === 'true';
    updateParam('inStock', isActive ? null : 'true');
  }

  function handleColorToggle(colorVal: string) {
    const lower = colorVal.toLowerCase();
    const isSelected = selectedColors.includes(lower);
    const next = isSelected
      ? selectedColors.filter((c) => c !== lower)
      : [...selectedColors, lower];
    updateParam('color', next.length > 0 ? next.join(',') : null);
  }

  function handleAttributeToggle(attrVal: string) {
    const lower = attrVal.toLowerCase();
    const isSelected = selectedAttributes.includes(lower);
    const next = isSelected
      ? selectedAttributes.filter((a) => a !== lower)
      : [...selectedAttributes, lower];
    updateParam('attribute', next.length > 0 ? next.join(',') : null);
  }

  function handleSizeToggle(size: string) {
    const current = new Set(activeSizes);
    if (current.has(size)) current.delete(size);
    else current.add(size);
    const nextSizes = Array.from(current);

    if (currentFilters.category && !currentFilters.category.includes(',')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');

      if (nextSizes.length === 1) {
        const nextAttrSlug = SEOManager.toAttributeSlug(nextSizes[0], 'marime');
        params.delete('sizes');
        const targetPath = SEOManager.buildFacetedCategoryUrl({
          categorySlug: currentFilters.category,
          brandSlug: effectiveBrandSlug,
          attributeSlug: nextAttrSlug,
        });
        const queryStr = params.toString();
        startTransition(() => {
          router.push(queryStr ? `${targetPath}?${queryStr}` : targetPath, { scroll: false });
        });
      } else if (nextSizes.length === 0) {
        params.delete('sizes');
        const targetPath = SEOManager.buildFacetedCategoryUrl({
          categorySlug: currentFilters.category,
          brandSlug: effectiveBrandSlug,
        });
        const queryStr = params.toString();
        startTransition(() => {
          router.push(queryStr ? `${targetPath}?${queryStr}` : targetPath, { scroll: false });
        });
      } else {
        params.set('sizes', nextSizes.join(','));
        const targetPath = SEOManager.buildFacetedCategoryUrl({
          categorySlug: currentFilters.category,
          brandSlug: effectiveBrandSlug,
        });
        const queryStr = params.toString();
        startTransition(() => {
          router.push(queryStr ? `${targetPath}?${queryStr}` : targetPath, { scroll: false });
        });
      }
    } else {
      const joined = nextSizes.join(',');
      updateParam('sizes', joined || null);
    }
  }

  function handleReset() {
    setCategorySearch('');
    setBrandSearch('');

    const search = searchParams.get('search');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const queryStr = params.toString();

    if (currentFilters.category && !currentFilters.category.includes(',')) {
      const base = SEOManager.buildCategoryUrl(currentFilters.category);
      startTransition(() => {
        router.push(queryStr ? `${base}?${queryStr}` : base, { scroll: false });
      });
    } else {
      startTransition(() => {
        router.push(queryStr ? `/produse?${queryStr}` : '/produse', { scroll: false });
      });
    }
  }

  const hasFilters = !!(
    selectedCategories.length > 0 ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    activeSizes.length > 0 ||
    selectedBrands.length > 0 ||
    selectedColors.length > 0 ||
    selectedAttributes.length > 0 ||
    currentFilters.inStock
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += selectedCategories.length;
    count += selectedBrands.length;
    count += activeSizes.length;
    count += selectedColors.length;
    count += selectedAttributes.length;
    if (currentFilters.minPrice || currentFilters.maxPrice) count += 1;
    if (currentFilters.inStock === 'true') count += 1;
    return count;
  }, [
    selectedCategories.length,
    selectedBrands.length,
    activeSizes.length,
    selectedColors.length,
    selectedAttributes.length,
    currentFilters.minPrice,
    currentFilters.maxPrice,
    currentFilters.inStock,
  ]);

  const currentSort = currentFilters.sort || searchParams.get('sort') || 'newest';
  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === currentSort)?.label || 'Cele mai noi';

  // ── Filter Accordions Content (Shared by Desktop & Mobile Drawer) ──
  const filterAccordionsContent = (
    <div className={cn('space-y-0 text-[#1e293b]', isPending && 'opacity-60 pointer-events-none transition-opacity')}>
      {/* 2. Acordeon: Disponibilitate */}
      <FilterAccordion
        title="Disponibilitate"
        expanded={availExpanded}
        onToggle={() => setAvailExpanded((v) => !v)}
      >
        <div className="space-y-1 pt-1">
          {/* In Stock Checkbox */}
          <TopCheckbox
            id="filter-in-stock"
            checked={currentFilters.inStock === 'true'}
            onChange={handleInStockToggle}
            label="Doar produse în stoc"
            count={facetCounts?.inStockCount}
          />
        </div>
      </FilterAccordion>

      {/* 3. Acordeon: Preț (Dual Range Slider & Inputs) */}
      <FilterAccordion
        title="Preț"
        expanded={priceExpanded}
        onToggle={() => setPriceExpanded((v) => !v)}
      >
        <DualPriceSlider
          minPrice={currentFilters.minPrice ?? ''}
          maxPrice={currentFilters.maxPrice ?? ''}
          onCommit={handlePriceCommit}
        />
      </FilterAccordion>

      {/* 4. Acordeon: Categorii (cu mini-input căutare, checkbox-uri, expand/collapse & counts) */}
      <FilterAccordion
        title="Categorii"
        badge={
          selectedCategories.length > 0 ? (
            <span className="text-[10px] font-bold bg-[#0a6c74] text-white px-1.5 py-0.2 rounded-full">
              {selectedCategories.length}
            </span>
          ) : undefined
        }
        expanded={catExpanded}
        onToggle={() => setCatExpanded((v) => !v)}
      >
        <div className="pt-1">
          {/* Mini-input Căutare Categorie */}
          <div className="relative mb-2.5">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Caută categorie..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-[12px] bg-slate-50 hover:bg-slate-100/70 focus:bg-white
                         border border-slate-200 focus:border-[#0a6c74] rounded-lg outline-none
                         focus:ring-2 focus:ring-[#0a6c74]/15 transition-all text-[#1e293b] placeholder:text-slate-400"
            />
            {categorySearch && (
              <button
                type="button"
                onClick={() => setCategorySearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Șterge căutarea"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Lista de Categorii */}
          <div
            className="space-y-0.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar"
            style={{ maxHeight: '280px', overflowY: 'auto' }}
          >
            {filteredCategories.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">Nicio categorie găsită</p>
            ) : (
              filteredCategories.map((cat) => {
                const hasChildren = cat.children && cat.children.length > 0;
                const isExpanded = categorySearch.trim().length > 0 || (expandedCategories[cat.id] ?? false);
                const isParentChecked = selectedCategories.includes(cat.slug);

                return (
                  <div key={cat.id} className="space-y-0.5">
                    <div className="flex items-center gap-0.5">
                      {/* Expand / Collapse button for parent category */}
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoryExpand(cat.id);
                          }}
                          className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-[#0a6c74] hover:bg-slate-100 rounded transition-colors flex-shrink-0 cursor-pointer"
                          title={isExpanded ? 'Ascunde subcategorii' : 'Afișează subcategorii'}
                          aria-label="Comută subcategorii"
                        >
                          <ChevronRight
                            size={13}
                            strokeWidth={2.5}
                            className={cn(
                              'transition-transform duration-200',
                              isExpanded ? 'rotate-90 text-[#0a6c74]' : 'rotate-0'
                            )}
                          />
                        </button>
                      ) : (
                        <div className="w-5 flex-shrink-0" />
                      )}

                      {/* Parent Category Checkbox */}
                      <div className="flex-1 min-w-0">
                        <TopCheckbox
                          id={`cat-${cat.id}`}
                          checked={isParentChecked}
                          onChange={() => handleCategoryToggle(cat.slug)}
                          label={cat.name}
                          count={cat.count}
                        />
                      </div>
                    </div>

                    {/* Subcategorii indentate frumos în dreapta cu linie verticală de ghidaj */}
                    {hasChildren && isExpanded && (
                      <div className="ml-5 pl-2.5 border-l-2 border-slate-100/90 space-y-0.5 mt-0.5 mb-1.5 animate-in fade-in duration-150">
                        {cat.children.map((child) => (
                          <TopCheckbox
                            key={child.id}
                            id={`child-${child.id}`}
                            checked={selectedCategories.includes(child.slug)}
                            onChange={() => handleCategoryToggle(child.slug)}
                            label={child.name}
                            count={child.count}
                            className="py-1"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </FilterAccordion>

      {/* 5. Acordeon: Branduri (cu mini-input căutare, checkbox-uri, counts & highlight) */}
      <FilterAccordion
        title="Branduri"
        badge={
          selectedBrands.length > 0 ? (
            <span className="text-[10px] font-bold bg-[#0a6c74] text-white px-1.5 py-0.2 rounded-full">
              {selectedBrands.length}
            </span>
          ) : undefined
        }
        expanded={brandExpanded}
        onToggle={() => setBrandExpanded((v) => !v)}
      >
        <div className="pt-1">
          {/* Mini-input Căutare Brand */}
          <div className="relative mb-2.5">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Caută brand..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-[12px] bg-slate-50 hover:bg-slate-100/70 focus:bg-white
                         border border-slate-200 focus:border-[#0a6c74] rounded-lg outline-none
                         focus:ring-2 focus:ring-[#0a6c74]/15 transition-all text-[#1e293b] placeholder:text-slate-400"
            />
            {brandSearch && (
              <button
                type="button"
                onClick={() => setBrandSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Șterge căutarea"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Lista de Branduri cu Checkbox-uri & Highlight #f0fdfa */}
          <div
            className="space-y-0.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar"
            style={{ maxHeight: '260px', overflowY: 'auto' }}
          >
            {filteredBrands.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">Niciun brand găsit</p>
            ) : (
              filteredBrands.map((b) => {
                const isSelected = selectedBrands.some(
                  (sb) => sb.toLowerCase() === b.name.toLowerCase()
                );
                return (
                  <TopCheckbox
                    key={b.name}
                    id={`brand-${b.name}`}
                    checked={isSelected}
                    onChange={() => handleBrandToggle(b.name)}
                    label={b.name}
                    count={b.count}
                  />
                );
              })
            )}
          </div>
        </div>
      </FilterAccordion>

      {/* 5b. Acordeon: Culoare (cu buline de culoare eMAG style) */}
      <FilterAccordion
        title="Culoare"
        badge={
          selectedColors.length > 0 ? (
            <span className="text-[10px] font-bold bg-[#0a6c74] text-white px-1.5 py-0.2 rounded-full">
              {selectedColors.length}
            </span>
          ) : undefined
        }
        expanded={colorExpanded}
        onToggle={() => setColorExpanded((v) => !v)}
      >
        <div className="space-y-0.5 pt-1 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
          {categoryConfig.colors.map((col) => {
            const isChecked = selectedColors.includes(col.value.toLowerCase());
            return (
              <TopCheckbox
                key={col.value}
                id={`color-${col.value}`}
                checked={isChecked}
                onChange={() => handleColorToggle(col.value)}
                label={
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs border',
                        col.border ? 'border-slate-300' : 'border-black/10'
                      )}
                      style={{
                        background: col.isGradient
                          ? 'linear-gradient(135deg, #f43f5e, #3b82f6, #10b981)'
                          : col.hex,
                      }}
                    />
                    <span>{col.name}</span>
                  </span>
                }
              />
            );
          })}
        </div>
      </FilterAccordion>

      {/* 5c. Acordeoane Dinamice: Atribute specifice categoriei (Material, Sursă căldură, Tip, etc.) */}
      {categoryConfig.attributes.map((attrGroup) => {
        const isExpanded = isAttrOpen(attrGroup.id);
        const activeInGroup = attrGroup.options.filter((opt) =>
          selectedAttributes.includes(opt.value.toLowerCase())
        );

        return (
          <FilterAccordion
            key={attrGroup.id}
            title={attrGroup.title}
            badge={
              activeInGroup.length > 0 ? (
                <span className="text-[10px] font-bold bg-[#0a6c74] text-white px-1.5 py-0.2 rounded-full">
                  {activeInGroup.length}
                </span>
              ) : undefined
            }
            expanded={isExpanded}
            onToggle={() => toggleAttr(attrGroup.id)}
          >
            <div className="space-y-0.5 pt-1 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {attrGroup.options.map((opt) => {
                const isChecked = selectedAttributes.includes(opt.value.toLowerCase());
                return (
                  <TopCheckbox
                    key={opt.value}
                    id={`attr-${attrGroup.id}-${opt.value}`}
                    checked={isChecked}
                    onChange={() => handleAttributeToggle(opt.value)}
                    label={opt.label}
                  />
                );
              })}
            </div>
          </FilterAccordion>
        );
      })}

      {/* 6. Mărimi (dacă există în catalog) */}
      {displaySizes.length > 0 && (
        <FilterAccordion
          title="Mărimi"
          expanded={sizeExpanded}
          onToggle={() => setSizeExpanded((v) => !v)}
        >
          <div className="flex flex-wrap gap-1.5 pt-1">
            {displaySizes.map((size) => {
              const isSelected = activeSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={cn(
                    'min-w-[36px] h-[32px] px-2 rounded-lg text-[12px] font-semibold border transition-all duration-150 cursor-pointer',
                    isSelected
                      ? 'bg-[#0a6c74] text-white border-[#0a6c74] shadow-xs'
                      : 'border-slate-200 text-[#1e293b] hover:border-[#0a6c74] hover:text-[#0a6c74] hover:bg-[#f0fdfa] bg-white'
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}
    </div>
  );

  return (
    <>
      {/* ── Compact Sticky Mobile Bar (< 1024px) ── */}
      <div
        className="lg:hidden sticky top-[120px] z-30 w-full mb-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-1.5 transition-all"
        style={{
          boxShadow: '0 2px 12px -2px rgba(10, 108, 116, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="flex items-center gap-1.5">
          {/* Buton Filtrează (cu badge pentru numărul de filtre active) */}
          <button
            type="button"
            onClick={handleOpenMobile}
            id="mobile-filter-trigger"
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-bold transition-all duration-150 cursor-pointer select-none active:scale-[0.98]',
              activeFilterCount > 0
                ? 'bg-[#0a6c74]/10 text-[#0a6c74] border border-[#0a6c74]/25 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80'
            )}
          >
            <SlidersHorizontal size={15} className="text-[#0a6c74] stroke-[2.5]" />
            <span>Filtrează</span>
            {activeFilterCount > 0 && (
              <span className="min-w-[19px] h-[19px] px-1.5 rounded-full text-[10.5px] font-black bg-[#0a6c74] text-white flex items-center justify-center leading-none shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 flex-shrink-0" />

          {/* Buton Sortează */}
          <button
            type="button"
            onClick={handleOpenSort}
            id="mobile-sort-trigger"
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-bold transition-all duration-150 cursor-pointer select-none min-w-0 active:scale-[0.98]',
              currentSort && currentSort !== 'newest'
                ? 'bg-[#0a6c74]/10 text-[#0a6c74] border border-[#0a6c74]/25 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80'
            )}
          >
            <ArrowUpDown size={14} className="text-[#0a6c74] stroke-[2.5] flex-shrink-0" />
            <span>Sortează</span>
            {currentSort && currentSort !== 'newest' && (
              <span className="w-2 h-2 rounded-full bg-[#0a6c74] flex-shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Off-Canvas Filter Drawer (Slide-over din stânga) ── */}
      {/* Backdrop întunecat cu backdrop-filter: blur(4px) */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-[4px] transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer lateral cu animație fluidă de slide-in din stânga */}
      <aside
        id="mobile-filter-drawer"
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[340px] sm:max-w-[380px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Filtrează produsele"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0a6c74]/10 flex items-center justify-center text-[#0a6c74]">
              <SlidersHorizontal size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-[#1e293b] text-[15px] tracking-tight block">
                Filtrează produsele
              </span>
              <span className="text-[11px] text-slate-400 font-medium block">
                {totalResults.toLocaleString('ro-RO')} {totalResults === 1 ? 'produs găsit' : 'produse găsite'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11.5px] font-semibold text-[#e11d48] bg-[#fff1f2] hover:bg-[#ffe4e6] px-2.5 py-1 rounded-lg border border-[#fecdd3]/60 transition-colors cursor-pointer"
              >
                Resetează
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Închide meniul de filtre"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Body - Scrollable accordions (only rendered when drawer is opened) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
          {(mobileOpen || hasOpenedMobile) && filterAccordionsContent}
        </div>

        {/* Buton fix în partea de jos a drawer-ului: „Vezi X produse” (#0a6c74) care închide meniul */}
        <div
          className="p-3.5 border-t border-slate-100 bg-white flex-shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            id="mobile-drawer-apply-btn"
            className="w-full py-3.5 px-4 rounded-xl font-bold text-[14px] text-white bg-[#0a6c74] hover:bg-[#08565c] active:scale-[0.99] transition-all shadow-md shadow-[#0a6c74]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>Vezi {totalResults.toLocaleString('ro-RO')} {totalResults === 1 ? 'produs' : 'produse'}</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Sort Sheet (Slides up from bottom) ── */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-[4px] transition-opacity duration-300',
          sortSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSortSheetOpen(false)}
        aria-hidden="true"
      />

      <div
        className={cn(
          'lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          sortSheetOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        role="dialog"
        aria-modal="true"
        aria-label="Sortează produsele"
      >
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={17} className="text-[#0a6c74] stroke-[2.5]" />
            <span className="font-extrabold text-[#1e293b] text-[16px]">Sortează după</span>
          </div>
          <button
            type="button"
            onClick={() => setSortSheetOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Închide sortarea"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto pb-6">
          {(sortSheetOpen || hasOpenedSort) && SORT_OPTIONS.map((opt) => {
            const isSelected = currentSort === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('sort', opt.value);
                  params.delete('page');
                  startTransition(() => {
                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
                  });
                  setSortSheetOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between p-3.5 rounded-xl text-left text-[14px] font-medium transition-all duration-150 cursor-pointer',
                  isSelected
                    ? 'bg-[#0a6c74]/10 text-[#0a6c74] font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#0a6c74] text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Sticky Sidebar ── */}
      <aside
        id="filter-sidebar"
        className="hidden lg:block w-[260px] flex-shrink-0 self-start sticky top-6 bg-white rounded-2xl p-4.5 border border-slate-100 shadow-sm custom-scrollbar"
        style={{
          position: 'sticky',
          top: '24px',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          boxShadow: '0 2px 14px -2px rgba(10, 108, 116, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Desktop Header Filtre */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0a6c74]/10 flex items-center justify-center text-[#0a6c74]">
              <SlidersHorizontal size={15} className="stroke-[2.5]" />
            </div>
            <span className="font-bold text-[#1e293b] text-[15px] tracking-tight">Filtre</span>
          </div>
          <span className="text-[12px] text-slate-400 font-medium bg-slate-100/80 px-2.5 py-0.5 rounded-full">
            {totalResults.toLocaleString('ro-RO')} {totalResults === 1 ? 'produs' : 'produse'}
          </span>
        </div>

        {/* Buton Resetează filtrele pe desktop */}
        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 mt-3 mb-1 text-[12px]
                       font-semibold text-[#e11d48] bg-[#fff1f2] hover:bg-[#ffe4e6] hover:text-[#be123c]
                       border border-[#fecdd3]/60 rounded-xl py-2 px-3 transition-all duration-200 ease-in-out shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw size={12} className="stroke-[2.5]" />
            <span>Resetează filtrele</span>
          </button>
        )}

        {filterAccordionsContent}
      </aside>
    </>
  );
}

// ============================================
//   Subcomponent: Animated Filter Accordion
//   Smooth height animation (250ms grid transition)
//   and chevron rotating 180 degrees
// ============================================

function FilterAccordion({
  title,
  badge,
  expanded,
  onToggle,
  children,
  className,
}: {
  title: string;
  badge?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('pt-4 border-t border-slate-100', className)}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-1 group select-none cursor-pointer text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-bold text-[#1e293b] uppercase tracking-wider group-hover:text-[#0a6c74] transition-colors">
            {title}
          </span>
          {badge}
        </div>
        <ChevronDown
          size={15}
          className={cn(
            'text-slate-400 group-hover:text-[#0a6c74] transition-transform duration-250 ease-in-out',
            expanded ? 'rotate-180 text-[#0a6c74]' : 'rotate-0'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-250 ease-in-out',
          expanded ? 'grid-rows-[1fr] opacity-100 mt-2.5' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

// ============================================
//   Subcomponent: Modern TOPinStock Checkbox
//   Fundal teal #0a6c74 la bifare, hover #f0fdfa
// ============================================

function TopCheckbox({
  checked,
  onChange,
  label,
  count,
  id,
  className,
}: {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
  count?: number;
  id?: string;
  className?: string;
}) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      id={id}
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange();
        }
      }}
      className={cn(
        'group flex items-center justify-between w-full py-1.5 px-2 rounded-lg cursor-pointer select-none transition-all duration-150',
        checked ? 'bg-[#0a6c74]/5 text-[#0a6c74]' : 'hover:bg-[#f0fdfa] text-slate-700',
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-1 flex-1">
        <div
          className={cn(
            'w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all duration-200 border',
            checked
              ? 'bg-[#0a6c74] border-[#0a6c74] text-white shadow-xs scale-100'
              : 'bg-white border-slate-300 group-hover:border-[#0a6c74]/80'
          )}
        >
          {checked && (
            <Check
              size={12}
              strokeWidth={3}
              className="text-white animate-in zoom-in-75 duration-150"
            />
          )}
        </div>
        <span
          className={cn(
            'text-[13px] leading-tight truncate transition-colors',
            checked ? 'font-semibold text-[#0a6c74]' : 'font-normal text-slate-700 group-hover:text-[#0a6c74]'
          )}
        >
          {label}
        </span>
      </div>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'text-[11px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1.5 transition-colors',
            checked
              ? 'bg-[#0a6c74]/15 text-[#0a6c74] font-semibold'
              : 'bg-slate-100 text-slate-400 group-hover:bg-[#0a6c74]/10 group-hover:text-[#0a6c74]'
          )}
        >
          {count.toLocaleString('ro-RO')}
        </span>
      )}
    </div>
  );
}

// ============================================
//   Subcomponent: Dual Range Slider & Price Inputs
// ============================================

function DualPriceSlider({
  minPrice,
  maxPrice,
  onCommit,
}: {
  minPrice: string;
  maxPrice: string;
  onCommit: (min: string, max: string) => void;
}) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMax(maxPrice);
  }, [maxPrice]);

  const numMin = localMin === '' ? SLIDER_MIN : Math.max(SLIDER_MIN, Number(localMin) || 0);
  const numMax = localMax === '' ? SLIDER_MAX : Math.min(SLIDER_MAX, Number(localMax) || SLIDER_MAX);

  const minPercent = Math.min(100, Math.max(0, ((numMin - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((numMax - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100));

  function handleMinSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.min(Number(e.target.value), numMax - 10);
    setLocalMin(val <= SLIDER_MIN ? '' : String(val));
  }

  function handleMaxSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.max(Number(e.target.value), numMin + 10);
    setLocalMax(val >= SLIDER_MAX ? '' : String(val));
  }

  function handleCommit() {
    onCommit(localMin, localMax);
  }

  return (
    <div className="space-y-3.5 pt-1">
      {/* Visual Dual Range Slider Bar */}
      <div className="relative h-6 flex items-center px-1">
        {/* Track background */}
        <div className="absolute left-1 right-1 h-1.5 bg-slate-200 rounded-full" />
        {/* Active Highlight Bar in #0a6c74 */}
        <div
          className="absolute h-1.5 bg-[#0a6c74] rounded-full transition-all duration-75"
          style={{
            left: `calc(4px + ${minPercent * 0.94}%)`,
            width: `calc(${Math.max(0, maxPercent - minPercent) * 0.94}%)`,
          }}
        />

        {/* Dual Range Thumb Inputs */}
        <div className="dual-range-slider absolute inset-x-0 h-6 flex items-center">
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={10}
            value={numMin}
            onChange={handleMinSliderChange}
            onPointerUp={handleCommit}
            onTouchEnd={handleCommit}
            className="z-20 cursor-pointer"
            aria-label="Preț minim"
          />
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={10}
            value={numMax}
            onChange={handleMaxSliderChange}
            onPointerUp={handleCommit}
            onTouchEnd={handleCommit}
            className="z-20 cursor-pointer"
            aria-label="Preț maxim"
          />
        </div>
      </div>

      {/* Numeric Min / Max Inputs */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            placeholder="Min Lei"
            value={localMin}
            min={0}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0a6c74] rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#1e293b] outline-none focus:ring-2 focus:ring-[#0a6c74]/15 transition-all text-center"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold pointer-events-none">Lei</span>
        </div>
        <span className="text-slate-400 text-xs font-semibold flex-shrink-0">—</span>
        <div className="relative flex-1">
          <input
            type="number"
            placeholder="Max Lei"
            value={localMax}
            min={0}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0a6c74] rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#1e293b] outline-none focus:ring-2 focus:ring-[#0a6c74]/15 transition-all text-center"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold pointer-events-none">Lei</span>
        </div>
      </div>

      {/* Quick Price Presets */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {[
          { label: 'Sub 100 Lei', min: '', max: '100' },
          { label: '100–300 Lei', min: '100', max: '300' },
          { label: '300–600 Lei', min: '300', max: '600' },
          { label: 'Peste 600 Lei', min: '600', max: '' },
        ].map((preset) => {
          const isActive = localMin === preset.min && localMax === preset.max;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setLocalMin(preset.min);
                setLocalMax(preset.max);
                onCommit(preset.min, preset.max);
              }}
              className={cn(
                'text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all duration-150',
                isActive
                  ? 'bg-[#0a6c74] text-white border-[#0a6c74] shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:border-[#0a6c74] hover:text-[#0a6c74] hover:bg-[#f0fdfa] bg-white'
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
