'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Sliders,
  ShieldCheck,
  Check,
  Star,
  ThumbsUp,
  MessageSquarePlus,
  BadgeCheck,
  Sparkles,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogProduct } from '@/lib/products';
import { generateProductReviews, calculateReviewStats, type ReviewItem } from '@/lib/reviews';

interface ProductTabsProps {
  product: CatalogProduct;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'return' | 'reviews'>('desc');

  // Base deterministic reviews generated for this product matching product.reviewsCount
  const baseReviews = useMemo(() => {
    return generateProductReviews(product);
  }, [product.id, product.title, product.category, product.vendor, product.rating, product.reviewsCount]);

  // User-submitted reviews state
  const [userReviews, setUserReviews] = useState<ReviewItem[]>([]);
  const reviewsList = useMemo(() => [...userReviews, ...baseReviews], [userReviews, baseReviews]);

  // Progressive review display (8 initially, with pagination and view-all)
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [userLikesDelta, setUserLikesDelta] = useState<Record<string, number>>({});

  const isFashionOrApparel =
    /barbati|femei|imbracaminte|incaltaminte|pantofi|aditasi|geci|jachete|rochii|pantaloni|camasi|tricouri|sosete|fuste|lenjerie/i.test(product.category?.slug || '') ||
    /barbati|femei|imbracaminte|incaltaminte|pantofi|aditasi|geci|jachete|rochii|pantaloni|camasi|tricouri|sosete|fuste/i.test(product.category?.name || '');

  const validSizes = Array.isArray(product.sizes)
    ? product.sizes.filter(
        (s) => s && typeof s === 'string' && !s.toLowerCase().includes('universal') && !s.toLowerCase().includes('diverse')
      )
    : [];
  const showSizes = validSizes.length > 0 && (isFashionOrApparel || validSizes.some(s => /^\d+(\.\d+)?\s*(l|ml|kg|g|w|v|ah|mm|cm|m)$/i.test(s)));

  const INVALID_COLOR_WORDS = new Set([
    'diverse', 'universal', 'oem', 'victronic', 'grünberg', 'grunberg', 'bohmann',
    'berlinger', 'berlinger haus', 'cheffinger', 'royalty line', 'bachmayer', 'joma',
    'heinner', 'desigual', 'splendor', 'blueberg', 'veinira', 'crofton', 'delight',
    'kids', 'jolly kids', 'tuffex', 'national', 'sannea', 'standard'
  ]);
  const validColors = Array.isArray(product.colors)
    ? product.colors.filter((c) => {
        if (!c || typeof c !== 'string') return false;
        const lower = c.trim().toLowerCase();
        if (INVALID_COLOR_WORDS.has(lower)) return false;
        if (product.vendor?.storeName && lower === product.vendor.storeName.toLowerCase()) return false;
        return true;
      })
    : [];
  const showColors = validColors.length > 0;

  const stats = useMemo(() => {
    return calculateReviewStats(reviewsList, product.rating && product.rating > 0 ? product.rating : 4.8);
  }, [reviewsList, product.rating]);

  const parsedAttributeEntries: Array<[string, any]> = (() => {
    try {
      if (!product.attributes) return [];
      const parsed = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes;
      if (!parsed || typeof parsed !== 'object') return [];
      return Object.entries(parsed)
        .filter(([k, v]) => v != null && v !== '' && k !== 'sourceUrl' && k !== 'sursa' && k !== 'source')
        .map(([k, v]) => {
          let label = k;
          const kLower = k.toLowerCase();
          if (kLower === 'brand') label = 'Brand / Marcă';
          else if (kLower === 'garantie' || kLower === 'garanție') {
            return ['Garanție', 'Oferită de către furnizor (conform website-ului furnizorului)'];
          }
          else if (kLower === 'furnizor') label = 'Furnizor Partener';
          else if (kLower === 'stare produs') label = 'Stare Produs';
          else if (kLower === 'distribuitor') label = 'Distribuitor Autorizat';
          return [label, v];
        });
    } catch {
      return [];
    }
  })();

