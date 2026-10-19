'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  ArrowLeft,
  Lock,
  ShoppingBag,
  Store,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useHydratedCart, FLAT_DELIVERY_FEE, MINIMUM_ORDER_AMOUNT } from '@/lib/store/useCartStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';

// Romanian Counties list for convenient selection
const JUDETE = [
  'București', 'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brașov', 'Brăila', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța',
  'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita',
  'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș',
  'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava',
  'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea'
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    deliveryFee,
    grandTotal,
    isReady,
    clearCart,
    isMinimumMet,
    minimumDifference,
    minimumOrderAmount,
  } = useHydratedCart();
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    county: 'București',
    city: '',
    address: '',
    notes: '',
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<'ramburs' | 'card'>('ramburs');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    freeShipping: boolean;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  // Dynamic calculations taking promo and Romanian TVA (19%) into account
  const currentDiscount = appliedPromo?.discountAmount || 0;
  const isFreeShipping = subtotal >= 300 || Boolean(appliedPromo?.freeShipping);
  const effectiveDeliveryFee = items.length > 0 ? (isFreeShipping ? 0 : 19) : 0;
  const calculatedGrandTotal = Math.max(0, subtotal - currentDiscount) + effectiveDeliveryFee;
  const vatIncluded = Math.round((calculatedGrandTotal - calculatedGrandTotal / 1.19) * 100) / 100;

  async function handleApplyPromo() {
    if (!promoCodeInput.trim()) return;
    setIsCheckingPromo(true);
    setPromoError(null);

    try {
      const res = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          promoCode: promoCodeInput.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.promo?.isValid) {
        setPromoError(data.promo?.message || data.error || 'Codul promoțional nu este valid.');
        setAppliedPromo(null);
      } else {
        setAppliedPromo({
          code: data.promo.code,
          discountAmount: data.promo.discountAmount,
          freeShipping: data.promo.freeShipping,
          message: data.promo.message,
        });
        setPromoCodeInput('');
      }
    } catch {
      setPromoError('A apărut o problemă la verificarea codului promoțional.');
    } finally {
      setIsCheckingPromo(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoError(null);
  }

  // Form field change handler
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  // Card input change handlers with automatic formatting
  function handleCardNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData((prev) => ({ ...prev, number: formatted }));
    if (errors.cardNumber) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.cardNumber;
        return next;
      });
    }
  }

  function handleCardExpiryChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardData((prev) => ({ ...prev, expiry: val }));
    if (errors.cardExpiry) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.cardExpiry;
        return next;
      });
    }
  }

  function handleCardCvcChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData((prev) => ({ ...prev, cvc: val }));
    if (errors.cardCvc) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.cardCvc;
        return next;
      });
    }
  }

  // Client validation
  function validate() {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Introduceți numele și prenumele complet.';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Introduceți o adresă de email validă.';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      newErrors.phone = 'Introduceți un număr de telefon valid.';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Introduceți orașul sau localitatea.';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Introduceți adresa de livrare (stradă, număr etc.).';
    }

    if (paymentMethod === 'card') {
      const cleanNum = cardData.number.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        newErrors.cardNumber = 'Introduceți numărul cardului (16 cifre).';
      }
      if (!cardData.name.trim()) {
        newErrors.cardName = 'Introduceți numele de pe card.';
      }
      if (!cardData.expiry.trim() || cardData.expiry.length < 5) {
        newErrors.cardExpiry = 'Format LL/AA.';
      }
      if (!cardData.cvc.trim() || cardData.cvc.length < 3) {
        newErrors.cardCvc = 'Cod CVV 3 cifre.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Submit order
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;
    if (items.length === 0) {
      setApiError('Coșul este gol.');
      return;
    }
    if (!isMinimumMet) {
      setApiError(
        `Comanda minimă pe TOPinStock este de ${minimumOrderAmount} LEI. Valoarea produselor din coș este de ${subtotal.toFixed(2)} LEI. Vă rugăm să mai adăugați produse de minim ${minimumDifference.toFixed(2)} LEI.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
          shipping: {
            county: formData.county,
            city: formData.city,
            address: formData.address,
            notes: formData.notes,
          },
          paymentMethod,
          promoCode: appliedPromo?.code || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
            vendorId: i.vendorId,
            size: i.size,
            color: i.color,
            image: i.image,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'A apărut o problemă la plasarea comenzii.');
      }

      if (paymentMethod === 'card') {
        setIsProcessingCard(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Store summary in sessionStorage for the confirmation screen
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `order_${data.orderId}`,
          JSON.stringify({
            orderId: data.orderId,
            orderNumber: data.orderNumber || `TS-${data.orderId.slice(-6).toUpperCase()}`,
            customer: formData,
            paymentMethod,
            items,
            subtotal,
            deliveryFee,
            grandTotal: data.totalAmount || grandTotal,
            date: new Date().toISOString(),
          })
        );
      }

      // Clear client cart after successful order creation
      clearCart();

      // Redirect to confirmation page
      router.push(`/comanda-plasata/${data.orderId}`);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.');
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-4 shadow-sm">
          <ShoppingBag size={40} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Coșul tău este gol
        </h1>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Adaugă cel puțin un produs în coș pentru a putea finaliza comanda.
        </p>
        <Link
          href="/produse"
          className="bg-blue-800 hover:bg-blue-900 text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors shadow-sm"
        >
          Explorează catalogul de produse
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app max-w-6xl">
        {/* ── Top Header Navigation ── */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200/80 mb-8">
          <Link
            href="/produse"
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Continuă cumpărăturile</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <Lock size={13} />
            <span>Checkout securizat SSL 256-bit</span>
          </div>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Column: Shipping & Payment Form (7 cols) ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Section 1: Contact & Adresă Livrare */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Date de contact &amp; Livrare
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Nume și Prenume *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="ex: Ion Popescu"
                      className={cn(
                        'w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all',
                        errors.fullName
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                      )}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Adresă de Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ion.popescu@exemplu.ro"
                        className={cn(
                          'w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all',
                          errors.email
                            ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                        )}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Număr de Telefon *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="07xxxxxxxx"
                        className={cn(
                          'w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all',
                          errors.phone
                            ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                        )}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Județ *
                      </label>
                      <select
                        name="county"
                        value={formData.county}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                      >
                        {JUDETE.map((j) => (
                          <option key={j} value={j}>
                            {j}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Oraș / Localitate *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="ex: Sector 1, Cluj-Napoca..."
                        className={cn(
                          'w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all',
                          errors.city
                            ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                        )}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Adresă completă *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Stradă, număr, bloc, scară, apartament..."
                      className={cn(
                        'w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all',
                        errors.address
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                      )}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Observații pentru curier (opțional)
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="ex: Cod interfon 12, sunați înainte de livrare..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Modalitate de Plată */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Modalitate de plată
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Ramburs */}
                  <label
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      paymentMethod === 'ramburs'
                        ? 'border-blue-700 bg-blue-50/40'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ramburs"
                      checked={paymentMethod === 'ramburs'}
                      onChange={() => setPaymentMethod('ramburs')}
                      className="w-4 h-4 text-blue-700 focus:ring-blue-600"
                    />
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Banknote size={22} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        Ramburs la livrare (Cash la curier)
                      </p>
                      <p className="text-xs text-gray-500">
                        Plătești în numerar direct curierului la primirea coletului.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Card Online */}
                  <div
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      paymentMethod === 'card'
                        ? 'border-blue-700 bg-blue-50/40'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4 text-blue-700 focus:ring-blue-600"
                      />
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                        <CreditCard size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">
                            Card bancar online
                          </p>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            3D Secure Securizat
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Plată securizată instant fără comision suplimentar (Visa, Mastercard, Maestro).
                        </p>
                      </div>
                    </label>

                    {/* Interactive Simulated Card Input Fields */}
                    {paymentMethod === 'card' && (
                      <div className="mt-4 pt-4 border-t border-blue-100/80 space-y-3.5 animate-in fade-in-50 duration-200">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                            Număr Card *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardData.number}
                              onChange={handleCardNumberChange}
                              placeholder="4000 1234 5678 9010"
                              maxLength={19}
                              className={cn(
                                'w-full border rounded-xl px-4 py-2 text-sm font-mono tracking-wider text-gray-900 outline-none bg-white transition-all',
                                errors.cardNumber
                                  ? 'border-red-400 bg-red-50/20'
                                  : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                              )}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                              <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-1 rounded">VISA</span>
                              <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-1 rounded">MC</span>
                            </div>
                          </div>
                          {errors.cardNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                            Nume Titular Card *
                          </label>
                          <input
                            type="text"
                            value={cardData.name}
                            onChange={(e) => setCardData((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))}
                            placeholder="ION POPESCU"
                            className={cn(
                              'w-full border rounded-xl px-4 py-2 text-sm text-gray-900 uppercase outline-none bg-white transition-all',
                              errors.cardName
                                ? 'border-red-400 bg-red-50/20'
                                : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                            )}
                          />
                          {errors.cardName && (
                            <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                              Valabilitate (LL/AA) *
                            </label>
                            <input
                              type="text"
                              value={cardData.expiry}
                              onChange={handleCardExpiryChange}
                              placeholder="12/28"
                              maxLength={5}
                              className={cn(
                                'w-full border rounded-xl px-4 py-2 text-sm font-mono text-gray-900 outline-none bg-white transition-all',
                                errors.cardExpiry
                                  ? 'border-red-400 bg-red-50/20'
                                  : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                              )}
                            />
                            {errors.cardExpiry && (
                              <p className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                              Cod CVV / CVC *
                            </label>
                            <input
                              type="password"
                              value={cardData.cvc}
                              onChange={handleCardCvcChange}
                              placeholder="•••"
                              maxLength={4}
                              className={cn(
                                'w-full border rounded-xl px-4 py-2 text-sm font-mono text-gray-900 outline-none bg-white transition-all',
                                errors.cardCvc
                                  ? 'border-red-400 bg-red-50/20'
                                  : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                              )}
                            />
                            {errors.cardCvc && (
                              <p className="text-red-500 text-xs mt-1">{errors.cardCvc}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-1">
                          <Lock size={12} className="text-emerald-600" />
                          <span>Conexiune criptată SSL 256-bit • Datele nu sunt salvate</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Order Review & Price Breakdown (5 cols) ── */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-base">
                    Rezumatul comenzii
                  </h3>
                  <span className="text-xs font-semibold text-gray-500">
                    {items.reduce((sum, i) => sum + i.quantity, 0)} articole
                  </span>
                </div>

                {/* Items preview */}
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 mb-5 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-white flex-shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-contain object-center"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-1">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                            <span>Vândut de {item.vendorName}</span>
                            {item.size && <span>• Mărime: {item.size}</span>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-gray-500">Cantitate: {item.quantity}</span>
                          <span className="font-bold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} LEI
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Voucher / Promo Code Box */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cod promoțional (ex: TOP10)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 uppercase outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isCheckingPromo || !promoCodeInput.trim()}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isCheckingPromo ? 'Verific...' : 'Aplică'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-red-500 text-[11px] font-medium mt-1.5">{promoError}</p>
                  )}
                  {appliedPromo && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>✓ {appliedPromo.code}</span>
                        <span className="font-medium text-emerald-700">
                          ({appliedPromo.freeShipping ? 'Livrare gratuită' : `-${appliedPromo.discountAmount.toFixed(2)} LEI`})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-emerald-700 hover:text-red-600 text-[11px] font-bold hover:underline cursor-pointer"
                      >
                        Șterge
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal produse:</span>
                    <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} LEI</span>
                  </div>
                  {currentDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Reducere cupon ({appliedPromo?.code}):</span>
                      <span>-{currentDiscount.toFixed(2)} LEI</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Truck size={14} className="text-gray-400" />
                      <span>Livrare (curier rapid):</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {effectiveDeliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-xs">Gratuit</span>
                      ) : (
                        `${effectiveDeliveryFee.toFixed(2)} LEI`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs pt-1">
                    <span>TVA inclusă (19%):</span>
                    <span>{vatIncluded.toFixed(2)} LEI</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                    <span className="text-base font-extrabold text-gray-900">Total de plată:</span>
                    <span className="text-2xl font-black text-blue-900">
                      {calculatedGrandTotal.toFixed(2)} <span className="text-sm font-bold">LEI</span>
                    </span>
                  </div>
                </div>

                {/* Minimum Order Warning & Progress */}
                {!isMinimumMet && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2.5">
                    <div className="flex items-start gap-2.5 text-amber-900 font-semibold leading-relaxed">
                      <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Comandă minimă pe TOPinStock: <strong>{minimumOrderAmount} LEI</strong>. Valoarea produselor este de <strong>{subtotal.toFixed(2)} LEI</strong>. Mai adăugați produse de minim <strong>{minimumDifference.toFixed(2)} LEI</strong> pentru a putea trimite comanda.
                      </span>
                    </div>
                    <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((subtotal / minimumOrderAmount) * 100))}%` }}
                      />
                    </div>
                    <Link
                      href="/produse"
                      className="block text-center text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline pt-1"
                    >
                      ← Înapoi în catalog pentru a adăuga produse
                    </Link>
                  </div>
                )}

                {/* CTA Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isMinimumMet}
                  className={cn(
                    "w-full mt-6 font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98",
                    isMinimumMet
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                  )}
                >
                  {isProcessingCard ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Se autorizează 3D Secure...</span>
                    </div>
                  ) : isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Se procesează comanda...</span>
                    </div>
                  ) : !isMinimumMet ? (
                    <span>Minim de comandă 50 LEI (mai adaugă {minimumDifference.toFixed(2)} LEI)</span>
                  ) : (
                    <>
                      <span>Plasează comanda</span>
                      <span>({calculatedGrandTotal.toFixed(2)} LEI)</span>
                    </>
                  )}
                </button>

                {/* Badges */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    <span>Livrare rapidă în 2-3 zile lucrătoare</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Garanție de retur în 30 de zile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
