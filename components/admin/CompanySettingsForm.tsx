'use client';

import { useState } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Percent,
  Calendar,
  RotateCcw,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface CompanySettings {
  id: string;
  companyName: string;
  cui: string;
  regCom: string;
  legalAddress: string;
  capitalSocial: string;
  iban: string;
  bankName: string;
  contactEmail: string;
  supportPhone: string;
  defaultCommission: number;
  payoutTermsDays: number;
  returnPolicyDays: number;
  orderMinimumAmount: number;
  platformNotice: string | null;
}

interface CompanySettingsFormProps {
  initialSettings: CompanySettings;
}

export default function CompanySettingsForm({ initialSettings }: CompanySettingsFormProps) {
  const [formData, setFormData] = useState<CompanySettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleChange(field: keyof CompanySettings, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/company-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Eroare la salvarea setărilor.');
      }

      setSuccessMsg('Datele companiei și setările marketplace-ului au fost salvate cu succes!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'A apărut o problemă la conexiune.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Toast / Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── CARD 1: DATE JURIDICE & FISCALE TOPINSTOCK SRL ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Date Juridice Companie Mamă</h2>
            <p className="text-xs text-gray-500">Datele fiscale ale entității juridice care deține și operează marketplace-ul</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Denumire Oficială Companie (S.R.L. / S.A.) *
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="ex: S.C. TOPinStock Marketplace S.R.L."
              className="w-full h-11 px-4 rounded-xl border border-gray-200 font-semibold text-gray-900 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Cod Unic de Înregistrare (CUI / CIF) *
            </label>
            <input
              type="text"
              required
              value={formData.cui}
              onChange={(e) => handleChange('cui', e.target.value)}
              placeholder="ex: RO48921450"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 font-mono font-bold text-gray-900 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Nr. Registrul Comerțului (J) *
            </label>
            <input
              type="text"
              required
              value={formData.regCom}
              onChange={(e) => handleChange('regCom', e.target.value)}
              placeholder="ex: J40/14280/2024"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 font-mono font-medium text-gray-900 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Capital Social Subscris &amp; Vărsat
            </label>
            <input
              type="text"
              value={formData.capitalSocial}
              onChange={(e) => handleChange('capitalSocial', e.target.value)}
              placeholder="ex: 50.000 LEI"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 font-medium text-gray-900 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-gray-700 mb-1.5">
              Sediu Social Oficial (Adresă completă) *
            </label>
            <input
              type="text"
              required
              value={formData.legalAddress}
              onChange={(e) => handleChange('legalAddress', e.target.value)}
              placeholder="ex: București, Sector 1, Calea Floreasca nr. 169, Etaj 4"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 font-medium text-gray-900 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── CARD 2: DATE BANCARE & FACTURARE ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Cont Bancar &amp; Încasări Marketplace</h2>
            <p className="text-xs text-gray-500">Contul bancar principal pentru încasarea comisioanelor și emiterea facturilor de servicii</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Cont IBAN Oficial (RON) *
            </label>
            <input
              type="text"
              required
              value={formData.iban}
              onChange={(e) => handleChange('iban', e.target.value)}
              placeholder="RO49BTRLRONCRT0123456701"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 font-mono font-bold text-gray-900 focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Banca Parteneră *
            </label>
            <input
              type="text"
              required
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              placeholder="ex: Banca Transilvania"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 font-medium text-gray-900 focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Email Oficial Contact &amp; Notificări *
            </label>
            <input
              type="email"
              required
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="contact@topinstock.ro"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 font-medium text-gray-900 focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Telefon Asistență Parteneri &amp; Suport
            </label>
            <input
              type="tel"
              value={formData.supportPhone}
              onChange={(e) => handleChange('supportPhone', e.target.value)}
              placeholder="0720 123 456"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 font-medium text-gray-900 focus:border-purple-700 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── CARD 3: PARAMETRI COMERCIALI MARKETPLACE ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Percent size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Politici &amp; Comisioane Marketplace</h2>
            <p className="text-xs text-gray-500">Regulile financiare aplicate implicit comercianților și cumpărătorilor</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Comision Standard Marketplace
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="0.5"
                required
                value={formData.defaultCommission}
                onChange={(e) => handleChange('defaultCommission', parseFloat(e.target.value))}
                className="w-full h-11 pl-4 pr-12 rounded-xl border border-gray-200 font-black text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                {(formData.defaultCommission * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Ex: 0.12 = 12% comision reținut din valoarea comenzii</p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Termen Decontare Vânzători (zile)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="60"
                required
                value={formData.payoutTermsDays}
                onChange={(e) => handleChange('payoutTermsDays', parseInt(e.target.value, 10))}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 font-bold text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">zile</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Frecvența de plată a banilor către parteneri</p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Politică de Retur Standard
            </label>
            <div className="relative">
              <input
                type="number"
                min="14"
                max="60"
                required
                value={formData.returnPolicyDays}
                onChange={(e) => handleChange('returnPolicyDays', parseInt(e.target.value, 10))}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 font-bold text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">zile</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Minim 14 zile conform legii OUG 34/2014</p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Valoare Minimă Comandă (LEI)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.orderMinimumAmount}
                onChange={(e) => handleChange('orderMinimumAmount', parseFloat(e.target.value) || 0)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 font-bold text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">LEI</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Valoarea minimă a produselor din coș pentru livrare (standard: 50 LEI)</p>
          </div>

          <div className="sm:col-span-3">
            <label className="block font-bold text-gray-700 mb-1.5">
              Notificare / Anunț Intern pentru Vânzători
            </label>
            <textarea
              rows={2}
              value={formData.platformNotice || ''}
              onChange={(e) => handleChange('platformNotice', e.target.value)}
              placeholder="Ex: Deconturile lunare se procesează în data de 15 și 30 a fiecărei luni..."
              className="w-full p-4 rounded-xl border border-gray-200 font-medium text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── SUBMIT BUTTON ── */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save size={18} />
              <span>Salvează Detaliile Firmei &amp; Setările</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
