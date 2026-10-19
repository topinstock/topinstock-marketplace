'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, CreditCard, Truck, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#002f3a] text-slate-300 pt-14 mt-16 border-t border-slate-800">
      <div className="container-app">
        {/* Top Trust & Partner Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-[#29DCFA] flex items-center justify-center flex-shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">Parteneri Logistici</span>
              <span className="text-xs text-slate-400">DPD Curier, Fan Courier</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">Plăți Securizate 100%</span>
              <span className="text-xs text-slate-400">Card bancar online sau Ramburs la livrare</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">Garanție Furnizor &amp; Retur Simplu</span>
              <span className="text-xs text-slate-400">Garanție oferită direct de către furnizor</span>
            </div>
          </div>
        </div>

        {/* Main 4-column Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-8 md:gap-10 py-12">
          {/* Brand & About Column */}
          <div>
            <div className="mb-4">
              <Link href="/" className="inline-flex flex-col group select-none">
                <span className="text-[28px] md:text-[32px] font-black italic text-white tracking-tight leading-none">
                  TOPin<span style={{ color: '#F5436A' }}>Stock</span>
                </span>
                <div className="flex items-center -mt-0.5 pl-0.5">
                  <span className="text-[11.5px] md:text-[12.5px] font-extrabold italic tracking-[0.06em] text-amber-300">
                    Marketplace Outlet
                  </span>
                </div>
              </Link>
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-400 max-w-sm mb-5">
              TOPinStock este marketplace-ul modern al României, conectând vânzători verificați cu cumpărători. Produse originale pe stoc, garanție oferită de către furnizor și livrare în 2-3 zile.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2.5">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Youtube, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-300 transition-all duration-150 hover:bg-[#F5436A] hover:text-white"
                  aria-label="Social Link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <FooterCol
            title="Despre Noi"
            links={[
              { label: 'Despre TOPinStock', href: '/despre' },
              { label: 'Toate Produsele', href: '/produse' },
              { label: 'Produse Populare', href: '/produse?sort=popular' },
              { label: 'Bucătărie & Menaj', href: '/bucatarie-menaj/c' },
              { label: 'Electrocasnice', href: '/electrocasnice/c' },
              { label: 'Jucării & Copii', href: '/copii-jucarii/c' },
            ]}
          />

          {/* Help & Support Column */}
          <FooterCol
            title="Asistență & Ajutor"
            links={[
              { label: 'Centru de Suport', href: '/ajutor' },
              { label: 'Cum cumpăr?', href: '/ajutor/cum-cumpar' },
              { label: 'Politica de Livrare & Curierat', href: '/ajutor/livrare' },
              { label: 'Politica de Retur (30 zile)', href: '/ajutor/returnuri' },
              { label: 'Metode de Plată & Ramburs', href: '/ajutor/plata' },
              { label: 'Urmărire Comandă', href: '/cont' },
            ]}
          />

          {/* Vendors & Legal Column */}
          <div>
            <h3 className="text-white text-xs font-black mb-4 uppercase tracking-wider">
              Pentru Vânzători & Parteneri
            </h3>
            <div className="flex flex-col gap-1.5 mb-6">
              {[
                { label: 'Vinde pe TOPinStock Marketplace', href: '/vanzator' },
                { label: 'Autentificare Panou Vânzător', href: '/vanzator/login' },
                { label: 'Ghid Comercial & Comisioane', href: '/vanzator' },
                { label: 'Termeni Parteneri Marketplace', href: '/vanzator' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-slate-400 py-0.5 hover:text-[#29DCFA] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Customer Care info */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="font-bold text-white block mb-1">Relații Clienți & Suport:</span>
              <p className="text-slate-400 mb-1">Luni - Vineri: 09:00 - 18:00</p>
              <p className="text-[#29DCFA] font-bold">contact@topinstock.ro</p>
            </div>
          </div>
        </div>

        {/* Consumer Rights Badges & Payment methods logos */}
        <div className="pt-6 pb-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          {/* Payment chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-300 mr-1">Plăți acceptate:</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-white">VISA</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-white">Mastercard</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-white">Apple Pay</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-white">Google Pay</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-white">Ramburs</span>
          </div>

          {/* ANPC & SAL Badges */}
          <div className="flex items-center gap-3">
            <a
              href="https://anpc.ro/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-slate-400 hover:text-white border border-white/20 px-2.5 py-1 rounded-md transition-colors"
            >
              ANPC - Protecția Consumatorilor
            </a>
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-slate-400 hover:text-white border border-white/20 px-2.5 py-1 rounded-md transition-colors"
            >
              SOL - Soluționare Litigii
            </a>
          </div>
        </div>

        {/* Bottom Copyright bar */}
        <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
          <span>© {new Date().getFullYear()} TOPinStock S.R.L. Toate drepturile rezervate.</span>
          <div className="flex items-center gap-3">
            <Link href="/termeni" className="hover:text-slate-300">Termeni & Condiții</Link>
            <span>·</span>
            <Link href="/confidentialitate" className="hover:text-slate-300">Confidențialitate</Link>
            <span>·</span>
            <Link href="/cookies" className="hover:text-slate-300">Politica Cookie-uri</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-white text-xs font-black mb-4 uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex flex-col gap-1.5">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-xs text-slate-400 py-0.5 transition-colors duration-150 hover:text-[#29DCFA]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
