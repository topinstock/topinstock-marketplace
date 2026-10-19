'use client';

import { Search, X, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { SEOManager } from '@/lib/seo';

// ============================================
//   SearchBar — Bara de căutare cu live search
//   - Dropdown cu top 5-6 sugestii instant
//   - Imagine produs + preț + categorie în dropdown
//   - Popular searches dacă query-ul e gol
//   - Clear button + keyboard navigation (ESC)
// ============================================

const POPULAR_SEARCHES = [
  'oale inox',
  'calorifer victronic',
  'rucsac desigual',
  'masina tocat',
  'bicicleta copii',
  'tigaie granit',
];

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string;
  category: string | null;
  stock: number;
}

const CATEGORIES = [
  { label: 'Toate categoriile', slug: '' },
  { label: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  { label: 'Electrocasnice', slug: 'electrocasnice' },
  { label: 'Jucării & Copii', slug: 'copii-jucarii' },
  { label: 'Rucsacuri & Genți', slug: 'genti-accesorii' },
  { label: 'Oale & Cratițe', slug: 'oale' },
  { label: 'Încălzire Locuință', slug: 'calorifere-tip-panou' },
];

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState(searchParams?.get('search') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') ?? '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live results with debounce
  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(val), 280);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('search', trimmed);
    if (selectedCategory) params.set('category', selectedCategory);
    setIsOpen(false);
    router.push(`/produse?${params.toString()}`);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleFocus() {
    setIsOpen(true);
  }

  function handlePopularClick(term: string) {
    setQuery(term);
    setIsOpen(false);
    const params = new URLSearchParams();
    params.set('search', term);
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/produse?${params.toString()}`);
  }

  // Close dropdown on outside click or ESC
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showDropdown = isOpen && (query.length === 0 || results.length > 0 || isLoading);
  const discountPercent = (p: SearchResult) =>
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

  return (
    <div className="w-full relative" id="search-bar-wrapper">
      <form onSubmit={handleSearch} className="w-full">
        <div
          className="flex items-center rounded-full overflow-hidden bg-white transition-all duration-200"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          {/* Category selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-100 border-none border-r border-gray-200 px-3.5
                       text-[13px] font-medium text-gray-700 cursor-pointer
                       outline-none min-w-[125px] h-[46px] hidden sm:block"
            aria-label="Selectați categoria"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.label} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Search input container */}
          <div className="flex-1 relative flex items-center min-w-0">
            <input
              ref={inputRef}
              type="text"
              id="searchInput"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder="Căutați produse, mărci sau categorii..."
              className="w-full border-none pl-4 pr-9 py-3 text-[14px] font-sans
                         text-gray-900 bg-white outline-none
                         placeholder:text-gray-400"
              aria-label="Căutați produse"
              autoComplete="off"
            />

            {/* Clear button */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Șterge căutarea"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Search button */}
          <button
            type="submit"
            id="searchBtn"
            className="bg-gradient-to-r from-[#F5436A] to-[#C03653] hover:from-[#C03653] hover:to-[#A02B44] text-white px-5 h-[46px] flex items-center justify-center transition-all duration-150 flex-shrink-0 font-bold gap-1 shadow-sm"
            aria-label="Căutați"
          >
            <Search size={18} strokeWidth={2.5} />
            <span className="text-xs hidden md:inline ml-1">Caută</span>
          </button>
        </div>
      </form>

      {/* ── Live Search Dropdown ── */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-dropdown"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ maxHeight: '420px' }}
        >
          {/* Loading shimmer */}
          {isLoading && (
            <div className="px-4 py-3 flex items-center gap-2 text-gray-400 text-sm">
              <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              <span>Se caută...</span>
            </div>
          )}

          {/* Results list */}
          {!isLoading && results.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Produse găsite
                </span>
                <button
                  type="button"
                  onClick={handleSearch as any}
                  className="text-[11px] text-orange-600 font-bold hover:underline flex items-center gap-0.5"
                >
                  Vezi toate <ChevronRight size={12} />
                </button>
              </div>
              <ul>
                {results.map((product) => {
                  const disc = discountPercent(product);
                  return (
                    <li key={product.id}>
                      <Link
                        href={SEOManager.buildProductUrl({ slug: product.slug, id: product.id })}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50/60 transition-colors group"
                      >
                        {/* Product image */}
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-white flex-shrink-0 relative border border-gray-100 p-1 flex items-center justify-center">
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            sizes="44px"
                            className="object-contain object-center"
                          />
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 truncate group-hover:text-orange-700 transition-colors">
                            {product.title}
                          </p>
                          {product.category && (
                            <p className="text-[11px] text-gray-400">{product.category}</p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-[14px] font-extrabold text-gray-900">
                            {product.price % 1 === 0 ? product.price.toLocaleString('ro-RO') : product.price.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LEI
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {/* Footer: full search link */}
              <div className="border-t border-gray-100 px-4 py-2.5">
                <button
                  type="button"
                  onClick={handleSearch as any}
                  className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-orange-600 hover:text-orange-700 py-1 transition-colors"
                >
                  <Search size={14} />
                  Caută &ldquo;{query}&rdquo; în toate produsele
                </button>
              </div>
            </>
          )}

          {/* No results */}
          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-5 text-center">
              <p className="text-[13px] font-semibold text-gray-500">
                Niciun produs găsit pentru &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Încearcă un alt termen</p>
            </div>
          )}

          {/* Popular searches when empty */}
          {query.length === 0 && !isLoading && (
            <div className="px-4 py-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp size={12} /> Căutări populare
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handlePopularClick(term)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium
                               bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                  >
                    <Clock size={11} className="text-gray-400" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
