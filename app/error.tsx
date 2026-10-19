'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-lg w-full text-center bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-xs border border-amber-200/50">
          <AlertTriangle size={32} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          A apărut o eroare neașteptată
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Ne cerem scuze pentru inconvenient. Echipa noastră a fost notificată, iar problema este în curs de remediere.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-6 bg-gray-50 py-1.5 px-3 rounded-lg inline-block border border-gray-100">
            Cod eroare: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#008fa8] to-[#006b80] hover:from-[#006b80] hover:to-[#004f61] text-white font-bold px-6 py-3 rounded-full text-sm shadow-md transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Reîncearcă pagina</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-full text-sm transition-all"
          >
            <Home size={16} />
            <span>Pagina Principală</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
