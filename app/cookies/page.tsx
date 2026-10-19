import Link from 'next/link';
import { Cookie, CheckCircle2, Shield, Settings } from 'lucide-react';

export const metadata = {
  title: 'Politica privind Modulele Cookie | TOPinStock',
  description: 'Informații despre utilizarea fișierelor cookie pe platforma TOPinStock România și gestionarea preferințelor.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 py-12">
      <div className="container-app max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Politica Cookie-uri</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4">
            <Cookie size={26} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Politica privind Modulele Cookie
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Transparență completă privind utilizarea tehnologiilor de stocare pe TOPinStock România.
          </p>
        </div>

        {/* Body */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xs space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">1. Ce sunt modulele cookie?</h2>
            <p>
              Un modul cookie este un fișier text de mici dimensiuni pe care un site web îl salvează pe computerul sau dispozitivul tău mobil atunci când îl vizitezi. Datorită cookie-urilor, site-ul reține acțiunile și preferințele tale (cum ar fi produsele din coșul de cumpărături, sesiunea de autentificare sau preferințele de navigare) pe o perioadă de timp.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">2. Ce tipuri de cookie-uri utilizăm?</h2>
            <div className="space-y-3 mt-3">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1">A. Cookie-uri strict necesare (Esențiale)</h3>
                <p className="text-xs text-gray-500">
                  Necesare pentru funcționarea platformei: păstrarea produselor în coșul de cumpărături, navigarea securizată și finalizarea comenzilor. Acestea nu pot fi dezactivate.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1">B. Cookie-uri de performanță și analiză</h3>
                <p className="text-xs text-gray-500">
                  Ne ajută să înțelegem cum interacționează vizitatorii cu platforma, ce categorii sunt cele mai accesate și dacă apar erori tehnice, în mod anonimizat.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1">C. Cookie-uri de preferințe</h3>
                <p className="text-xs text-gray-500">
                  Permit memorarea opțiunilor tale (precum județul selectat pentru livrare sau lista de produse favorite).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">3. Cum poți controla modulele cookie?</h2>
            <p>
              Poți controla și/sau șterge modulele cookie după cum dorești, direct din setările browserului tău (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge). Poți șterge toate cookie-urile deja stocate pe dispozitivul tău și poți seta majoritatea browserelor să împiedice plasarea acestora. Reține însă că dezactivarea completă a cookie-urilor esențiale poate afecta funcționalitatea coșului de cumpărături.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
