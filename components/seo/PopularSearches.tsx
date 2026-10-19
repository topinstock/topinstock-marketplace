import Link from 'next/link';
import { Tag, Sparkles, Compass } from 'lucide-react';
import { SEOManager } from '@/lib/seo';

interface PopularSearchesProps {
  categorySlug: string;
  categoryName?: string;
  title?: string;
  className?: string;
}

export default function PopularSearches({
  categorySlug,
  categoryName,
  title,
  className = '',
}: PopularSearchesProps) {
  const links = SEOManager.getPopularSearchLinks(categorySlug);
  const displayName = categoryName || SEOManager.getCategoryDisplayName(categorySlug);
  const sectionTitle = title || `Căutări populare și produse din categoria ${displayName}`;

  if (!links || links.length === 0) return null;

  return (
    <section
      aria-label="Căutări populare și internal linking"
      className={`my-8 bg-white/80 backdrop-blur-xs rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${className}`}
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
          <Compass size={18} />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight">
            {sectionTitle}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Descoperă cele mai căutate combinații de branduri, specificații și categorii înrudite
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {links.map((link) => (
          <Link
            key={link.url}
            href={link.url}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200/80 hover:border-blue-300 transition-all duration-200 shadow-2xs hover:-translate-y-0.5 active:scale-98"
          >
            {link.badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-500">
                {link.badge}:
              </span>
            )}
            <span>{link.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
