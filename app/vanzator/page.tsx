'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Headphones,
  Check,
} from 'lucide-react';

export default function VanzatorPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [cui, setCui] = useState('');
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('electronice');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/vanzator/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          cui,
          storeName,
          category,
          email,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Eroare la trimiterea cererii.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Eroare de rețea. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/70 py-12">
      <div className="container-app max-w-5xl space-y-12">
        {/* Hero Section */}
        <div
          className="rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #004f61 0%, #006b80 40%, #008fa8 100%)',
          }}
        >
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Store size={14} className="text-[#29DCFA]" />
              Parteneriat Marketplace
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Crește-ți afacerea cu TOPinStock România
            </h1>

            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              0% Comision pe vânzări și fără taxe fixe de abonament. Fiecare partener își încasează banii direct pe cardul propriu, gestionează facturarea și expediază coletele independent, beneficiind de vitrina noastră e-commerce.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="#inregistrare"
                className="inline-flex items-center gap-2 bg-[#F5436A] hover:bg-[#C03653] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-95"
              >
                <span>Înregistrează magazin nou</span>
                <ArrowRight size={14} />
              </a>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white text-white hover:text-slate-900 font-bold text-xs sm:text-sm px-6 py-3 rounded-full backdrop-blur-md transition-all active:scale-95"
              >
                <Store size={15} />
                <span>Ai cont? Autentifică-te în Panou</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Vizibilitate Națională</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Produsele tale sunt afișate în catalogul dinamic TOPinStock și recomandate direct clienților interesați.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <Zap size={24} />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Importator AI Inteligent</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Adaugă zeci de produse în câteva secunde lipind doar link-urile lor în chatbox-ul nostru automatizat.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">0% Comision & Încasare Directă</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Încasezi 100% din valoarea comenzilor direct pe cardul sau contul tău bancar. Fără intermediari și fără rețineri din încasări.
            </p>
          </div>
        </div>

        {/* Onboarding Form Card */}
        <div id="inregistrare" className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm scroll-mt-24">
          {submitted ? (
            <div className="text-center py-8 max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Check size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                Cererea a fost trimisă cu succes!
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Îți mulțumim pentru interesul acordat platformei TOPinStock. Un reprezentant din echipa noastră te va contacta în termen de maximum 24 de ore lucrătoare pentru verificarea documentelor și activarea contului de vânzător.
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-full hover:bg-blue-800 transition-colors"
                >
                  <span>Înapoi la pagina principală</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Înregistrează-ți afacerea ca partener
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Completează formularul de mai jos și echipa TOPinStock va valida contul tău
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nume Companie / Firmă (SRL/PFA) *
                    </label>
                    <input
                      required
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ex: SoundTech Electronics SRL"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Cod Unic de Înregistrare (CUI / CIF) *
                    </label>
                    <input
                      required
                      type="text"
                      value={cui}
                      onChange={(e) => setCui(e.target.value)}
                      placeholder="ex: RO12345678"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nume Magazin / Brand dorit pe platformă *
                    </label>
                    <input
                      required
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="ex: SoundTech Oficial"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Categorie principală de produse *
                    </label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm bg-white"
                    >
                      <option value="electronice">Electronice &amp; Gadgets</option>
                      <option value="moda">Modă &amp; Încălțăminte</option>
                      <option value="casa">Casă &amp; Grădină</option>
                      <option value="auto">Auto &amp; Moto</option>
                      <option value="altele">Altele</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Adresă de Email oficială *
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@firma-ta.ro"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Număr de Telefon de contact *
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07xxxxxxxx"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    required
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600">
                    Sunt de acord cu termenii de utilizare ai platformei TOPinStock și politica de confidențialitate a datelor comerciale.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 h-12 bg-[#C03653] hover:bg-[#A02B44] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Trimite cererea de parteneriat</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
