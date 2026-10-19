import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Database } from 'lucide-react';

export const metadata = {
  title: 'Politica de Confidențialitate (GDPR) | TOPinStock',
  description: 'Află cum protejăm și prelucrăm datele tale cu caracter personal pe TOPinStock România conform Regulamentului GDPR.',
};

export default function ConfidentialitatePage() {
  return (
    <div className="min-h-screen bg-gray-50/60 py-12">
      <div className="container-app max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Politica de Confidențialitate</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Politica de Confidențialitate & GDPR
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Conform Regulamentului General privind Protecția Datelor (UE) 2016/679 (GDPR).
          </p>
        </div>

        {/* Body */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">1. Cine suntem și calitatea de operator</h2>
            <p>
              Operatorul de date cu caracter personal este <strong>TOPinStock S.R.L.</strong>, societate comercială înregistrată în România. Ne angajăm să păstrăm confidențialitatea și securitatea tuturor datelor furnizate de utilizatori.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">2. Ce date colectăm</h2>
            <p className="mb-2">Colectăm doar datele strict necesare procesării și expedierii comenzilor tale:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Numele și prenumele pentru facturare și livrare;</li>
              <li>Numărul de telefon pentru confirmarea livrării de către curier;</li>
              <li>Adresa completă de livrare;</li>
              <li>Adresa de email pentru transmiterea confirmării comenzii și a facturii;</li>
              <li>Date tehnice de conectare (adresa IP, identificatori de sesiune).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">3. Scopul și temeiul prelucrării</h2>
            <p>
              Prelucrarea datelor are ca temei legal executarea contractului la distanță (Art. 6 alin. 1 lit. b GDPR), îndeplinirea obligațiilor legale fiscale (facturare) și interesul legitim de îmbunătățire a experienței de utilizare.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">4. Destinatarii datelor</h2>
            <p>
              Datele tale nu sunt vândute sau înstrăinate către terți. Ele sunt transmise exclusiv partenerilor implicați direct în onorarea comenzii: operatorul de curierat (pentru livrare) și vânzătorul partener (pentru pregătirea coletului și factură).
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">5. Drepturile tale conform GDPR</h2>
            <p className="mb-2">În conformitate cu GDPR, beneficiezi de următoarele drepturi:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dreptul de acces la datele prelucrate;</li>
              <li>Dreptul la rectificarea sau actualizarea datelor inexacte;</li>
              <li>Dreptul la ștergerea datelor („dreptul de a fi uitat”);</li>
              <li>Dreptul la portabilitatea datelor;</li>
              <li>Dreptul de a depune o plângere la autoritatea națională de supraveghere (ANSPDCP).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">6. Contact Responsabil cu Protecția Datelor (DPO)</h2>
            <p>
              Pentru exercitarea drepturilor tale sau pentru orice întrebări legate de prelucrarea datelor cu caracter personal, ne poți contacta oricând pe adresa: <strong>dpo@topinstock.ro</strong> sau <strong>contact@topinstock.ro</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
