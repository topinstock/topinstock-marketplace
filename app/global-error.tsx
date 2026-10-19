'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Critical global error:', error);
  }, [error]);

  return (
    <html lang="ro">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Eroare de sistem
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            A intervenit o eroare critică. Te rugăm să reîncarci aplicația.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="bg-[#008fa8] hover:bg-[#006b80] text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all"
            >
              Reîncarcă
            </button>
            <Link
              href="/"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-2.5 rounded-full text-sm transition-all inline-flex items-center"
            >
              Acasă
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
