'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Edit3,
  X,
  Check,
  Loader2,
  DollarSign,
  Package,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface ProductQuickEditModalProps {
  product: {
    id: string;
    title: string;
    price: number;
    originalPrice: number | null;
    stock: number;
    isPublished?: boolean;
    images?: string[];
  };
}

export default function ProductQuickEditModal({ product }: ProductQuickEditModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price.toString());
  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice ? product.originalPrice.toString() : ''
  );
  const [stock, setStock] = useState(product.stock.toString());
  const [isPublished, setIsPublished] = useState(product.isPublished ?? true);

  // Images state
  const [images, setImages] = useState<string[]>(
    product.images && product.images.length > 0 ? product.images : ['/images/product_laptop.jpg']
  );
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Calculate live preview discount
  const numPrice = parseFloat(price);
  const numOrig = parseFloat(originalPrice);
  const liveDiscount =
    !isNaN(numPrice) && !isNaN(numOrig) && numOrig > numPrice
      ? Math.round(((numOrig - numPrice) / numOrig) * 100)
      : null;

  function addImageUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) return;
    setImages((prev) => [...prev, trimmed]);
    setUrlInput('');
  }

  function removeImage(idx: number) {
    if (images.length <= 1) {
      setError('Produsul trebuie să aibă cel puțin o imagine.');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setError(null);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Eroare la încărcarea imaginii.');
        setIsUploading(false);
        return;
      }

      setImages((prev) => [...prev, data.url]);
    } catch {
      setError('Eroare la conexiunea cu serverul la încărcare.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          title: title.trim(),
          price: parseFloat(price),
          originalPrice: originalPrice.trim() ? parseFloat(originalPrice) : null,
          stock: parseInt(stock, 10),
          isPublished,
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Eroare la salvarea modificărilor.');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'A apărut o problemă la actualizare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setError(null);
          setSuccess(false);
        }}
        className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors border border-amber-200/60"
        title="Schimbă rapid prețul, stocul sau pozele"
      >
        <Edit3 size={13} />
        <span>Preț &amp; Poze</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh] relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Editare Rapidă TOPinStock
                </span>
                <h3 className="text-base font-black text-gray-900">
                  Modificare Preț, Poze &amp; Stoc
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-100">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-100 font-bold">
                  <Check size={15} className="shrink-0 text-emerald-600" />
                  <span>Modificările au fost salvate cu succes în catalog!</span>
                </div>
              )}

              {/* Titlu */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Titlu Produs
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Grid: Preț Vânzare & Preț Vechi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Preț Vânzare (LEI) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      className="w-full text-sm font-bold text-gray-900 pl-3 pr-8 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      LEI
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>Preț Vechi / Tăiat</span>
                    {liveDiscount !== null && (
                      <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        -{liveDiscount}%
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="Opțional"
                      className="w-full text-sm font-bold text-gray-700 pl-3 pr-8 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      LEI
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid: Stoc & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Stoc Disponibil (Bucăți)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full text-xs font-bold text-gray-900 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Status Produs
                  </label>
                  <select
                    value={isPublished ? 'true' : 'false'}
                    onChange={(e) => setIsPublished(e.target.value === 'true')}
                    className="w-full text-xs font-bold text-gray-900 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white"
                  >
                    <option value="true">Activ (Publicat)</option>
                    <option value="false">Inactiv (Ascuns)</option>
                  </select>
                </div>
              </div>

              {/* ── Poze & Galerie ── */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Poze Produs ({images.length})
                  </label>
                  <label className="cursor-pointer text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1">
                    <Upload size={12} />
                    <span>{isUploading ? 'Se încarcă...' : 'Încarcă din PC'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Adaugare URL */}
                <div className="flex gap-1.5 mb-2.5">
                  <input
                    type="url"
                    placeholder="Sau adaugă link URL poză..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                    className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-2.5 py-1.5 text-[11px] font-bold bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                  >
                    + Adaugă
                  </button>
                </div>

                {/* Previzualizare miniaturi poze */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-100">
                  {images.map((img, idx) => (
                    <div key={`${img}-${idx}`} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="70px"
                        className="object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-0.5 left-0.5 bg-blue-600 text-white text-[8px] font-black uppercase px-1 rounded">
                          Cover
                        </span>
                      )}
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-0.5 right-0.5 p-1 bg-red-600 text-white rounded hover:bg-red-700 opacity-80 hover:opacity-100 transition-opacity"
                          title="Șterge poza"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Link spre editarea completă */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <Link
                  href={`/admin/produse/${product.id}`}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink size={12} />
                  <span>Deschide pagina de editare completă</span>
                </Link>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Se salvează...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      <span>Salvează Modificările</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
