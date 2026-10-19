'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Upload,
  Link as LinkIcon,
  Plus,
  Trash2,
  X,
  Check,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Store,
  Tag,
  Layers,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Info,
  Shield,
  Weight,
  Scissors,
  ListChecks,
  Eye,
  Loader2,
  Sparkles,
  Save,
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface VendorOption {
  id: string;
  storeName: string;
}

export interface ProductEditFormProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    originalPrice: number | null;
    stock: number;
    sku: string | null;
    images: string[];
    sizes: string[];
    colors: string[];
    attributes?: {
      brand?: string;
      material?: string;
      warranty?: string;
      weight?: string;
      features?: string[];
      barcode?: string;
      sourceUrl?: string;
      [key: string]: any;
    } | null;
    isPublished: boolean;
    categoryId: string;
    vendorId: string;
    category?: { id: string; name: string; slug: string };
    vendor?: { id: string; storeName: string; slug: string };
  };
  categories: CategoryOption[];
  vendors: VendorOption[];
  sessionRole: string;
}

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
const PRESET_COLORS = [
  { name: 'Negru', hex: '#111827' },
  { name: 'Alb', hex: '#f9fafb' },
  { name: 'Bleumarin', hex: '#1e3a8a' },
  { name: 'Roșu', hex: '#dc2626' },
  { name: 'Verde Smarald', hex: '#059669' },
  { name: 'Bej Nisip', hex: '#d4b996' },
  { name: 'Gri Perlat', hex: '#9ca3af' },
  { name: 'Auriu', hex: '#d97706' },
  { name: 'Maro', hex: '#78350f' },
];

