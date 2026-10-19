import Link from 'next/link';
import { ShoppingBag, Search, CheckCircle2, CreditCard, Truck, ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Cum cumpăr? Ghid Pas cu Pas | TOPinStock',
  description: 'Află cum plasezi o comandă rapid și simplu pe marketplace-ul TOPinStock România.',
};

export default function CumCumparPage() {
  const steps = [
    {
      num: '01',
      title: 'Alege produsele dorite',
      desc: 'Folosește bara de căutare inteligentă din partea de sus sau explorează categoriile din meniul principal. Consultă imaginile de înaltă rezoluție, specificațiile tehnice și recenziile cumpărătorilor.',
    },
    {
      num: '02',
      title: 'Adaugă în coșul de cumpărături',
      desc: 'Selectează cantitatea dorită (și opțiuni precum mărimea sau culoarea, dacă este cazul) și apasă butonul „Adaugă în coș”. Poți continua cumpărăturile sau poți accesa direct sumarul coșului.',
    },
    {
      num: '03',
      title: 'Completează datele de livrare',
      desc: 'În pagina securizată de Checkout, introdu numele, numărul de telefon, județul, localitatea și adresa la care dorești să primești coletul. Nu este obligatoriu să ai un cont creat anterior.',
    },
    {
      num: '04',
      title: 'Alege modalitatea de plată',
      desc: 'Optează pentru plata Ramburs la livrare (numerar la curier) sau Card bancar online 3D Secure pentru procesare instantă fără comisioane.',
    },
    {
      num: '05',
      title: 'Confirmarea comenzii și expedierea',
      desc: 'Apasă „Plasează comanda”. Vei primi instant pe ecran și prin email numărul unic de comandă (ex: TS-XXXXXX). Vei fi notificat prin SMS când coletul este preluat de curier.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 py-12">
      <div className="container-app max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <Link href="/ajutor" className="hover:text-blue-900 transition-colors">Centru de Ajutor</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Cum cumpăr?</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">
            Ghid Cumpărături
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Cum plasezi o comandă pe TOPinStock?
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Am simplificat procesul de achiziție pentru ca tu să primești produsele favorite în cel mai scurt timp posibil, în deplină siguranță.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-6 mb-12">
          {steps.map((s, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs flex items-start gap-5">
              <span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 font-black text-lg flex items-center justify-center flex-shrink-0">
                {s.num}
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  {s.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Help Link Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-gray-900 text-sm">Ai nevoie de ajutor la plasarea comenzii?</h3>
            <p className="text-xs text-gray-500">Echipa noastră de suport te poate asista telefonic sau pe email.</p>
          </div>
          <Link
            href="/ajutor"
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors whitespace-nowrap"
          >
            Contactează Suportul
          </Link>
        </div>
      </div>
    </div>
  );
}
