import Link from 'next/link';
import { Truck, Clock, MapPin, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Politica de Livrare & Curierat | TOPinStock',
  description: 'Detalii despre timpii de livrare, tarifele de curierat și partenerii logistici pe TOPinStock România.',
};

export default function LivrarePage() {
  return (
    <div className="min-h-screen bg-gray-50/60 py-12">
      <div className="container-app max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <Link href="/ajutor" className="hover:text-blue-900 transition-colors">Centru de Ajutor</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Politica de Livrare</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4">
            <Truck size={26} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Livrare Rapidă și În Siguranță
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Livrăm colete în orice localitate din România prin rețeaua națională a partenerilor noștri de curierat rapid (DPD, Fan Courier).
          </p>
        </div>

        {/* Key Features Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-blue-700 font-black text-2xl block mb-1">2 - 3 Zile</span>
            <span className="font-bold text-gray-900 text-sm block">Termen de Livrare</span>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Pentru toate comenzile confirmate până în ora 15:00.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-blue-700 font-black text-2xl block mb-1">19 LEI</span>
            <span className="font-bold text-gray-900 text-sm block">Tarif Fix Național</span>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Fără kilometri exteriori sau taxe ascunse.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-emerald-600 font-black text-2xl block mb-1">SMS & AWB</span>
            <span className="font-bold text-gray-900 text-sm block">Urmărire Live</span>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Notificare automată în dimineața livrării.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-8 mb-10">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Partenerii de Curierat</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Expedierile de pe platforma TOPinStock sunt asigurate prin operatori autorizați: DPD Curier și Fan Courier. Coletele sunt transportate direct la adresa ta în condiții de maximă siguranță și beneficiază de asigurare completă pe durata tranzitului.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Costul de Transport</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Costul de livrare este fix, în valoare de <strong>19.00 LEI</strong> (TVA inclus) per comandă, indiferent de greutatea coletului sau de localitatea din România unde se solicită livrarea. Nu percepem taxe pentru kilometri suplimentari.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Recepția Coletului</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              La sosirea curierului, vă rugăm să verificați integritatea ambalajului exterior. În cazul în care ambalajul prezintă deteriorări vizibile severe, aveți dreptul să solicitați întocmirea unui proces-verbal de constatare cu agentul de curierat.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
