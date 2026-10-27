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
    badge: '🔥 BLACK FRIDAY',
    title: 'Prețuri Sub Outlet',
    highlight: 'Campania Sezonului',
    desc: 'Mii de produse originale cu livrare rapidă din depozit.',
    ctaText: 'Descoperă Ofertele',
    ctaHref: '/produse',
    isBlackFriday: true,
  },
  {
    image: '/images/promo_christmas_lights.jpg',
    badge: '🎄 SĂRBĂTORI',
    title: 'Instalații & Decorațiuni',
    highlight: 'Magia Crăciunului',
    desc: 'Turturi LED, perdele luminoase și ghirlande festive direct din stoc.',
    ctaText: 'Vezi Instalațiile',
    ctaHref: '/turturi-franjuri/c',
  },
  {
    image: '/images/hero-victronic-electrocasnice.webp',
    badge: '⚡ CONFORT TERMIC',
    title: 'Electrocasnice & Încălzire',
    highlight: 'Victronic & Oliver Voltz',
    desc: 'Calorifere electrice și aparate de bucătărie eficiente.',
    ctaText: 'Vezi Produsele',
    ctaHref: '/calorifere-tip-panou/c',
  },
  {
    image: '/images/promo_coffee.jpg',
    badge: '☕ CAFEA & AROMĂ',
    title: 'Espressoare & Cafetiere',
    highlight: 'Dimineți Perfecte',
    desc: 'Aparate de cafea și espressoare automate pentru acasă.',
    ctaText: 'Descoperă Gama',
    ctaHref: '/produse?search=cafea',
  },
  {
    image: '/images/promo_toys.jpg',
    badge: '🎁 PENTRU COPII',
    title: 'Jucării & Cadouri',
    highlight: 'Bucuria Celor Mici',
    desc: 'Jocuri educative, mașinuțe și seturi creative gata de livrare.',
    ctaText: 'Alege Cadourile',
    ctaHref: '/jucarii-si-jocuri/c',
  },
  {
    image: '/images/promo_cookware.jpg',
    badge: '🍳 GĂTIT & BUCĂTĂRIE',
    title: 'Seturi Oale & Inox',
    highlight: 'Calitate Profesională',
    desc: 'Inox alimentar cu bază termică multistrat pentru preparate gustoase.',
    ctaText: 'Vezi Oalele',
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
                  /* ── Banner Black Friday: Design Minimalist, Impact Puternic ── */
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 sm:via-slate-950/50 to-transparent flex items-center">
                    <div className="max-w-[560px] px-6 sm:px-12 text-white">
                      {/* Badge Simplu */}
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-[#F5436A] text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                          <Flame size={13} className="text-amber-200 fill-amber-200" />
                          <span>{slide.badge}</span>
                        </span>
                      </div>

                      {/* Headline BOLD */}
                      <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-2 drop-shadow-md">
                        <span className="text-white block">BLACK FRIDAY</span>
                        <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent block mt-1">
                          TOATĂ LUNA
                        </span>
                      </h2>

                      {/* Text Curat */}
                      <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 font-medium max-w-[440px]">
                        {slide.desc}
                      </p>

                      {/* CTA Curat */}
                      <div>
                        <Link
                          href={slide.ctaHref}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-orange-500 to-[#F5436A] hover:from-amber-300 hover:to-[#C03653] text-slate-950 font-black text-sm px-8 py-3.5 rounded-full shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                        >
                          <span>{slide.ctaText}</span>
                          <ArrowRight size={17} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : slide.hasBuiltinText ? (
                  /* ── Banner cu artwork dedicat ── */
                  <Link
                    href={slide.ctaHref}
                    className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 group/link cursor-pointer"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F5436A] to-[#C03653] hover:from-[#C03653] hover:to-[#A02B44] text-white font-black text-sm px-7 py-3 rounded-full shadow-md transition-all group-hover/link:scale-105">
                        <span>{slide.ctaText}</span>
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                ) : (
                  /* ── Banner standard minimalist ── */
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/20 sm:to-transparent flex items-center">
                    <div className="max-w-[540px] px-6 sm:px-12 text-white">
                      {/* Badge */}
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                          <Sparkles size={12} className="text-amber-300" />
                          <span>{slide.badge}</span>
                        </span>
                      </div>

                      {/* Headline */}
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-[1.1] mb-2 tracking-tight drop-shadow-md">
                        {slide.title}
                      </h2>

                      <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 font-medium max-w-[420px]">
                        {slide.desc}
                      </p>

                      {/* Action button */}
                      <div>
                        <Link
                          href={slide.ctaHref}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F5436A] to-[#C03653] hover:from-[#C03653] hover:to-[#A02B44] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                        >
                          <span>{slide.ctaText}</span>
                          <ArrowRight size={16} />
                        </Link>
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
              <span className="inline-block text-[#29DCFA] font-bold text-xs uppercase tracking-wider mb-1">
                Gătit &amp; Bucătărie
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-sm text-white">
                Seturi Oale &amp; Inox
              </h3>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-white mt-4 pt-3 border-t border-white/20">
              <span className="group-hover:text-[#29DCFA] transition-colors">Descoperă colecția</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#29DCFA] group-hover:text-slate-950 transition-all">
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>

          {/* Card 2: Coral / Red Bestseller - Biciclete Copii */}
          <Link
            href="/biciclete-pentru-copii/c"
            className="flex-1 min-h-[195px] rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-marketplace hover:shadow-marketplace-hover group border border-[#F5436A]/40 bg-slate-950"
          >
            <Image
              src="/images/promo_bike.jpg"
              alt="Biciclete Copii"
              fill
              loading="lazy"
              fetchPriority="low"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 330px"
              className="object-cover object-right scale-100 group-hover:scale-108 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-[#8e2038]/85 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-block text-amber-200 font-bold text-xs uppercase tracking-wider mb-1">
                Sport &amp; Timp Liber
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-sm text-white">
                Biciclete pentru Copii
              </h3>
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
