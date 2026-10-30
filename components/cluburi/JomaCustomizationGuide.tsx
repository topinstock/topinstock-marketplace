'use client';

import { Palette, FileCheck, Layers, Truck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function JomaCustomizationGuide() {
  const steps = [
    {
      num: '01',
      title: 'Alegerea Modelului & Culorilor',
      desc: 'Selectezi din catalogul Joma modelul dorit (Academy, Championship, Danubio, Phoenix etc.) în culorile reprezentative ale clubului tău. Comanda minimă este de 8 bucăți per model.',
      icon: Palette,
      badge: 'Minim 8 seturi',
    },
    {
      num: '02',
      title: 'Trimite Sigla & Cerințele',
      desc: 'Ne transmiți stema clubului (format vectorial sau imagine clară), alături de lista cu opțiuni dorite: numere mari pe spate, nume jucători, inițiale pe piept sau logo-uri de sponsori.',
      icon: Layers,
      badge: 'Vectorial / PNG',
    },
    {
      num: '03',
      title: 'Simulare Mockup & Ofertă Finală',
      desc: 'Echipa noastră grafică îți realizează gratuit simularea vizuală a treningului gata personalizat și îți trimitem oferta de preț dedicată în funcție de cantitate și personalizări.',
      icon: FileCheck,
      badge: 'Simulare Gratuită',
    },
    {
      num: '04',
      title: 'Producție & Livrare Rapidă',
      desc: 'După aprobare, treningurile intră în atelierul de imprimare/broderie, sunt ambalate individual și etichetate pentru fiecare jucător, apoi expediate prin curier rapid direct la club.',
      icon: Truck,
      badge: 'Livrare Directă',
    },
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="container-app">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-sky-600" />
            Ghid Comandă pe Proiect
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cum funcționează comanda pentru clubul tău
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Proces simplu și transparent: de la consiliere și alegerea mărimilor, până la mockup gratuit și livrare la ușa clubului.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md hover:border-sky-300 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-slate-200">{s.num}</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-extrabold text-sky-700 shadow-xs">
                      {s.badge}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-4 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 size={13} />
                  <span>Asistență dedicată pas cu pas</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* B2B Club Notice Box */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 font-black text-lg">
              !
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-950">
                Condiție esențială: Comandă minimă 8 bucăți per model
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Această pagină este dedicată exclusiv cluburilor sportive, academiilor de fotbal, școlilor și asociațiilor. Pentru comenzi individuale (1 bucată), vizitează catalogul general de produse.
              </p>
            </div>
          </div>
          <a
            href="#cere-oferta"
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm transition-colors whitespace-nowrap"
          >
            Completează Cererea
          </a>
        </div>
      </div>
    </section>
  );
}
