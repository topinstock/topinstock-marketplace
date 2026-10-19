import Link from 'next/link';
import { CreditCard, Banknote, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Metode de Plată & Ramburs | TOPinStock',
  description: 'Informații despre plata ramburs la curier și plăți securizate cu cardul bancar pe TOPinStock România.',
};

export default function PlataPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 py-12">
      <div className="container-app max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <Link href="/ajutor" className="hover:text-blue-900 transition-colors">Centru de Ajutor</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Metode de Plată</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
            <CreditCard size={26} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Metode de Plată Disponibile
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Pe TOPinStock ai la dispoziție modalități de plată flexibile și 100% sigure, conforme celor mai înalte standarde din comerțul electronic.
          </p>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Ramburs */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Banknote size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">1. Ramburs la Livrare</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Plătești contravaloarea comenzii direct agentului de curierat în momentul înmânării coletului. Plata se poate efectua în numerar (cash) sau cu cardul bancar la POS-ul mobil al curierului (în funcție de disponibilitatea agentului).
            </p>
            <div className="bg-gray-50 p-3.5 rounded-xl text-xs text-gray-600 font-medium">
              ✓ Nu necesită introducerea datelor bancare online.
            </div>
          </div>

          {/* Card Bancar Online */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Lock size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">2. Card Bancar Online (3D Secure)</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Sunt acceptate cardurile de debit și credit Visa, Mastercard și Maestro. Plățile sunt procesate în mediu securizat criptat prin protocolul 3D Secure cu autorizare prin SMS sau aplicația bancară mobilă.
            </p>
            <div className="bg-gray-50 p-3.5 rounded-xl text-xs text-gray-600 font-medium">
              ✓ Comision 0% la orice tranzacție cu cardul.
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Securitatea Datelor Tale</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
              TOPinStock România nu stochează niciun fel de date confidențiale legate de cardul tău bancar (număr de card, cod CVV etc.). Toate tranzacțiile sunt criptate la nivel militar cu certificate SSL pe 256 de biți.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
