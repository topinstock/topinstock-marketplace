import { Truck, ShieldCheck, RotateCcw, CreditCard, Sparkles } from 'lucide-react';

const ADVANTAGES = [
  {
    icon: Truck,
    badge: 'CURIER RAPID',
    title: 'Livrare Rapidă în 2-3 Zile',
    desc: 'Direct la adresa ta în toată România',
    color: 'from-emerald-500/15 to-teal-500/20 text-emerald-700',
  },
  {
    icon: RotateCcw,
    badge: 'FĂRĂ COSTURI',
    title: 'Retur Gratuit 30 de Zile',
    desc: 'Banii înapoi rapid, fără explicații complicate',
    color: 'from-cyan-500/15 to-blue-500/20 text-[#006b80]',
  },
  {
    icon: ShieldCheck,
    badge: 'LEGAL & CONFORM',
    title: 'Garanție de la Furnizor',
    desc: 'Garanția este oferită de către furnizor și se găsește la ei pe website',
    color: 'from-amber-500/15 to-orange-500/20 text-amber-700',
  },
  {
    icon: CreditCard,
    badge: 'LA LIVRARE',
    title: 'Plată Ramburs sau Card',
    desc: 'Plătești simplu la curier sau securizat cu cardul',
    color: 'from-rose-500/15 to-pink-500/20 text-rose-700',
  },
];

export default function AdvantagesStrip() {
  return (
    <section className="container-app py-6 my-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADVANTAGES.map((adv, index) => {
          const Icon = adv.icon;
          return (
            <div
              key={index}
              className="group flex items-start gap-3.5 p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-marketplace transition-all duration-300 hover:-translate-y-0.5"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${adv.color} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs`}
              >
                <Icon size={22} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase block mb-0.5">
                  {adv.badge}
                </span>
                <h4 className="font-extrabold text-[13px] sm:text-[14px] text-slate-900 leading-tight">
                  {adv.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  {adv.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
