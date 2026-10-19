'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquarePlus,
  Sparkles,
  Link2,
  Edit3,
  ArrowLeft,
  CheckCircle,
  Info,
} from 'lucide-react';
import ChatProductImporter, { DraftProduct } from '@/components/admin/ChatProductImporter';

export default function AdminChatImporterPage() {
  const [recentlyExtracted, setRecentlyExtracted] = useState<DraftProduct[]>([]);

  function handleDraftExtracted(draft: DraftProduct) {
    setRecentlyExtracted((prev) => [draft, ...prev.slice(0, 9)]);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs font-semibold text-gray-500 hover:text-blue-900 flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Înapoi la Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <span>AI Product Importer</span>
            <span className="text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
              AI Powered
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Lipește link-ul oricărui produs → AI extrage datele → Tu verifici și publici.
          </p>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold">
            <Link2 size={18} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900">1. Lipești link-ul</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Orice URL de produs de pe web sau o scurtă descriere cu preț.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center flex-shrink-0 font-bold">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900">2. AI extrage automat</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Titlul, descrierea, prețul, imaginile, mărimile și specificațiile tehnice.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-100 bg-orange-50/50 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold">
            <Edit3 size={18} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-orange-900">3. Tu verifici și publici</h4>
            <p className="text-[11px] text-orange-700 mt-0.5">
              Ești redirecționat la formular pre-completat. Ajustezi ce e necesar și publici.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chatbox (8 cols) */}
        <div className="lg:col-span-8">
          <ChatProductImporter onDraftExtracted={handleDraftExtracted} />
        </div>

        {/* Recently Extracted Feed (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Extrase în această sesiune</span>
              <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {recentlyExtracted.length}
              </span>
            </h3>

            {recentlyExtracted.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-[560px] overflow-y-auto mt-2 pr-1 space-y-0">
                {recentlyExtracted.map((draft, idx) => (
                  <div key={idx} className="py-3 first:pt-1">
                    <div className="flex gap-3 items-start">
                      {draft.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={draft.images[0]}
                          alt={draft.title || 'Draft'}
                          className="w-12 h-14 object-cover rounded-lg bg-gray-100 border border-gray-100 flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-14 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate" title={draft.title}>
                          {draft.title || <span className="text-gray-400 italic">Fără titlu</span>}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                          {draft.price && draft.price > 0 ? (
                            <span className="font-bold text-blue-900">{draft.price.toFixed(2)} LEI</span>
                          ) : (
                            <span className="text-amber-600 font-semibold">Preț lipsă</span>
                          )}
                          {draft.categorySlug && (
                            <>
                              <span>•</span>
                              <span>{draft.categorySlug}</span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              sessionStorage.setItem('topinstock_product_draft', JSON.stringify(draft));
                            } catch {}
                            try {
                              const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(draft))));
                              window.location.href = `/admin/produse/nou?draft=${encoded}`;
                            } catch {
                              window.location.href = '/admin/produse/nou';
                            }
                          }}
                          className="inline-block text-[11px] font-bold text-orange-600 hover:text-orange-700 mt-1"
                        >
                          Editează și publică →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 text-xs">
                <CheckCircle size={28} className="mx-auto text-gray-300 mb-2" />
                <p>Niciun produs extras încă în această sesiune.</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Lipește primul tău link în chatbox!
                </p>
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-xs text-blue-800 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <Info size={14} className="text-blue-600" /> Sfaturi pentru import corect
            </p>
            <ul className="space-y-1 text-[11px] text-blue-700 pl-4 list-disc">
              <li>Folosește link-uri directe la pagina produsului</li>
              <li>Verifică prețul — AI poate confunda prețurile reduse cu cel de bază</li>
              <li>Stocul este implicit 0 — completează-l manual</li>
              <li>Adaugă imagini suplimentare din formularul de editare</li>
              <li>Descrierea AI poate fi editată și îmbunătățită</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
