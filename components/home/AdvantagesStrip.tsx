import { Truck, ShieldCheck, RotateCcw, CreditCard, Sparkles } from 'lucide-react';

const ADVANTAGES = [
  {
    icon: Truck,
    title: 'Livrare Rapidă',
    desc: 'În 2-3 zile lucrătoare',
    color: 'from-emerald-500/15 to-teal-500/20 text-emerald-700',
  },
  {
    icon: RotateCcw,
    title: 'Retur 30 Zile',
    desc: 'Simplu și fără bătăi de cap',
    color: 'from-cyan-500/15 to-blue-500/20 text-[#006b80]',
  },
  {
    icon: ShieldCheck,
    title: 'Garanție Inclusă',
    desc: '100% produse originale',
    color: 'from-amber-500/15 to-orange-500/20 text-amber-700',
  },
  {
    icon: CreditCard,
    title: 'Plată Securizată',
    desc: 'Cu cardul sau ramburs la curier',
    color: 'from-rose-500/15 to-pink-500/20 text-rose-700',
  },
];

export default function AdvantagesStrip() {
  return (
    <section className="container-app py-4 my-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {ADVANTAGES.map((adv, index) => {
          const Icon = adv.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${adv.color} flex items-center justify-center flex-shrink-0 shadow-xs`}
              >
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-[13.5px] sm:text-[15px] text-slate-900 leading-tight">
                  {adv.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
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
