'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Users, Sparkles, Clock, CheckCircle2, PhoneCall, ChevronRight, FileText } from 'lucide-react';

export default function JomaClubHero() {
  const scrollToForm = () => {
    const el = document.getElementById('cere-oferta');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#021526] via-[#052238] to-[#082E4D] text-white pt-8 pb-14 border-b border-sky-900/40">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-app relative z-10">
        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 text-xs text-sky-200/80 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Acasă</Link>
          <ChevronRight size={12} />
          <Link href="/produse" className="hover:text-white transition-colors">Sport &amp; Echipamente</Link>
          <ChevronRight size={12} />
          <span className="text-amber-300 font-bold">Distribuitor Oficial Joma</span>
          <ChevronRight size={12} />
          <span className="text-sky-300 font-bold">Echipamente &amp; Treninguri Echipe</span>
        </nav>

        {/* Hero Main Banner Showcase */}
        <div className="relative rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl bg-slate-950">
          <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px]">
            <Image
              src="/images/banners/banner-joma-cluburi.webp"
              alt="Distribuitor Oficial Joma - Preț la Cerere pentru Echipe - Minim 10 Comenzi - Personalizare la Cerere"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />

            {/* Premium Big Typography Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 sm:via-slate-950/50 to-transparent flex items-center z-10">
              <div className="max-w-[620px] px-6 sm:px-12 text-white">
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                    <ShieldCheck size={14} className="text-slate-950" />
                    <span>DISTRIBUITOR OFICIAL JOMA</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-3 drop-shadow-lg">
                  <span className="text-white block">PREȚ LA CERERE</span>
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent block mt-1">
                    PENTRU ECHIPE
                  </span>
                </h1>

                <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 font-medium max-w-[480px]">
                  Echipamente și treninguri complete pentru cluburi și academii. Comenzi pe proiect de <strong className="text-amber-300 font-black">MINIM 10 BUCĂȚI</strong> cu personalizare inclusă la cerere.
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={scrollToForm}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <FileText size={16} />
                    <span>Solicită Ofertă Personalizată</span>
                  </button>
                  <a
                    href="#catalog-joma"
                    className="inline-flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full border border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Vezi Modelele ↓</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Overlay Strip at the bottom of the banner */}
          <div className="bg-[#02182B]/95 backdrop-blur-md border-t border-sky-500/20 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider">
                <ShieldCheck size={13} />
                Distribuitor Oficial Joma
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-black uppercase tracking-wider">
                <FileText size={13} />
                Preț la Cerere pentru Echipe
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                <Users size={13} />
                Minim 10 Comenzi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                <Sparkles size={13} />
                Personalizare la Cerere
              </span>
            </div>

            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:shadow-amber-500/25 transition-all duration-200 cursor-pointer active:scale-95 uppercase tracking-wider"
            >
              <FileText size={15} />
              <span>Solicită Ofertă Personalizată</span>
            </button>
          </div>
        </div>

        {/* 4 Essential Highlights / Trust Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Distribuitor Oficial Joma</h4>
              <p className="text-xs text-slate-300 mt-1">
                Echipamente 100% originale direct din fabrică, certificate de conformitate și continuitate de stoc pe sezoane multiple.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Preț la Cerere pentru Echipe</h4>
              <p className="text-xs text-slate-300 mt-1">
                Grile speciale de discount de volum pentru cluburi sportive, școli de fotbal, asociații și persoane juridice.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Comandă Minim 10 Comenzi</h4>
              <p className="text-xs text-slate-300 mt-1">
                Echipăm loturi complete de juniori, echipe de seniori sau academii, de la un prag minim de 10 bucăți per model.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Personalizare la Cerere</h4>
              <p className="text-xs text-slate-300 mt-1">
                Stema clubului brodată sau DTF de înaltă rezistență, numere mari pe spate, nume jucători și sponsori oficiali.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

