'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Upload,
  Link as LinkIcon,
  Plus,
  X,
  Check,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Store,
  Sparkles,
  ShoppingBag,
  Tag,
  Layers,
  ArrowRight,
  Bot,
  Info,
  Shield,
  Weight,
  Scissors,
  ListChecks,
} from 'lucide-react';
import { formatPrice, slugify } from '@/lib/utils';

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

export interface ProductInitialData {
  title?: string;
  description?: string;
  brand?: string;
  price?: string;
  originalPrice?: string;
  stock?: string;
  sku?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  categoryId?: string;
  material?: string;
  warranty?: string;
  weight?: string;
  features?: string[];
  sourceUrl?: string;
}

interface ProductCreateFormProps {
  categories: CategoryOption[];
  vendors: VendorOption[];
  sessionRole: string;
  currentVendorId: string;
  initialData?: ProductInitialData;
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

const DEMO_GALLERY = [
  { label: 'Laptop Modern', url: '/images/product_laptop.jpg' },
  { label: 'Căști Wireless', url: '/images/product_headphones.jpg' },
  { label: 'Smartwatch Pro', url: '/images/product_smartwatch.jpg' },
  { label: 'Adidași Sport', url: '/images/product_sneakers.jpg' },
  { label: 'Look Bărbați', url: '/images/hero1.jpg' },
  { label: 'Look Femei', url: '/images/hero2.jpg' },
];

export default function ProductCreateForm({
  categories,
  vendors,
  sessionRole,
  currentVendorId,
  initialData,
}: ProductCreateFormProps) {
  const router = useRouter();
  const isFromImporter = !!initialData?.sourceUrl;

  // Form State — pre-filled from AI draft if provided
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [material, setMaterial] = useState(initialData?.material || '');
  const [warranty, setWarranty] = useState(initialData?.warranty || '');
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [featureInput, setFeatureInput] = useState('');
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || categories[0]?.id || ''
  );
  const [price, setPrice] = useState(initialData?.price || '');
  const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice || '');
  const [stock, setStock] = useState(initialData?.stock || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [customVendorId, setCustomVendorId] = useState(currentVendorId || vendors[0]?.id || '');

  // Images state
  const defaultImages = initialData?.images && initialData.images.length > 0
    ? initialData.images
    : ['/images/product_laptop.jpg'];
  const [images, setImages] = useState<string[]>(defaultImages);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Variants state
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialData?.sizes && initialData.sizes.length > 0 ? initialData.sizes : []
  );
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialData?.colors && initialData.colors.length > 0 ? initialData.colors : []
  );
  const [customColorInput, setCustomColorInput] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdProduct, setCreatedProduct] = useState<any | null>(null);

  // Check sessionStorage fallback if initialData was not provided
  useEffect(() => {
    if (!initialData) {
      try {
        const raw = sessionStorage.getItem('topinstock_product_draft');
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.title) setTitle(draft.title);
          if (draft.description) setDescription(draft.description);
          if (draft.brand) setBrand(draft.brand);
          if (draft.material) setMaterial(draft.material);
          if (draft.warranty) setWarranty(draft.warranty);
          if (draft.weight) setWeight(draft.weight);
          if (draft.features && draft.features.length) setFeatures(draft.features);
          if (draft.price) setPrice(String(draft.price));
          if (draft.originalPrice) setOriginalPrice(String(draft.originalPrice));
          if (draft.stock) setStock(String(draft.stock));
          if (draft.sku) setSku(draft.sku);
          if (draft.images && draft.images.length) setImages(draft.images);
          if (draft.sizes && draft.sizes.length) setSelectedSizes(draft.sizes);
          if (draft.colors && draft.colors.length) setSelectedColors(draft.colors);
          if (draft.categorySlug && categories.length > 0) {
            const match = categories.find((c) =>
              c.slug.toLowerCase().includes(draft.categorySlug.toLowerCase()) ||
              draft.categorySlug.toLowerCase().includes(c.slug.toLowerCase())
            );
            if (match) setCategoryId(match.id);
          }
          sessionStorage.removeItem('topinstock_product_draft');
        }
      } catch {}
    }
  }, [initialData, categories]);

  // Price calculations
  const numPrice = parseFloat(price) || 0;
  const numOriginalPrice = parseFloat(originalPrice) || 0;
  const discountPercent =
    numOriginalPrice > numPrice && numPrice > 0
      ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100)
      : null;

  // Toggle helpers
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

  function addImageUrl() {
    if (urlInput.trim() && !images.includes(urlInput.trim())) {
      setImages((prev) => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function pickDemoImage(url: string) {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  }

  // Handle local file upload
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
        setErrorMessage(data.error || 'Eroare la încărcarea imaginii.');
        setIsUploading(false);
        return;
      }

      setImages((prev) => [...prev, data.url]);
    } catch {
      setErrorMessage('Eroare de conexiune la încărcare.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  // Features helpers
  function addFeature() {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures((prev) => [...prev, featureInput.trim()]);
      setFeatureInput('');
    }
  }

  function removeFeature(idx: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  }

  // Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Titlul produsului este obligatoriu.');
      return;
    }

    if (numPrice <= 0) {
      setErrorMessage('Introdu un preț de vânzare valid (minim 1 LEI).');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Adaugă cel puțin o imagine pentru produs.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || title.trim(),
        brand: brand.trim() || undefined,
        material: material.trim() || undefined,
        warranty: warranty.trim() || undefined,
        weight: weight.trim() || undefined,
        features: features.length > 0 ? features : undefined,
        categoryId,
        price: numPrice,
        originalPrice: numOriginalPrice > 0 ? numOriginalPrice : null,
        stock: parseInt(stock, 10) || 0,
        sku: sku.trim() || undefined,
        images,
        sizes: selectedSizes,
        colors: selectedColors,
        customVendorId: sessionRole === 'ADMIN' ? customVendorId : undefined,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'A apărut o eroare la salvarea produsului.');
        setIsSubmitting(false);
        return;
      }

      setCreatedProduct(data.product);
      setIsSubmitting(false);
    } catch (err) {
      setErrorMessage('Eroare de rețea. Te rugăm să reîncerci.');
      setIsSubmitting(false);
    }
  }

  // Current category name for preview
  const activeCategory = categories.find((c) => c.id === categoryId)?.name || 'General';

  return (
    <>
      {/* AI Import Banner */}
      {isFromImporter && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex items-start gap-3 text-sm">
          <Bot size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-orange-900">Date pre-completate de AI — verifică și ajustează tot</p>
            <p className="text-orange-700 text-xs mt-0.5">
              Sursă:{' '}
              <a href={initialData?.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-900">
                {initialData?.sourceUrl || 'link importat'}
              </a>
              {' '}— AI poate greși, în special la prețuri și stoc. Verifică toate câmpurile cu atenție.
            </p>
          </div>
          <Link
            href="/admin/importer"
            className="text-xs text-orange-700 hover:text-orange-900 font-semibold whitespace-nowrap"
          >
            ← Înapoi la Importer
          </Link>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {createdProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Produs Publicat cu Succes!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Produsul <span className="font-bold text-gray-900">„{createdProduct.title}”</span> a fost salvat în baza de date locală SQLite și este acum activ în magazinul TOPinStock.
            </p>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 mb-6 flex items-center gap-4 text-left">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 relative">
                <Image
                  src={createdProduct.images[0] || '/images/product_laptop.jpg'}
                  alt={createdProduct.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{createdProduct.title}</p>
                <p className="text-xs text-orange-600 font-bold">{formatPrice(createdProduct.price)}</p>
                <p className="text-[11px] text-gray-500">Stoc: {createdProduct.stock} buc. • {activeCategory}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/produse/${createdProduct.slug}`}
                target="_blank"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-colors text-sm"
              >
                <span>Vezi Pagina Live a Produsului</span>
                <ExternalLink size={16} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setCreatedProduct(null);
                  setTitle('');
                  setDescription('');
                  setPrice('');
                  setOriginalPrice('');
                  setSku('');
                }}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-5 rounded-2xl transition-colors text-sm"
              >
                Adaugă Încă Un Produs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FORM GRID */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input Fields (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Informații Generale */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-3">
              <Layers size={20} className="text-orange-500" />
              <span>1. Informații Generale</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Titlu Produs <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Cămașă Bărbați Casual Oxford Slim Fit"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
              />
              {title && (
                <p className="text-[11px] text-gray-400 mt-1 truncate">
                  Slug URL generat: <code className="text-orange-600">/produse/{slugify(title)}</code>
                </p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Brand / Producător
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: Nike, Adidas, Zara, Producător propriu"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:bg-white focus:border-orange-500 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Categorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.parentId ? '(Subcategorie)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Cod Produs (SKU / Cod Intern)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ex: TOP-CAM-01"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:bg-white focus:border-orange-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Admin-only Vendor Selector */}
            {sessionRole === 'ADMIN' && vendors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Vânzător Asociat (Opțiune Super-Admin)
                </label>
                <select
                  value={customVendorId}
                  onChange={(e) => setCustomVendorId(e.target.value)}
                  className="w-full bg-amber-50/60 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:bg-white focus:border-amber-500 transition-all font-medium"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.storeName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Descriere Detaliată Produs
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specifică materialele, instrucțiunile de îngrijire, croiala și orice detalii relevante pentru cumpărător..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:bg-white focus:border-orange-500 transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                {description.length} / 2000 caractere recomandate
              </p>
            </div>
          </div>

          {/* 2. Preț și Stoc */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-3">
              <Tag size={20} className="text-emerald-500" />
              <span>2. Preț și Stoc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Preț Vânzare (RON) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="149.99"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-12 py-3 text-sm text-gray-900 font-bold focus:bg-white focus:border-orange-500 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    LEI
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Preț Vechi Tăiat (RON)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="199.99"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-12 py-3 text-sm text-gray-900 font-semibold focus:bg-white focus:border-orange-500 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    LEI
                  </span>
                </div>
                {discountPercent && discountPercent > 0 && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    Reducere aplicată: -{discountPercent}%
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Stoc Disponibil <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="50"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-bold focus:bg-white focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3. Imagini Produs */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                <Upload size={20} className="text-indigo-500" />
                <span>3. Imagini Produs</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {images.length} adăugate
              </span>
            </div>

            {/* Quick preset selector */}
            <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100 text-xs">
              <p className="font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" />
                Selectează rapid din imaginile implicite:
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_GALLERY.map((item) => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => pickDemoImage(item.url)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload or Link Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File upload from computer */}
              <div className="border-2 border-dashed border-gray-200 hover:border-orange-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-gray-50/50 relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin" />
                    ) : (
                      <Upload size={20} />
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-700">
                    {isUploading ? 'Se încarcă fișierul...' : 'Încarcă de pe PC'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG sau WEBP</p>
                </div>
              </div>

              {/* URL paste input */}
              <div className="flex flex-col justify-center space-y-2 p-3 bg-gray-50/50 rounded-2xl border border-gray-200">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <LinkIcon size={14} className="text-gray-400" />
                  Sau lipește un link imagine extern:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://site.ro/poza.jpg"
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                  >
                    Adaugă
                  </button>
                </div>
              </div>
            </div>

            {/* Image Preview Badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm"
                >
                  <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Șterge imagine"
                  >
                    <X size={12} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Copertă
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Mărimi & Culori */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-3">
              <ShoppingBag size={20} className="text-purple-500" />
              <span>4. Variante (Mărimi și Culori)</span>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Mărimi Disponibile
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_SIZES.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 max-w-xs">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  placeholder="Mărime custom (ex: 46, One Size)"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={addCustomSize}
                  className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                >
                  + Adaugă
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Culori Disponibile
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_COLORS.map((col) => {
                  const isSelected = selectedColors.includes(col.name);
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => toggleColor(col.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-gray-300"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 max-w-xs">
                <input
                  type="text"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  placeholder="Culoare custom (ex: Turcoaz)"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={addCustomColor}
                  className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                >
                  + Adaugă
                </button>
              </div>
            </div>
          </div>

          {/* 5. Specificații Tehnice */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-3">
              <Info size={20} className="text-teal-500" />
              <span>5. Specificații Tehnice</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Material */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Scissors size={12} className="text-gray-400" /> Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Ex: Bumbac 100%, Poliester"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-teal-500 transition-all"
                />
              </div>

              {/* Warranty */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Shield size={12} className="text-gray-400" /> Garanție
                </label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="Ex: 2 ani, 12 luni"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-teal-500 transition-all"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Weight size={12} className="text-gray-400" /> Greutate
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 350g, 1.2kg"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Features / Bullet Points */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <ListChecks size={13} className="text-gray-400" /> Caracteristici Cheie (bullet points vizibile în pagina produsului)
              </label>

              {features.length > 0 && (
                <ul className="space-y-1.5 mb-3">
                  {features.map((f, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 text-sm text-teal-900">
                      <span className="flex items-center gap-2">
                        <Check size={13} className="text-teal-600 shrink-0" />
                        {f}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-teal-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                  placeholder="Ex: Material premium antibacterian, rezistent la uzură"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                >
                  + Adaugă
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Publică Produsul pe TOPinStock România</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Live Preview (4 Cols) */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold flex items-center gap-1.5 text-orange-400">
                <Sparkles size={14} /> Previzualizare Live
              </span>
              <span className="text-slate-400 text-[11px]">Card în magazin</span>
            </div>

            {/* Product Card Mockup */}
            <div className="bg-white rounded-2xl p-3 text-gray-900 shadow-md space-y-3">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                <Image
                  src={images[0] || '/images/product_laptop.jpg'}
                  alt={title || 'Previzualizare produs'}
                  fill
                  className="object-cover"
                />
                {discountPercent && discountPercent > 0 && (
                  <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    -{discountPercent}%
                  </span>
                )}
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {stock} buc. în stoc
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-orange-600 tracking-wider">
                  {activeCategory}
                </span>
                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mt-0.5">
                  {title || 'Titlul noului tău produs va apărea aici'}
                </h3>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-gray-900">
                  {numPrice > 0 ? formatPrice(numPrice) : '0,00 LEI'}
                </span>
              </div>

              {/* Variants Pill Preview */}
              {(selectedSizes.length > 0 || selectedColors.length > 0) && (
                <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                  {selectedSizes.length > 0 && (
                    <p className="truncate">
                      <span className="font-semibold text-gray-700">Mărimi:</span>{' '}
                      {selectedSizes.join(', ')}
                    </p>
                  )}
                  {selectedColors.length > 0 && (
                    <p className="truncate">
                      <span className="font-semibold text-gray-700">Culori:</span>{' '}
                      {selectedColors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-3 text-center">
              După publicare, produsul va fi indexat imediat în catalog și la căutări.
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
