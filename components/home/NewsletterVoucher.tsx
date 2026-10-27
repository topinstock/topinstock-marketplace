'use client';

import { useState } from 'react';
import { Gift, Mail, ArrowRight, CheckCircle2, Copy, Sparkles } from 'lucide-react';

export default function NewsletterVoucher() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitted(true);
  }

  function handleCopy() {
    navigator.clipboard?.writeText('TOPIN30');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="container-app py-8">
      <div
        className="rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-marketplace border border-white/10"
        style={{
          background: 'linear-gradient(135deg, #004f61 0%, #006b80 40%, #008fa8 100%)',
        }}
      >
        {/* Decorative background glow circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#29DCFA]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-[#F5436A]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left copy */}
          <div className="text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
              <Gift size={14} className="text-amber-300" />
              <span>Ofertă de Bun Venit</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
              Primești <span className="text-amber-300">30 Lei Cadou</span> la prima comandă!
            </h2>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-xl">
              Abonează-te la noutățile TOPinStock și primești pe loc voucherul pentru comenzi de peste 200 Lei, plus acces anticipat la Ofertele Zilei.
            </p>
          </div>

          {/* Right Action */}
          <div className="w-full lg:w-auto max-w-full">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="relative flex-1">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Adresa ta de email..."
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-full text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 outline-none shadow-md focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#F5436A] to-[#C03653] hover:from-[#C03653] hover:to-[#A02B44] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-[0_4px_14px_rgba(245,67,106,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span>Revendică 30 Lei</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-900 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-200 block">Voucherul tău este activ:</span>
                    <span className="font-mono font-black text-amber-300 text-lg">TOPIN30</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-white text-slate-900 font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={13} />
                  <span>{copied ? 'Copiat!' : 'Copiază'}</span>
                </button>
              </div>
            )}
            <p className="text-[11px] text-slate-300/80 text-center lg:text-left mt-2 pl-2">
              🔒 Datele tale sunt în siguranță. Te poți dezabona oricând cu 1 clic.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
