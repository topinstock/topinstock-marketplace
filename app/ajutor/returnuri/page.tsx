import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Politica de Retur (30 Zile) | TOPinStock',
  description: 'Garanție de retur în 30 de zile calendaristice. Află condițiile și cum soliciți rambursarea banilor pe TOPinStock România.',
};

export default function ReturnuriPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 py-12">
      <div className="container-app max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <Link href="/ajutor" className="hover:text-blue-900 transition-colors">Centru de Ajutor</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Politica de Retur</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
            <RotateCcw size={26} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Drept de Retur Extins la 30 de Zile
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Dacă nu ești 100% mulțumit de produsul achiziționat, îl poți returna simplu și rapid în termen de 30 de zile calendaristice de la primire.
          </p>
        </div>

        {/* Steps for Return */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6 mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pași pentru returnarea unui produs:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-gray-900 text-sm">Trimite solicitarea</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Contactează-ne pe email la <strong>contact@topinstock.ro</strong> specificând numărul comenzii (ex: TS-XXXXXX) și produsele de returnat.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="font-bold text-gray-900 text-sm">Pregătește coletul</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ambalează produsul în cutia originală, alături de toate accesoriile și certificatul de garanție primit. Curierul va veni să îl ridice.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h3 className="font-bold text-gray-900 text-sm">Primești banii înapoi</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                După recepția și verificarea produsului în depozit, suma achitată va fi virată în contul tău bancar (IBAN) în termen de maxim 3 - 5 zile lucrătoare.
              </p>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-4 mb-10 text-xs sm:text-sm text-gray-600">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Condiții de acceptare a returului:</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Produsul nu trebuie să prezinte urme vizibile de uzură extremă, lovituri, ciobiri sau zgârieturi.</li>
            <li>Trebuie returnat împreună cu toate accesoriile furnizate de producător.</li>
            <li>Din motive de igienă și protecție a sănătății, produsele de îngrijire personală desigilate nu pot fi returnate conform OUG 34/2014, art. 16.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
