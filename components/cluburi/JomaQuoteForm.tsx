'use client';

import { useState } from 'react';
import { JOMA_TRACKSUIT_MODELS } from '@/lib/data/jomaModels';
import { Send, CheckCircle2, ShieldAlert, Sparkles, Users, Phone, Mail, Building, FileText } from 'lucide-react';

interface JomaQuoteFormProps {
  initialModel?: string;
  initialColor?: string;
}

export default function JomaQuoteForm({ initialModel, initialColor }: JomaQuoteFormProps) {
  const [clubName, setClubName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedModel, setSelectedModel] = useState(initialModel || JOMA_TRACKSUIT_MODELS[0].name);
  const [selectedColor, setSelectedColor] = useState(initialColor || '');
  const [quantity, setQuantity] = useState<number>(15);
  const [sizesNote, setSizesNote] = useState('');
  const [notes, setNotes] = useState('');

  // Customization options
  const [crest, setCrest] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [names, setNames] = useState(false);
  const [sponsor, setSponsor] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clubName.trim() || !contactName.trim() || !phone.trim() || !email.trim()) {
      setError('Te rugăm să completezi toate datele de contact obligatorii.');
      return;
    }

    if (quantity < 10) {
      setError('Comanda minimă pentru personalizare echipamente este de 10 comenzi / seturi.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/cluburi/oferta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubName,
          contactName,
          phone,
          email,
          model: selectedModel,
          color: selectedColor,
          quantity,
          sizesNote,
          customization: { crest, numbers, names, sponsor },
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'A apărut o problemă la trimiterea cererii.');
      }

      setSuccess(data.message);
      setRequestId(data.requestId);
    } catch (err: any) {
      setError(err.message || 'Eroare de conexiune. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cere-oferta" className="py-14 bg-gradient-to-b from-slate-900 to-[#021526] text-white">
      <div className="container-app max-w-4xl">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider mb-2">
            <Users size={13} />
            Formular Dedicat Cluburi de Fotbal
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Solicită Ofertă Personalizată de Echipă
          </h2>
          <p className="text-sm text-sky-200/80 mt-2 max-w-xl mx-auto">
            Completează datele de mai jos și echipa noastră dedicată B2B îți va trimite oferta completă de preț și mockup-ul grafic gratuit în maximum 2 ore.
          </p>
        </div>

        {success ? (
          <div className="bg-slate-800/90 border border-emerald-500/50 rounded-2xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              Cererea ta a fost recepționată cu succes!
            </h3>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {success}
            </p>
            {requestId && (
              <div className="mt-4 inline-block px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-sky-300">
                Număr înregistrare proiect: {requestId}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-slate-700 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setSuccess(null);
                  setRequestId(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Trimite o altă solicitare
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-center gap-2">
                <ShieldAlert size={18} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              {/* Club Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building size={14} className="text-sky-400" />
                  <span>Nume Club / Academie / Școală *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: FC Juniorul București / CS Victoria"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Users size={14} className="text-sky-400" />
                  <span>Persoană de Contact (Nume și Prenume) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Popescu Andrei (Antrenor / Director Tehnic)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone size={14} className="text-sky-400" />
                  <span>Număr de Telefon (pentru WhatsApp &amp; Ofertă) *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="07xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail size={14} className="text-sky-400" />
                  <span>Adresă de Email *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="club@exemplu.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Model & Quantity Section */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Model selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <FileText size={14} className="text-amber-400" />
                    <span>Model Trening Joma Selectat *</span>
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                  >
                    {JOMA_TRACKSUIT_MODELS.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} (Cod {m.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Users size={14} className="text-amber-400" />
                    <span>Cantitate Seturi (Min. 10) *</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-black focus:border-sky-500 focus:outline-none transition-colors"
                  />
                  {quantity < 10 && (
                    <span className="text-[11px] text-amber-400 font-bold block mt-1">
                      Minim 10 comenzi / seturi per model.
                    </span>
                  )}
                </div>
              </div>

              {/* Color preference */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Combinație de Culori Dorită (Culorile Clubului)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Albastru Royal cu Negru / Roșu cu Alb / Galben cu Negru"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Customization Checkboxes */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400" />
                <span>Opțiuni de Personalizare Dorite:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 cursor-pointer hover:border-slate-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={crest}
                    onChange={(e) => setCrest(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-slate-800 border-slate-600"
                  />
                  <span className="text-xs text-slate-200 font-bold">Imprimare / Broderie Stemă Club (Piept)</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 cursor-pointer hover:border-slate-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={numbers}
                    onChange={(e) => setNumbers(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-slate-800 border-slate-600"
                  />
                  <span className="text-xs text-slate-200 font-bold">Numere Mari pe Spate / Mici Pantalon</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 cursor-pointer hover:border-slate-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={names}
                    onChange={(e) => setNames(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-slate-800 border-slate-600"
                  />
                  <span className="text-xs text-slate-200 font-bold">Nume Jucători / Inițiale</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 cursor-pointer hover:border-slate-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={sponsor}
                    onChange={(e) => setSponsor(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-slate-800 border-slate-600"
                  />
                  <span className="text-xs text-slate-200 font-bold">Logo Sponsor Oficial (Piept / Spate)</span>
                </label>
              </div>
            </div>

            {/* Sizes & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Distribuție Estimată Mărimi (Opțional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: 5x 8 ani, 6x 10 ani, 4x 12 ani sau 4x M, 8x L, 3x XL"
                  value={sizesNote}
                  onChange={(e) => setSizesNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Observații sau Cerințe Suplimentare
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Data limită pentru livrare, culori secundare, dacă doriți și genți sau mingi..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                ✓ Primești oferta pe email &amp; WhatsApp în maxim 2 ore.<br className="hidden sm:inline" />
                ✓ Fără nicio obligație contractuală până la confirmarea comenzii.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Se trimite cererea...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Trimite Cererea de Ofertă</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