  function handleLike(id: string) {
    if (likedReviews[id]) return;
    setLikedReviews((prev) => ({ ...prev, [id]: true }));
    setUserLikesDelta((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: ReviewItem = {
      id: `rev-user-${Date.now()}`,
      author: newAuthor.trim(),
      date: 'Chiar acum',
      rating: newRating,
      title: newTitle.trim() || 'Recenzie cumpărător',
      comment: newComment.trim(),
      isVerified: true,
      likes: 0,
    };

    setUserReviews((prev) => [newRev, ...prev]);
    setVisibleCount((prev) => prev + 1);
    setNewAuthor('');
    setNewTitle('');
    setNewComment('');
    setNewRating(5);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setShowReviewForm(false);
    }, 2500);
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hidden bg-gray-50/50">
        <button
          type="button"
          onClick={() => setActiveTab('desc')}
          className={cn(
            'flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'desc'
              ? 'border-blue-900 text-blue-900 bg-white shadow-xs'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          )}
        >
          <FileText size={16} />
          <span>Descrierea produsului</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={cn(
            'flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'specs'
              ? 'border-blue-900 text-blue-900 bg-white shadow-xs'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          )}
        >
          <Sliders size={16} />
          <span>Specificații tehnice</span>
        </button>

        <button
          id="tab-reviews-button"
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={cn(
            'flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'reviews'
              ? 'border-blue-900 text-blue-900 bg-white shadow-xs'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          )}
        >
          <Star size={16} className="text-amber-500 fill-amber-400" />
          <span>Recenzii &amp; Păreri</span>
          <span className="ml-1 bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
            {reviewsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('return')}
          className={cn(
            'flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'return'
              ? 'border-blue-900 text-blue-900 bg-white shadow-xs'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          )}
        >
          <ShieldCheck size={16} />
          <span>Garanție &amp; Retur</span>
        </button>
      </div>

      {/* ── Tab Content ── */}
      <div className="p-6 sm:p-8">
        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="space-y-4 max-w-4xl text-gray-700 leading-relaxed text-sm">
            <h3 className="text-base font-bold text-gray-900">
              Despre acest produs
            </h3>
            {product.description ? (
              product.description.includes('<') && product.description.includes('>') ? (
                <div
                  className="prose prose-sm max-w-none text-gray-600 space-y-2 break-words overflow-x-auto min-w-0 [&_table]:w-full [&_table]:overflow-x-auto [&_img]:max-w-full [&_img]:h-auto [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_h4]:font-bold [&_h4]:text-gray-800"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <div className="whitespace-pre-line text-gray-600 leading-relaxed break-words min-w-0">
                  {product.description}
                </div>
              )
            ) : (
              <p className="text-gray-600">
                Produs autentic de înaltă calitate comercializat pe marketplace-ul TOPinStock. Confecționat cu atenție la detalii din materiale premium, asigurând confort de lungă durată și rezistență la purtare.
              </p>
            )}

            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Avantaje principale:</h4>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Produs 100% original, verificat înainte de expediere</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Ambalaj protejat și livrare sigură prin curier</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Garanția este oferită de către furnizor și se găsește la ei pe website</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specs' && (
          <div className="max-w-3xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Specificații tehnice &amp; caracteristici
            </h3>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-1 sm:gap-4 bg-gray-50/50 break-words min-w-0">
                <span className="font-semibold text-gray-600">Categorie</span>
                <span className="text-gray-900 font-bold">{product.category?.name || 'General'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-1 sm:gap-4 bg-white break-words min-w-0">
                <span className="font-semibold text-gray-600">Vânzător Partener</span>
                <span className="text-blue-900 font-bold">{product.vendor?.storeName || 'Magazin Oficial'}</span>
              </div>
              {showSizes && (
                <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-1 sm:gap-4 bg-gray-50/50 break-words min-w-0">
                  <span className="font-semibold text-gray-600">
                    {isFashionOrApparel ? 'Mărimi disponibile' : 'Opțiuni / Dimensiuni'}
                  </span>
                  <span className="text-gray-900 font-bold">{validSizes.join(', ')}</span>
                </div>
              )}
              {showColors && (
                <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-1 sm:gap-4 bg-white break-words min-w-0">
                  <span className="font-semibold text-gray-600">Culori disponibile</span>
                  <span className="text-gray-900 font-bold">{validColors.join(', ')}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-1 sm:gap-4 bg-gray-50/50 break-words min-w-0">
                <span className="font-semibold text-gray-600">Cod Produs (SKU)</span>
                <span className="text-gray-900 font-mono font-bold">{product.sku || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-1 sm:gap-4 bg-white break-words min-w-0">
                <span className="font-semibold text-gray-600">Stoc curent</span>
                <span className="text-emerald-700 font-bold">{product.stock} bucăți în depozit</span>
              </div>
              {parsedAttributeEntries.map(([k, v], idx) => (
                <div
                  key={k}
                  className={cn(
                    'grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-1 sm:gap-4 break-words min-w-0',
                    idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                  )}
                >
                  <span className="font-semibold text-gray-600">{k}</span>
                  <span className="text-gray-900 font-bold">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Reviews & Ratings */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* ── Rating Overview Card ── */}
            <div className="bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-white rounded-2xl p-6 sm:p-8 border border-amber-100/80">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Big Score (4 cols) */}
                <div className="md:col-span-4 text-center md:text-left md:border-r md:border-amber-200/60 md:pr-6">
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                      {stats.averageRating}
                    </span>
                    <span className="text-lg font-bold text-slate-500">/ 5</span>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={20}
                        className={s <= Math.round(stats.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Calculat din <strong className="text-slate-900">{reviewsList.length} evaluări</strong> ale cumpărătorilor verificați
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200/70">
                    <Sparkles size={12} className="text-emerald-600" />
                    <span>{stats.recommendPct}% recomandă acest produs</span>
                  </div>
                </div>

                {/* Rating Distribution Bars (5 cols) */}
                <div className="md:col-span-5 space-y-2">
                  {stats.distribution.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                        {row.stars} <Star size={11} className="text-amber-400 fill-amber-400" />
                      </span>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="w-9 text-right font-medium text-slate-500">{row.pct}%</span>
                    </div>
                  ))}
                </div>

                {/* CTA Add Review (3 cols) */}
                <div className="md:col-span-3 text-center md:text-right">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm((v) => !v)}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#008fa8] to-[#006b80] hover:from-[#007d94] hover:to-[#005c6e] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <MessageSquarePlus size={16} />
                    <span>{showReviewForm ? 'Ascunde formularul' : 'Scrie o recenzie'}</span>
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2 text-center md:text-right">
                    Doar cumpărătorii pot publica recenzii
                  </p>
                </div>
              </div>
            </div>

            {/* ── Add Review Form Collapsible ── */}
            {showReviewForm && (
              <form
                onSubmit={handleAddReview}
                className="bg-slate-50 rounded-2xl p-5 sm:p-7 border border-slate-200/80 space-y-4 animate-in fade-in-50 duration-200"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <MessageSquarePlus size={16} className="text-[#008fa8]" />
                    <span>Adaugă recenzia ta pentru acest produs</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Toate câmpurile sunt obligatorii</span>
                </div>

                {formSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <BadgeCheck size={16} className="text-emerald-600" />
                    <span>Mulțumim! Recenzia ta a fost adăugată cu succes.</span>
                  </div>
                )}

                {/* Star rating selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nota acordată:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewRating(val)}
                        className="p-1 hover:scale-110 transition-transform"
                        title={`${val} stele`}
                      >
                        <Star
                          size={24}
                          className={val <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {newRating === 5
                        ? 'Excelent'
                        : newRating === 4
                        ? 'Foarte bun'
                        : newRating === 3
                        ? 'Mediu'
                        : newRating === 2
                        ? 'Slab'
                        : 'Foarte slab'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Numele tău *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Mihai Ionescu"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/15"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Titlul recenziei (opțional)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Recomand cu mare drag!"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Părerea ta despre produs *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Descrie experiența ta cu produsul, livrarea, calitatea ambalajului..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/15"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <Send size={13} />
                    <span>Trimite recenzia</span>
                  </button>
                </div>
              </form>
            )}

            {/* ── Reviews List ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Recenzii de la cumpărători ({reviewsList.length}):
                  </h4>
                  <p className="text-xs text-slate-500">
                    Se afișează {Math.min(visibleCount, reviewsList.length)} din {reviewsList.length} evaluări ale cumpărătorilor verificați
                  </p>
                </div>

                {reviewsList.length > 8 && (
                  <div className="flex items-center gap-2">
                    {visibleCount < reviewsList.length ? (
                      <button
                        type="button"
                        onClick={() => setVisibleCount(reviewsList.length)}
                        className="text-xs font-bold text-[#008fa8] hover:text-[#006b80] hover:underline cursor-pointer"
                      >
                        Afișează toate cele {reviewsList.length}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVisibleCount(8)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                      >
                        Restrânge la primele 8
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {reviewsList.slice(0, visibleCount).map((rev) => {
                  const currentLikes = rev.likes + (userLikesDelta[rev.id] || 0);
                  const isLiked = Boolean(likedReviews[rev.id]);

                  return (
                    <div key={rev.id} className="py-4.5 first:pt-0 space-y-2 animate-in fade-in-50 duration-200">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#008fa8] to-[#29DCFA] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                            {rev.author.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {rev.author}
                              </span>
                              {rev.isVerified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                  <BadgeCheck size={11} className="text-emerald-600" />
                                  <span>Achiziție Verificată</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">{rev.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.title && (
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                          {rev.title}
                        </h5>
                      )}

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {rev.comment}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>A fost de ajutor?</span>
                        <button
                          type="button"
                          onClick={() => handleLike(rev.id)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer',
                            isLiked
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                          )}
                        >
                          <ThumbsUp size={12} className={isLiked ? 'fill-current' : ''} />
                          <span>Da ({currentLikes})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Pagination Bar */}
              {visibleCount < reviewsList.length && (
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => Math.min(v + 10, reviewsList.length))}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    <span>Încarcă încă 10 recenzii</span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      ({reviewsList.length - visibleCount} rămase)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibleCount(reviewsList.length)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#008fa8]/10 hover:bg-[#008fa8]/20 text-[#006b80] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <span>Afișează toate ({reviewsList.length})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Return & Warranty */}
        {activeTab === 'return' && (
          <div className="max-w-3xl space-y-4 text-sm text-gray-700 leading-relaxed">
            <h3 className="text-base font-bold text-gray-900">
              Politica de Retur &amp; Garanție TOPinStock
            </h3>
            <p>
              La TOPinStock dorim să fii pe deplin mulțumit de achiziția ta. Dacă produsul nu ți se potrivește sau nu corespunde așteptărilor tale, ai la dispoziție <strong>14 zile calendaristice</strong> de la data recepționării coletului pentru a solicita returul.
            </p>
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wider">
                Condiții de acceptare a returului:
              </h4>
              <ul className="text-xs text-blue-900/80 space-y-1 list-disc list-inside">
                <li>Produsul trebuie returnat în aceeași stare în care a fost livrat.</li>
                <li>Etichetele originale și ambalajul trebuie să fie intacte.</li>
                <li>Banii sunt rambursați în contul tău bancar în maximum 3–5 zile lucrătoare de la recepția returului.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider">
                Garanția produselor:
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                Garanția este oferită de către furnizor și se găsește la ei pe website.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

