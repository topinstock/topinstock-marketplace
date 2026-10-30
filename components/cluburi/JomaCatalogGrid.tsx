'use client';

import { useState } from 'react';
import Image from 'next/image';
import { JOMA_TRACKSUIT_MODELS, type JomaTracksuitModel } from '@/lib/data/jomaModels';
import { ShieldCheck, Check, Sparkles, FileText, ChevronRight, Layers, Tag } from 'lucide-react';

interface JomaCatalogGridProps {
  onSelectModel: (modelName: string, colorName?: string) => void;
}

export default function JomaCatalogGrid({ onSelectModel }: JomaCatalogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({});

  const categories = [
    { id: 'all', label: 'Toate Modelele (9)' },
    { id: 'academy', label: 'Academy Series' },
    { id: 'championship', label: 'Championship & Eco' },
    { id: 'danubio', label: 'Danubio Series' },
    { id: 'phoenix', label: 'Phoenix (cu Glugă)' },
    { id: 'campus', label: 'Campus & Prezentare' },
    { id: 'geci', label: 'Geci Iarnă & Ploaie' },
  ];

  const filteredModels = selectedCategory === 'all'
    ? JOMA_TRACKSUIT_MODELS
    : JOMA_TRACKSUIT_MODELS.filter((m) => m.category === selectedCategory);

  const handleColorChange = (modelId: string, index: number) => {
    setSelectedColors((prev) => ({ ...prev, [modelId]: index }));
  };

  return (
    <section id="catalog-joma" className="py-12 bg-slate-50/70 border-b border-slate-200">
      <div className="container-app">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                Minim 8 bucăți per model
              </span>
              <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-[11px] font-black uppercase tracking-wider">
                Preț la cerere
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Modele Oficiale Treninguri Joma pentru Echipe
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Descoperă colecția completă de treninguri tehnice și de reprezentare Joma. Fiecare model poate fi comandat în culorile clubului tău, cu personalizare completă a stemei și numerelor.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Garanție de conformitate Joma 100% Original</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => {
            const currentColorIdx = selectedColors[model.id] || 0;
            const activeColor = model.colors[currentColorIdx] || model.colors[0];

            return (
              <div
                key={model.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Image and badges */}
                <div className="relative bg-slate-100/70 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden border-b border-slate-100">
                  <div className="relative w-full h-full">
                    <Image
                      src={activeColor.image}
                      alt={`${model.name} - ${activeColor.name}`}
                      fill
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
                      {model.categoryLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                      Min. 8 buc
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/95 border border-slate-200 text-slate-700 text-[11px] font-mono font-bold shadow-xs">
                      Cod: {model.code}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {model.description}
                    </p>

                    {/* Color selector preview */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                        <span>Culoare selectată:</span>
                        <span className="text-slate-800 font-extrabold">{activeColor.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {model.colors.map((c, cIdx) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleColorChange(model.id, cIdx)}
                            className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                              cIdx === currentColorIdx
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {c.name.split('/')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Specs List */}
                    <div className="mt-4 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-600">
                        <strong className="text-slate-900">Material:</strong> {model.composition}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong className="text-slate-900">Croială:</strong> {model.fit}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong className="text-slate-900">Mărimi:</strong> {model.availableSizes.slice(0, 5).join(', ')} ... {model.availableSizes.slice(-2).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA Button */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Ofertă de club
                      </span>
                      <span className="text-base sm:text-lg font-black text-amber-600 tracking-tight">
                        Preț la cerere
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectModel(model.name, activeColor.name)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-black text-xs shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      <FileText size={14} />
                      <span>Cere Ofertă</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
