import Link from 'next/link';
import { Store, ArrowRight } from 'lucide-react';

export default function VendorBanner() {
  return (
    <section className="container-app py-8 sm:py-10">
      <div
        className="rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-marketplace border border-white/10"
        style={{
          background: 'linear-gradient(135deg, #003643 0%, #004f61 35%, #006b80 100%)',
        }}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#29DCFA]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-64 h-64 bg-[#F5436A]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
            <Store size={15} className="text-[#29DCFA]" />
            <span>Parteneriat B2B Marketplace</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 leading-tight">
            Vinde produsele tale pe TOPinStock
          </h2>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8">
            Alătură-te comercianților parteneri. Ai acces imediat la mii de clienți din toată țara, procesare simplă a comenzilor și suport dedicat.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/vanzator"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F5436A] to-[#C03653] hover:from-[#C03653] hover:to-[#A02B44] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-[0_4px_16px_rgba(245,67,106,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              <span>Devino Vânzător Partener</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/vanzator/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white px-5 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <span>Autentificare vânzător</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