export default function ProductEditForm({
  product,
  categories,
  vendors,
  sessionRole,
}: ProductEditFormProps) {
  const router = useRouter();

  // Basic info states
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description || '');
  const [brand, setBrand] = useState(product.attributes?.brand || '');
  const [sku, setSku] = useState(product.sku || '');
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [vendorId, setVendorId] = useState(product.vendorId);
  const [isPublished, setIsPublished] = useState(product.isPublished);

  // Pricing & Stock
  const [price, setPrice] = useState(product.price.toString());
  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice != null ? product.originalPrice.toString() : ''
  );
  const [stock, setStock] = useState(product.stock.toString());

  // Images state
  const [images, setImages] = useState<string[]>(
    product.images && product.images.length > 0 ? product.images : ['/images/product_laptop.jpg']
  );
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Specifications
  const [material, setMaterial] = useState(product.attributes?.material || '');
  const [warranty, setWarranty] = useState(product.attributes?.warranty || '');
  const [weight, setWeight] = useState(product.attributes?.weight || '');
  const [features, setFeatures] = useState<string[]>(
    Array.isArray(product.attributes?.features) ? product.attributes.features : []
  );
  const [featureInput, setFeatureInput] = useState('');

  // Variants
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product.sizes || []);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>(product.colors || []);
  const [customColorInput, setCustomColorInput] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Discount calculation
  const numPrice = parseFloat(price);
  const numOriginalPrice = parseFloat(originalPrice);
  const discountPercent =
    !isNaN(numPrice) && !isNaN(numOriginalPrice) && numOriginalPrice > numPrice
      ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100)
      : null;

  // Image actions
  function addImageUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      setErrorMessage('Această imagine este deja adăugată.');
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setUrlInput('');
    setErrorMessage('');
  }

  function removeImage(idx: number) {
    if (images.length <= 1) {
      setErrorMessage('Produsul trebuie să aibă cel puțin o imagine.');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setErrorMessage('');
  }

  function makePrimaryImage(idx: number) {
    if (idx === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(idx, 1);
      return [selected, ...copy];
    });
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Eroare la încărcarea fișierului.');
        setIsUploading(false);
        return;
      }

      setImages((prev) => [...prev, data.url]);
    } catch {
      setErrorMessage('Eroare la conexiunea cu serverul la încărcare.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  // Features
  function addFeature() {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures((prev) => [...prev, featureInput.trim()]);
      setFeatureInput('');
    }
  }

  function removeFeature(idx: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  }

  // Variants
  function toggleSize(s: string) {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  }

  function addCustomSize() {
    if (customSizeInput.trim() && !selectedSizes.includes(customSizeInput.trim())) {
      setSelectedSizes((prev) => [...prev, customSizeInput.trim()]);
      setCustomSizeInput('');
    }
  }

  function toggleColor(c: string) {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  }

  function addCustomColor() {
    if (customColorInput.trim() && !selectedColors.includes(customColorInput.trim())) {
      setSelectedColors((prev) => [...prev, customColorInput.trim()]);
      setCustomColorInput('');
    }
  }

  // Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!title.trim()) {
      setErrorMessage('Titlul produsului este obligatoriu.');
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Introdu un preț de vânzare valid (mai mare ca 0).');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Produsul trebuie să conțină cel puțin o imagine.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id: product.id,
        title: title.trim(),
        description: description.trim() || title.trim(),
        price: numPrice,
        originalPrice: !isNaN(numOriginalPrice) && numOriginalPrice > 0 ? numOriginalPrice : null,
        stock: parseInt(stock, 10) || 0,
        sku: sku.trim() || null,
        images,
        categoryId,
        vendorId: sessionRole === 'ADMIN' ? vendorId : undefined,
        isPublished,
        brand: brand.trim() || undefined,
        material: material.trim() || undefined,
        warranty: warranty.trim() || undefined,
        weight: weight.trim() || undefined,
        features,
        sizes: selectedSizes,
        colors: selectedColors,
      };

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'A apărut o eroare la salvarea modificărilor.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Modificările au fost salvate cu succes în baza de date!');
      setIsSubmitting(false);
      router.refresh();
    } catch {
      setErrorMessage('Eroare de conexiune cu serverul. Te rugăm să reîncerci.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between gap-3 text-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
          <Link
            href={`/produse/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <Eye size={13} />
            <span>Vezi produsul pe site ↗</span>
          </Link>
        </div>
      )}

      {/* ── CARD 1: Galerie Poze & Imagini ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Upload size={18} />
              </span>
              <h2 className="text-lg font-black text-gray-900">
                Galerie Imagini Produs ({images.length})
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Prima imagine este imaginea principală afișată în catalog și la căutare.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors border border-blue-200/60">
              <Upload size={14} />
              <span>{isUploading ? 'Se încarcă...' : 'Încarcă Poză din PC'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Input adaugare imagine prin link URL */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              placeholder="Adaugă poză direct prin link URL (ex: https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
              className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={addImageUrl}
            className="px-4 py-2.5 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <Plus size={14} />
            <span>Adaugă URL</span>
          </button>
        </div>

        {/* Grid Imagini */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((img, idx) => (
            <div
              key={`${img}-${idx}`}
              className={`group relative rounded-2xl overflow-hidden border transition-all ${
                idx === 0
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={img}
                  alt={`Poză ${idx + 1}`}
                  fill
                  sizes="180px"
                  className="object-cover"
                />

                {/* Badge principal */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                    Principală
                  </div>
                )}

                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end gap-1">
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-xs"
                        title="Șterge poza"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx - 1)}
                          className="p-1 bg-white/90 text-gray-800 rounded-md hover:bg-white text-[11px]"
                          title="Mută la stânga"
                        >
                          <ArrowLeft size={12} />
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx + 1)}
                          className="p-1 bg-white/90 text-gray-800 rounded-md hover:bg-white text-[11px]"
                          title="Mută la dreapta"
                        >
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>

                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => makePrimaryImage(idx)}
                        className="text-[10px] font-bold bg-white/95 hover:bg-white text-blue-800 px-2 py-1 rounded-md transition-colors shadow-xs"
                      >
                        Fă Principală
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-semibold">Foto #{idx + 1}</span>
                {idx === 0 && <span className="text-blue-600 font-bold">Cover</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CARD 2: Prețuri, Discount & Stoc ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
            <Tag size={18} />
          </span>
          <div>
            <h2 className="text-lg font-black text-gray-900">Prețuri &amp; Stoc</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Ajustează prețul final de vânzare, prețul tăiat și cantitatea în stoc.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Preț Vânzare */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Preț de Vânzare (RON) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-base font-black text-gray-900 pl-3.5 pr-14 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                LEI
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Prețul final plătit de client.</p>
          </div>

          {/* Preț Tăiat */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Preț Original / Tăiat (RON)</span>
              {discountPercent !== null && (
                <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  -{discountPercent}% Reducere
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
                placeholder="Opțional (ex: 199.99)"
                className="w-full text-base font-bold text-gray-700 pl-3.5 pr-14 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                LEI
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Dacă este mai mare decât prețul de vânzare, va fi afișat tăiat.
            </p>
          </div>

          {/* Stoc */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Stoc Disponibil (Bucăți) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full text-base font-black text-gray-900 pl-3.5 pr-14 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                BUC
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {parseInt(stock, 10) > 0 ? 'Produsul apare în stoc pe site.' : 'Produs epuizat.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Informații Generale (Titlu, Categorie, Brand, SKU) ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
            <Package size={18} />
          </span>
          <div>
            <h2 className="text-lg font-black text-gray-900">Informații Produs</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Titlul, categoria, brandul și identificatorii de catalog.
            </p>
          </div>
        </div>

        {/* Titlu */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Titlu Produs *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-semibold text-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Grid: Categorie & Brand & SKU & Vânzător */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Categorie */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Categorie *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs font-semibold text-gray-900 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Brand / Producător
            </label>
            <input
              type="text"
              placeholder="ex: TOPinStock, Victronic"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full text-xs font-semibold text-gray-900 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* SKU / Cod bare */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Cod SKU / Barcode
            </label>
            <input
              type="text"
              placeholder="ex: SKU-123456"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full text-xs font-semibold text-gray-900 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            />
          </div>

          {/* Vânzător (doar Admin) */}
          {sessionRole === 'ADMIN' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Vânzător (Cont Magazin)
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full text-xs font-semibold text-gray-900 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.storeName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── CARD 4: Descriere Produs ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <ListChecks size={18} />
          </span>
          <div>
            <h2 className="text-lg font-black text-gray-900">Descriere Produs</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Descrierea completă vizibilă clienților pe pagina de produs.
            </p>
          </div>
        </div>

        <div>
          <textarea
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs sm:text-sm font-medium text-gray-800 p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans"
            placeholder="Descrie caracteristicile, specificațiile și beneficiile produsului..."
          />
        </div>
      </div>

      {/* ── CARD 5: Specificații Tehnice & Atribute ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <span className="p-2 rounded-xl bg-orange-50 text-orange-700">
            <Shield size={18} />
          </span>
          <div>
            <h2 className="text-lg font-black text-gray-900">Specificații &amp; Caracteristici</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Material, garanție, greutate și puncte forte.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Material</label>
            <input
              type="text"
              placeholder="ex: Inox, Bumbac, Plastic ABS"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Garanție</label>
            <input
              type="text"
              placeholder="ex: 24 luni"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Greutate</label>
            <input
              type="text"
              placeholder="ex: 0.85 kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Caracteristici Cheie */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Caracteristici Cheie (Bullet Points)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Adaugă o caracteristică (ex: Rezistent la apă, Ușor de curățat...)"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
              className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors"
            >
              Adaugă
            </button>
          </div>

          {features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {features.map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  <span>{feat}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CARD 6: Variante (Mărimi & Culori) ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <Scissors size={18} />
          </span>
          <div>
            <h2 className="text-lg font-black text-gray-900">Variante (Mărimi &amp; Culori)</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Selectează opțiunile disponibile pentru clienți (dacă produsul are variante).
            </p>
          </div>
        </div>

        {/* Mărimi */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">Mărimi Disponibile</label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PRESET_SIZES.map((sz) => {
              const active = selectedSizes.includes(sz);
              return (
                <button
                  type="button"
                  key={sz}
                  onClick={() => toggleSize(sz)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="Mărime personalizată..."
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none"
            />
            <button
              type="button"
              onClick={addCustomSize}
              className="px-3 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Adaugă
            </button>
          </div>
        </div>

        {/* Culori */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">Culori Disponibile</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((col) => {
              const active = selectedColors.includes(col.name);
              return (
                <button
                  type="button"
                  key={col.name}
                  onClick={() => toggleColor(col.name)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-xs"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CARD 7: Status & Vizibilitate ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-gray-900">Vizibilitate în Magazin</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Dacă este activ, produsul este indexat și poate fi comandat de clienți.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
          <span className={`text-xs font-bold ${isPublished ? 'text-emerald-700' : 'text-gray-500'}`}>
            {isPublished ? 'Activ (Publicat)' : 'Inactiv (Ciornă / Ascuns)'}
          </span>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR FOR SAVE ── */}
      <div className="sticky bottom-4 z-40 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-gray-200 shadow-xl flex items-center justify-between gap-4">
        <Link
          href="/admin"
          className="text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          ← Anulează și revino la catalog
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/produse/${product.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors"
          >
            <Eye size={14} />
            <span>Vezi Pagina Live</span>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Se salvează modificările...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Salvează Toate Modificările</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
