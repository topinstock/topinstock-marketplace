'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { SEOManager } from '@/lib/seo';

interface CategorySeoGuideProps {
  categorySlug: string;
  categoryName?: string;
  minPrice?: number;
  maxPrice?: number;
  total?: number;
  brands?: string[];
  className?: string;
}

export default function CategorySeoGuide({
  categorySlug,
  categoryName,
  minPrice,
  maxPrice,
  total,
  brands,
  className = '',
}: CategorySeoGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const guide = SEOManager.generateCategorySeoGuide(categorySlug, categoryName, {
    minPrice,
    maxPrice,
    total,
    brands,
  });

  return (
    <section
      aria-label="Ghid de cumpărături și informații categorie"
      className={`my-10 bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-xs relative ${className}`}
    >
      {/* ── Section Header with Badge ── */}
      <div className="flex items-center gap-2 mb-4 text-[#008fa8]">
        <BookOpen size={20} className="shrink-0" />
        <span className="text-xs font-black uppercase tracking-wider bg-cyan-50 px-2.5 py-1 rounded-md text-[#007b91] border border-cyan-100">
          Ghid Cumpărături &amp; Recomandări Specialiști
        </span>
      </div>

      {/* ── Main Category H2 SEO Heading ── */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
        {guide.h2}
      </h2>

      {/* ── Expandable Text Container (Fully in DOM for Googlebot) ── */}
      <div
        className={`relative transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-none' : 'max-h-[170px] overflow-hidden'
        }`}
      >
        <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed mb-6 font-normal">
          {guide.intro}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {guide.sections.map((sec, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100"
            >
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                <span>{sec.h3}</span>
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                {sec.body}
              </p>
            </div>
          ))}
        </div>

        {/* ── Gradient Fade Overlay when Collapsed ── */}
        {!isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* ── Interactive Expand / Collapse Toggle Button ── */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Restrânge ghidul' : 'Vezi mai mult (Ghid complet cumpărături)'}</span>
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
    </section>
  );
}
