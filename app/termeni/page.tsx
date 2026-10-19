import Link from 'next/link';
import { FileText, Shield, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Termeni & Condiții | TOPinStock Marketplace',
  description: 'Termenii și condițiile de utilizare a platformei TOPinStock România și regulile comerciale aplicabile.',
};

export default function TermeniPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 py-12">
      <div className="container-app max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Termeni & Condiții</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4">
            <FileText size={26} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Termeni și Condiții de Utilizare
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Ultima actualizare: Octombrie 2026 • Conform legislației din România și Directivei UE privind comerțul electronic.
          </p>
        </div>

        {/* Legal Text Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">1. Dispoziții Generale</h2>
            <p>
              Prezentul document stabilește termenii și condițiile de utilizare a platformei online de tip marketplace accesibile la adresa <strong>TOPinStock</strong> („Platforma”). Prin navigarea pe site sau plasarea unei comenzi, utilizatorul își exprimă acordul cu termenii detaliați mai jos.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">2. Rolul Marketplace-ului &amp; Garanția</h2>
            <p>
              TOPinStock funcționează ca un marketplace deschis, intermediind relația dintre cumpărători și vânzătorii parteneri independenți. Garanția este oferită de către furnizor și se găsește la ei pe website.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">3. Încheierea Contractului la Distanță</h2>
            <p>
              Comanda trimisă de cumpărător reprezintă o ofertă de cumpărare. Contractul la distanță se consideră încheiat în momentul în care TOPinStock transmite cumpărătorului prin mijloace electronice (email / SMS) confirmarea expedierii produselor.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">4. Prețuri și Modalități de Plată</h2>
            <p>
              Toate prețurile afișate pe platformă sunt exprimate în LEI (RON) și includ TVA conform cotelor legale în vigoare. Costul de livrare de 19.00 LEI este menționat distinct în coșul de cumpărături înainte de finalizarea comenzii.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">5. Dreptul de Retragere (Retur)</h2>
            <p>
              Conform Ordonanței de Urgență nr. 34/2014, cumpărătorul persoană fizică are dreptul de a se retrage din contract în termen legal de 14 zile, termen extins de TOPinStock la <strong>30 de zile calendaristice</strong> fără a fi nevoit să justifice decizia.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">6. Soluționarea Litigiilor</h2>
            <p>
              Orice litigiu apărut între clienți și TOPinStock va fi rezolvat pe cale amiabilă. În cazul în care nu este posibilă o înțelegere pe cale amiabilă, competența revine instanțelor judecătorești competente din România. Cumpărătorii pot utiliza platforma SOL (Soluționarea Online a Litigiilor) a Comisiei Europene sau se pot adresa ANPC.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
