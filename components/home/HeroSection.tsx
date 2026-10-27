'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Flame,
  Bike,
} from 'lucide-react';

interface Slide {
  image: string;
  badge: string;
  title: string;
  highlight: string;
  desc: string;
  ctaText: string;
  ctaHref: string;
  hasBuiltinText?: boolean;
  isBlackFriday?: boolean;
}

const SLIDES: Slide[] = [
  {
    image: '/images/hero-black-friday.jpg',
    badge: '🔥 28 OCTOMBRIE – 1 DECEMBRIE',
    title: 'BLACK FRIDAY',
    highlight: 'PREȚURI SUB OUTLET • DIRECT DIN STOC',
    desc: 'Campania anului a început pe TOPinStock! Mii de produse cu prețuri mai mici decât la outlet: electrocasnice, casă, bucătărie și cadouri direct din stoc.',
    ctaText: 'Prinde Ofertele Black Friday',
    ctaHref: '/produse',
    isBlackFriday: true,
  },
  {
    image: '/images/promo_christmas_lights.jpg',
    badge: '🎄 Sărbători & Sezon Festiv',
    title: 'Instalații & Turturi Crăciun',
    highlight: '1.300+ Modele TOPinStock Direct din Stoc',
    desc: 'Turturi LED exterior, perdele luminoase interconectabile și ghirlande festive pentru decorul complet de sărbători.',
    ctaText: 'Vezi Instalațiile',
    ctaHref: '/turturi-franjuri/c',
  },
  {
    image: '/images/hero-victronic-electrocasnice.webp',
    badge: '⚡ Sezonul Confortului & Căldurii',
    title: 'Electrocasnice & Încălzire Victronic',
    highlight: 'Căldură Rapidă & Consum Redus',
    desc: 'Calorifere electrice cu ulei, aeroterme și electrocasnice de bucătărie cu termostat inteligent.',
    ctaText: 'Vezi Soluțiile de Încălzire',
    ctaHref: '/calorifere-tip-panou/c',
  },
  {
    image: '/images/promo_coffee.jpg',
    badge: '☕ Dimineți Calde & Aromate',
    title: 'Espressoare & Preparare Cafea',
    highlight: 'Oliver Voltz & Grünberg · Presiune Optimă',
    desc: 'Espressoare automate, râșnițe electrice și cafetiere moka pentru cafea aromată și spumă densă în zilele reci.',
    ctaText: 'Descoperă Espressoarele',
    ctaHref: '/produse?search=cafea',
  },
  {
    image: '/images/promo_toys.jpg',
    badge: '🎁 Cadouri Sf. Nicolae & Crăciun',
    title: 'Jucării & Cadouri pentru Copii',
    highlight: '410+ Jocuri, Plușuri & Seturi Creative',
    desc: 'Board games distractive de familie, mașinuțe, căsuțe și jucării educative gata de pus sub brad.',
    ctaText: 'Alege Cadourile',
    ctaHref: '/jucarii-si-jocuri/c',
  },
  {
    image: '/images/promo_cookware.jpg',
    badge: '🍳 Pregătiri Festive de Sezon',
    title: 'Seturi Oale & Inox Profesionale',
    highlight: 'Grünberg & Bohmann · 140+ Opțiuni',
    desc: 'Seturi complete din inox alimentar cu bază termică multistrat, ideale pentru mesele bogate de sărbători.',
    ctaText: 'Descoperă Oalele Inox',
    ctaHref: '/oale/c',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  // Navigare prin swipe / scroll tactil pe telefon
  const minSwipeDistance = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <section className="container-app pt-4 sm:pt-6 pb-2">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-5">
        {/* Main Banner Carousel (6 mari bannere sezoniere Q4 cu swipe pe mobil și săgeți pe desktop) */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-marketplace h-[360px] md:h-[430px] group bg-slate-950 border border-slate-800/40 touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides track */}
          <div
            className="flex h-full transition-transform duration-600 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {SLIDES.map((slide, index) => (
              <div key={index} className="relative min-w-full w-full h-full flex-shrink-0 overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'low'}
                  sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 70vw, 850px"
                  unoptimized
                  className="object-cover object-center scale-100 transition-transform duration-700"
                />

                {slide.isBlackFriday ? (
                  /* ── Banner Black Friday: Design High-Impact, Iluminat & Conversie Maximă ── */
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 sm:via-slate-950/65 to-transparent flex items-center">
                    <div className="max-w-[620px] px-4 sm:px-12 text-white">
                      {/* Badge Campanie cu data si pulsating glow */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-[#F5436A] text-white text-[11px] sm:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[0_0_24px_rgba(245,158,11,0.55)] border border-amber-300/40">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <Flame size={14} className="text-amber-200 fill-amber-200" />
                          <span>28 OCTOMBRIE – 1 DECEMBRIE</span>
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/15 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                          <Sparkles size={12} className="text-amber-400" />
                          <span>Campania Anului</span>
                        </span>
                      </div>

                      {/* Headline Exploziv: BLACK FRIDAY TOATA LUNA */}
                      <h2 className="text-2xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                        <span className="text-white block">BLACK FRIDAY</span>
                        <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent block mt-1 drop-shadow-sm">
                          TOATĂ LUNA
                        </span>
                      </h2>

                      {/* Hook Comercial: PREȚURI SUB OUTLET */}
                      <div className="inline-flex flex-wrap items-center gap-2 my-2.5 py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-500/30 via-amber-500/20 to-transparent border-l-4 border-[#F5436A] backdrop-blur-xs">
                        <span className="text-xs sm:text-sm md:text-base font-black text-rose-300 tracking-wide uppercase drop-shadow-xs">
                          ⚡ PREȚURI SUB OUTLET
                        </span>
                        <span className="text-white/40 hidden sm:inline">•</span>
                        <span className="text-xs sm:text-sm font-bold text-amber-200">
                          Direct din Depozit
                        </span>
                      </div>

                      {/* Text Copywriting */}
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2 max-w-[500px]">
                        {slide.desc}
                      </p>

                      {/* CTA & Trust signals */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={slide.ctaHref}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-orange-500 to-[#F5436A] hover:from-amber-300 hover:to-[#C03653] text-slate-950 font-black text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-[0_4px_24px_rgba(245,158,11,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_32px_rgba(245,158,11,0.8)] active:scale-95 cursor-pointer"
                        >
                          <span>{slide.ctaText}</span>
                          <ArrowRight size={17} />
                        </Link>

                        <div className="hidden sm:flex items-center gap-3 text-white/90 text-xs font-semibold bg-black/45 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-full shadow-sm">
                          <span className="flex items-center gap-1.5 text-emerald-300">
                            <Truck size={14} className="text-emerald-400" />
                            Direct din Stoc
                          </span>
                          <span className="text-white/20">·</span>
                          <span className="flex items-center gap-1.5 text-[#29DCFA]">
                            <ShieldCheck size={14} />
                            Retur 30 Zile
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : slide.hasBuiltinText ? (
                  /* ── Banner cu artwork dedicat: lăsăm imaginea 100% vizibilă + bară CTA floating modernă ── */
                  <Link
                    href={slide.ctaHref}
                    className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 group/link cursor-pointer"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F5436A] to-[#C03653] hover:from-[#C03653] hover:to-[#A02B44] text-white font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-[0_4px_16px_rgba(245,67,106,0.5)] transition-all group-hover/link:scale-105 group-hover/link:shadow-[0_6px_24px_rgba(245,67,106,0.65)]">
                          <span>{slide.ctaText}</span>
                          <ArrowRight size={16} />
                        </span>

                        <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/15 text-white/95 text-xs font-bold px-3.5 py-2.5 rounded-full shadow-sm">
                          <Sparkles size={13} className="text-amber-300" />
                          <span>Mii de produse pe stoc</span>
                        </span>
                      </div>

                      <div className="hidden sm:flex items-center gap-3 text-white/90 text-xs font-medium bg-black/50 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-full shadow-sm">
                        <span className="flex items-center gap-1.5 text-emerald-300">
                          <Truck size={14} className="text-emerald-400" />
                          Livrare 2-3 zile
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="flex items-center gap-1.5 text-[#29DCFA]">
                          <ShieldCheck size={14} />
                          Retur Simplu 30 Zile
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  /* ── Banner standard cu text și gradient lateral optimizat pe mobil și desktop ── */
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/30 sm:to-transparent flex items-center">
                    <div className="max-w-[560px] px-4 sm:px-12 text-white">
                      {/* Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#F5436A] to-[#C03653] text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                          <Sparkles size={12} />
                          {slide.badge}
                        </span>
                      </div>

                      {/* Headline */}
                      <h2 className="text-xl sm:text-4xl md:text-5xl font-black leading-[1.1] mb-2 tracking-tight drop-shadow-md">
                        {slide.title}
                      </h2>

                      <p className="text-amber-300 font-bold text-xs sm:text-base mb-2">
                        {slide.highlight}
                      </p>

                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2 max-w-[460px]">
                        {slide.desc}
                      </p>

                      {/* Action buttons & Trust pills */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={slide.ctaHref}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F5436A] to-[#C03653] hover:from-[#C03653] hover:to-[#A02B44] text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-[0_4px_16px_rgba(245,67,106,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                        >
                          <span>{slide.ctaText}</span>
                          <ArrowRight size={16} />
                        </Link>

                        <div className="hidden sm:flex items-center gap-3 text-white/80 text-[11px] font-medium ml-2">
                          <span className="flex items-center gap-1">
                            <Truck size={13} className="text-emerald-400" />
                            Livrare 2-3 zile
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <ShieldCheck size={13} className="text-[#29DCFA]" />
                            Garanție furnizor
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows (pe PC la click pe săgeată) */}
          <button
            onClick={prevSlide}
            aria-label="Slide precedent"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 hover:bg-white text-slate-900 flex items-center justify-center opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-105 cursor-pointer backdrop-blur-xs z-20"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Slide următor"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 hover:bg-white text-slate-900 flex items-center justify-center opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-105 cursor-pointer backdrop-blur-xs z-20"
          >
            <ChevronRight size={22} />
          </button>

          {/* Progress / Dots (toate cele 6 bannere) */}
          <div className="absolute bottom-4 left-6 sm:left-12 flex gap-2 z-10">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Mergi la slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === i
                    ? 'w-9 bg-[#F5436A] shadow-md'
                    : 'w-2.5 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Hero Sidebar Promo Cards */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
          {/* Card 1: Teal / Marine - Seturi Oale & Inox */}
          <Link
            href="/oale/c"
            className="flex-1 min-h-[195px] rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-marketplace hover:shadow-marketplace-hover group border border-[#008fa8]/40 bg-slate-950"
          >
            <Image
              src="/images/promo_cookware.jpg"
              alt="Seturi Oale & Inox"
              fill
              loading="lazy"
              fetchPriority="low"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 330px"
              className="object-cover object-right scale-100 group-hover:scale-108 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-[#004f61]/85 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                  <Flame size={11} className="text-amber-300" />
                  GĂTIT & BUCĂTĂRIE
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black leading-snug mb-1 drop-shadow-sm text-white">
                Seturi Oale &amp; Inox
              </h3>
              <p className="text-[#29DCFA] font-bold text-xs drop-shadow-xs">
                Grünberg &amp; Bohmann · 140+ modele
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-white mt-4 pt-3 border-t border-white/20">
              <span className="group-hover:text-[#29DCFA] transition-colors">Descoperă colecția</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#29DCFA] group-hover:text-slate-950 transition-all">
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>

          {/* Card 2: Coral / Red Bestseller - Biciclete Splendor Victronic */}
          <Link
            href="/biciclete-pentru-copii/c"
            className="flex-1 min-h-[195px] rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-marketplace hover:shadow-marketplace-hover group border border-[#F5436A]/40 bg-slate-950"
          >
            <Image
              src="/images/promo_bike.jpg"
              alt="Biciclete Splendor Victronic"
              fill
              loading="lazy"
              fetchPriority="low"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 330px"
              className="object-cover object-right scale-100 group-hover:scale-108 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-[#8e2038]/85 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                  <Bike size={12} className="text-yellow-300" />
                  SPORT &amp; TIMP LIBER
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black leading-snug mb-1 drop-shadow-sm text-white">
                Biciclete Splendor
              </h3>
              <p className="text-amber-200 font-bold text-xs drop-shadow-xs">
                Victronic · 12" – 24" · 23 modele
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-white mt-4 pt-3 border-t border-white/20">
              <span className="group-hover:text-amber-200 transition-colors">Vezi bicicletele</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#F5436A] group-hover:text-white transition-all">
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
