'use client';

import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Store, HelpCircle } from 'lucide-react';

// ============================================
//   TopBar — Bara de utilitate superioară
//   Bara de utilitate superioară cu semnale de încredere rapide
// ============================================

export default function TopBar() {
  return (
    <div className="bg-[#003845] text-white/90 text-[11px] font-medium border-b border-white/10 hidden sm:block">
      <div className="container-app flex justify-between items-center h-8">
        {/* Left Side: Value propositions & Trust signals */}
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5 text-emerald-300">
            <Truck size={13} className="text-emerald-400" />
            <span>Livrare rapidă prin curier în toată România</span>
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
            <RotateCcw size={12} className="text-[#29DCFA]" />
            <span>Retur simplu în 30 de zile</span>
          </span>
          <span className="text-white/20 hidden md:inline">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-white/80">
            <ShieldCheck size={13} className="text-amber-400" />
            <span>100% Produse originale din stoc</span>
          </span>
        </div>

        {/* Right Side: Quick marketplace links */}
        <div className="flex items-center gap-4">
          <Link
            href="/vanzator"
            className="flex items-center gap-1 text-white/90 hover:text-[#29DCFA] transition-colors font-semibold"
          >
            <Store size={12} />
            <span>Vinde pe TOPinStock</span>
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href="/ajutor"
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
          >
            <HelpCircle size={12} />
            <span>Ajutor & Suport</span>
          </Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1 text-white/90 font-bold bg-white/10 px-2 py-0.5 rounded">
            <span>🇷🇴 RON</span>
          </div>
        </div>
      </div>
    </div>
  );
}
