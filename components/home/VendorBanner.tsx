import Link from 'next/link';
import { Store, ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function VendorBanner() {
  return (
    <section className="container-app py-8">
      <div
        className="rounded-3xl p-6 sm:p-10 md:p-12 text-white relative overflow-hidden shadow-marketplace border border-white/10"
        style={{
          background: 'linear-gradient(135deg, #003643 0%, #004f61 35%, #006b80 100%)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#29DCFA]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-64 h-64 bg-[#F5436A]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
            <Store size={14} className="text-[#29DCFA]" />
            <span>TOPinStock B2B Marketplace</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 leading-tight">
            Vinde produsele tale pe TOPinStock România
          </h2>

          <p className="text-slate-200 text-xs sm:text-base leading-relaxed mb-6 max-w-2xl">
            Alătură-te comunității de comercianți verificați. Beneficiezi de vizibilitate garantată, procesare automată a comenzilor, plăți rapide și integrare simplă de stocuri.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-xs text-white">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">0 taxe lunare de abonament</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-xs text-white">
              <TrendingUp size={16} className="text-amber-300 flex-shrink-0" />
              <span className="font-semibold">Comision avantajos la vânzare</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-xs text-white">
              <Zap size={16} className="text-[#29DCFA] flex-shrink-0" />
              <span className="font-semibold">Livrări rapide prin curier</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/vanzator"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F5436A] to-[#C03653] hover:from-[#C03653] hover:to-[#A02B44] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-[0_4px_16px_rgba(245,67,106,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              <span>Deschide Magazin Vânzător</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/vanzator/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/90 hover:text-white px-5 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <span>Ai deja cont? Autentifică-te</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
