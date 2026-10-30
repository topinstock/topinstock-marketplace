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
          <span className="text-sky-300 font-bold">Cluburi Fotbal • Joma Teamwear</span>
        </nav>

        {/* Hero Main Banner Showcase */}
        <div className="relative rounded-2xl overflow-hidden border border-sky-500/30 shadow-2xl bg-slate-950">
          <div className="relative w-full aspect-[16/6.2] min-h-[280px] sm:min-h-[360px] max-h-[620px]">
            <Image
              src="/images/banners/banner-joma-cluburi.webp"
              alt="Trening Joma - Personalizare pentru Echipe"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>

          {/* Quick Action Overlay Strip at the bottom of the banner */}
          <div className="bg-[#02182B]/95 backdrop-blur-md border-t border-sky-500/20 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider">
                <Users size={13} />
                Minim 8 bucăți
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                <Sparkles size={13} />
                Personalizare Club Inclusă
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-black uppercase tracking-wider">
                <Clock size={13} />
                Livrare Rapidă Echipe
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
              <Users size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Comenzi pe Proiect (Minim 8)</h4>
              <p className="text-xs text-slate-300 mt-1">
                Echipăm grupe complete de juniori, echipe de seniori sau academii, de la minimum 8 treninguri per model.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Preț Special la Cerere</h4>
              <p className="text-xs text-slate-300 mt-1">
                Discount-uri de volum garantate și facturare directă pe club / asociație sportivă / PJ.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Personalizare &amp; Mockup Gratuit</h4>
              <p className="text-xs text-slate-300 mt-1">
                Stema clubului brodată sau DTF, numere mari pe spate, inițiale și sponsori oficiali.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Gama Completă de Mărimi</h4>
              <p className="text-xs text-slate-300 mt-1">
                Mărimi pentru cei mai mici copii (4XS - XS) până la mărimi mari de seniori (S - 3XL).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

