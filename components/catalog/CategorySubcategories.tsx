import Link from 'next/link';
import { ChevronRight, ArrowRight, Layers, Sparkles } from 'lucide-react';
import type { SubcategoryItem } from '@/lib/products';
import type { EmagCategory } from '@/components/layout/emagMegaMenuData';

interface CategorySubcategoriesProps {
  categoryName: string;
  categorySlug: string;
  subcategories?: SubcategoryItem[];
  emagCategory?: EmagCategory;
}

export default function CategorySubcategories({
  categoryName,
  categorySlug,
  subcategories = [],
  emagCategory,
}: CategorySubcategoriesProps) {
  // If there are no subcategories in DB and no curated groups, don't render
  const hasDbChildren = subcategories && subcategories.length > 0;
  const hasEmagGroups = Boolean(emagCategory?.groups && emagCategory.groups.length > 0);

  if (!hasDbChildren && !hasEmagGroups) {
    return null;
  }

  return (
    <section className="mb-8 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#008fa8]/10 text-[#008fa8] flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none mb-1">
              Toate Subcategoriile {categoryName}
            </h2>
            <p className="text-[12px] text-slate-500 font-medium">
              Explorează toate gamele și departamentele dedicate cu produse în stoc
            </p>
          </div>
        </div>

        {hasDbChildren && (
          <span className="self-start sm:self-center text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {subcategories.length} {subcategories.length === 1 ? 'subcategorie' : 'subcategorii'}
          </span>
        )}
      </div>

      {/* ── 1. Curated Thematic Groups (eMAG style groups if available) ── */}
      {hasEmagGroups && emagCategory?.groups && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {emagCategory.groups.map((group, gIdx) => (
            <div
              key={gIdx}
              className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <Link
                  href={group.href}
                  className="text-[13px] font-black text-slate-900 hover:text-[#008fa8] transition-colors flex items-center justify-between group mb-2"
                >
                  <span className="line-clamp-1">{group.title}</span>
                  <ChevronRight
                    size={14}
                    className="text-slate-400 group-hover:text-[#008fa8] group-hover:translate-x-0.5 transition-all shrink-0"
                  />
                </Link>

                <ul className="space-y-1">
                  {group.items.slice(0, 4).map((item, iIdx) => (
                    <li key={iIdx}>
                      <Link
                        href={item.href}
                        className="text-[11px] font-medium text-slate-600 hover:text-[#008fa8] flex items-center justify-between py-0.5 transition-colors group"
                      >
                        <span className="line-clamp-1 group-hover:font-semibold">{item.name}</span>
                        {item.badge && (
                          <span className="text-[8px] font-black px-1 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-100 uppercase shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={group.href}
                className="mt-2.5 pt-2 border-t border-slate-200/50 text-[11px] font-bold text-[#008fa8] hover:text-[#005c6e] flex items-center gap-1 transition-colors"
              >
                <span>Vezi gama</span>
                <ArrowRight size={11} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── 2. Direct Subcategory Cards Grid ── */}
      {hasDbChildren && (
        <div>
          {hasEmagGroups && (
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              Toate Departamentele & Subcategoriile ({subcategories.length}):
            </h3>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/${sub.slug}/c`}
                className="group flex flex-col justify-between p-3 rounded-xl bg-slate-50/60 hover:bg-white border border-slate-200/80 hover:border-[#008fa8] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#008fa8] transition-colors line-clamp-2 leading-snug">
                    {sub.name}
                  </h4>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-600">
                    {sub.productCount} {sub.productCount === 1 ? 'produs' : 'produse'}
                  </span>
                  <ChevronRight
                    size={13}
                    className="text-slate-300 group-hover:text-[#008fa8] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

