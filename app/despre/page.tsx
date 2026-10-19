import Link from 'next/link';
import { Store, ShieldCheck, Truck, Users, Award, HeartHandshake, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Despre TOPinStock | Marketplace-ul Modern al României',
  description: 'Află povestea TOPinStock România - conectăm comercianți verificați cu sute de mii de cumpărători, oferind livrare rapidă și produse de calitate.',
};

export default function DesprePage() {
  return (
    <div className="min-h-screen bg-gray-50/60 py-12">
      <div className="container-app max-w-5xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Despre Noi</span>
        </nav>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-14 text-white mb-12 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #008fa8 0%, #004f61 100%)',
          }}
        >
          <div className="max-w-2xl relative z-10">
            <span className="inline-block bg-white/15 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-white/20">
              Despre TOPinStock România
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Pasiune pentru cumpărături inteligente și sigure.
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              TOPinStock este marketplace-ul dezvoltat pentru a oferi românilor acces la produse de top pentru casă, bucătărie, electrocasnice și familie, direct de la producători și vânzători verificați.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { value: '395+', label: 'Produse în stoc real', desc: 'Livrate direct din depozit' },
            { value: '2-3 Zile', label: 'Timp mediu de livrare', desc: 'Prin curierat rapid național' },
            { value: '100%', label: 'Vânzători verificați', desc: 'Standarde riguroase de calitate' },
            { value: '30 Zile', label: 'Garanție de retur', desc: 'Fără întrebări suplimentare' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs text-center">
              <span className="text-2xl sm:text-3xl font-black text-blue-900 block mb-1">{stat.value}</span>
              <span className="font-bold text-gray-800 text-xs sm:text-sm block">{stat.label}</span>
              <span className="text-[11px] text-gray-400 mt-1 block">{stat.desc}</span>
            </div>
          ))}
        </div>

        {/* Misiune & Valori */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs mb-14">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 tracking-tight">
              Misiunea Noastră
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ne dorim să eliminăm intermediarii inutili și să aducem cele mai bune oferte direct la ușa casei tale, garantând prețuri competitive, servicii de asistență dedicate și o experiență de cumpărare fără griji.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Store size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Comerț Transparent</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Fiecare comerciant de pe TOPinStock este auditat din punct de vedere fiscal și al calității produselor oferite.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Truck size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Logistică Eficientă</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Colaborăm cu liderii de curierat din România (DPD, Fan Courier) pentru a asigura livrări rapide direct la adresa ta în orice colț al țării.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Protecția Cumpărătorului</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Plăți 100% securizate, opțiune de verificare la livrare și retur garantat în termen de 30 de zile calendaristice.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Strip */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-xl sm:text-2xl font-black mb-1">Ești gata să descoperi ofertele noastre?</h3>
            <p className="text-orange-100 text-xs sm:text-sm">Explorează catalogul complet cu sute de articole în stoc imediat.</p>
          </div>
          <Link
            href="/produse"
            className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <span>Vezi Produsele</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
