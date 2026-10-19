import Link from 'next/link';
import { Home, ShoppingBag, ArrowLeft, Search, HelpCircle, Flame, Sparkles } from 'lucide-react';

export const metadata = {
  title: '404 - Pagina nu a fost găsită | TOPinStock',
  description: 'Ne pare rău, pagina pe care o cauți nu există sau a fost mutată pe TOPinStock.',
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-2xl w-full text-center">
        {/* Badge 404 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles size={14} className="text-[#C03653]" />
          <span>Eroare 404 • Pagină negăsită</span>
        </div>

        {/* Big 404 Heading */}
        <div className="relative mb-6">
          <h1
            className="text-8xl sm:text-9xl font-black tracking-tighter select-none"
            style={{
              background: 'linear-gradient(135deg, #008fa8 0%, #004f61 50%, #C03653 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <span className="text-9xl font-black text-gray-900 blur-2xl">404</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Hopa! Pagina căutată s-a rătăcit
        </h2>
        <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          Link-ul pe care l-ai accesat este incorect, pagina a fost mutată sau produsul nu mai este disponibil în stoc.
        </p>

        {/* Search Suggestion Bar */}
        <div className="max-w-md mx-auto mb-10">
          <form
            action="/produse"
            method="GET"
            className="flex items-center bg-white border-2 border-gray-200 rounded-full p-1.5 shadow-sm hover:border-blue-600 focus-within:border-blue-700 transition-all"
          >
            <div className="pl-3 text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Caută produse, categorii sau mărci..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#008fa8] to-[#006b80] hover:from-[#006b80] hover:to-[#004f61] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Caută
            </button>
          </form>
        </div>

        {/* Main Navigation CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-6 py-3 rounded-full text-xs sm:text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Home size={16} />
            <span>Mergi la Pagina Principală</span>
          </Link>

          <Link
            href="/produse"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold px-6 py-3 rounded-full text-xs sm:text-sm border border-gray-300 shadow-xs transition-all duration-150"
          >
            <ShoppingBag size={16} className="text-blue-700" />
            <span>Toate Produsele</span>
          </Link>

          <Link
            href="/ajutor"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold px-5 py-3 rounded-full text-xs sm:text-sm border border-gray-200 shadow-xs transition-all duration-150"
          >
            <HelpCircle size={16} className="text-gray-500" />
            <span>Centru de Ajutor</span>
          </Link>
        </div>

        {/* Quick Category Badges */}
        <div className="pt-8 border-t border-gray-200/80">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Categorii populare pe TOPinStock:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Bucătărie & Menaj', href: '/produse?category=bucatarie-menaj' },
              { label: 'Electrocasnice', href: '/produse?category=electrocasnice' },
              { label: 'Jucării & Copii', href: '/produse?category=copii-jucarii' },
              { label: 'Rucsacuri & Genți', href: '/produse?category=genti-accesorii' },
              { label: 'Oferte Speciale', href: '/produse?sort=popular' },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-800 text-gray-600 transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
