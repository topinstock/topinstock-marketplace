'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  PackageCheck,
  Calendar,
  MapPin,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  Printer,
  Truck,
  Store,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';

interface OrderConfirmationProps {
  params: Promise<{ id: string }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const clearCart = useCartStore((s) => s.clearCart);

  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Automatically clear cart and load stored order details from sessionStorage or fallback to API
  useEffect(() => {
    clearCart();

    let foundInSession = false;
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`order_${orderId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setOrderData(parsed);
          foundInSession = true;
          setIsLoading(false);
        } catch (e) {
          console.error('Error parsing stored order from sessionStorage:', e);
        }
      }
    }

    // If not found in sessionStorage (e.g. refreshed or opened in new tab), fetch from backend API
    if (!foundInSession) {
      setIsLoading(true);
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrderData(data.order);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch order from API:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [orderId, clearCart]);

  const orderNumber =
    orderData?.orderNumber || `TS-${orderId.slice(-6).toUpperCase()}`;

  const formattedDate = orderData?.date
    ? new Date(orderData.date).toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/70 py-10 print:bg-white print:py-0">
      <div className="container-app max-w-3xl">
        {/* ── Success Banner ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 text-center mb-6 print:border-none print:shadow-none print:p-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xs animate-in zoom-in-50 duration-300 print:hidden">
            <CheckCircle2 size={46} strokeWidth={2} />
          </div>

          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider print:border print:border-emerald-300">
            Comandă Confirmată
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">
            Comanda ta a fost plasată cu succes!
          </h1>

          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Îți mulțumim pentru cumpărături. Confirmarea a fost înregistrată, iar vânzătorul pregătește coletul pentru expediere.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-gray-50 border border-gray-200/80 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Număr comandă:</span>
              <span className="font-mono font-black text-blue-900 text-base">{orderNumber}</span>
            </div>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Calendar size={14} className="text-blue-700" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* ── Delivery Notice Card ── */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 mb-6 flex items-start gap-4 print:hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Truck size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-blue-950 text-sm">
                Livrare estimată în 2-3 zile
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                Curier Rapid
              </span>
            </div>
            <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
              Comanda va fi preluată de partenerul de curierat (DPD / Fan Courier). Vei primi un SMS și un email cu numărul AWB pentru urmărirea în timp real a coletului.
            </p>
          </div>
        </div>

        {/* ── Order Details & Summary Card ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6 print:border-none print:shadow-none print:p-2">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium">Se încarcă detaliile comenzii...</p>
            </div>
          ) : (
            <>
              {/* Items List */}
              {orderData?.items && orderData.items.length > 0 && (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                      <PackageCheck size={18} className="text-blue-700" />
                      <span>Produse comandate ({orderData.items.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="print:hidden text-xs font-semibold text-gray-500 hover:text-blue-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Printează / PDF</span>
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {orderData.items.map((item: any, idx: number) => (
                      <div key={item.id || idx} className="py-3.5 flex gap-4 items-center">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                          <Image
                            src={item.image || '/images/product_laptop.jpg'}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-contain object-center"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-1">
                            <span className="flex items-center gap-1 text-blue-700 font-medium">
                              <Store size={11} />
                              {item.vendorName || 'Vânzător Partener'}
                            </span>
                            {item.size && <span>• Mărime: {item.size}</span>}
                            <span>• Cantitate: {item.quantity} buc.</span>
                            <span>• Preț unitar: {Number(item.price).toFixed(2)} LEI</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-extrabold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} LEI
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery & Payment details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
                {/* Shipping Info */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-2">
                    <MapPin size={14} className="text-blue-700" />
                    <span>Adresă de livrare</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
                    {orderData?.customer?.fullName || 'Client TOPinStock'}
                  </p>
                  <p className="text-gray-600">
                    <span className="text-gray-400">Telefon:</span> {orderData?.customer?.phone || 'Furnizat la checkout'}
                  </p>
                  {orderData?.customer?.email && (
                    <p className="text-gray-600">
                      <span className="text-gray-400">Email:</span> {orderData.customer.email}
                    </p>
                  )}
                  <p className="text-gray-700 font-medium pt-1">
                    {orderData?.customer?.address || 'Adresă completată'}
                  </p>
                  <p className="text-gray-600">
                    {orderData?.customer?.city}, Județul {orderData?.customer?.county}
                  </p>
                  {orderData?.customer?.notes && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/60 p-2 rounded-lg mt-2">
                      <span className="font-bold">Mențiuni curier:</span> {orderData.customer.notes}
                    </p>
                  )}
                </div>

                {/* Payment Info */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-2">
                    <CreditCard size={14} className="text-blue-700" />
                    <span>Modalitate de plată</span>
                  </div>
                  <div className="inline-block bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-bold text-gray-800 text-xs mb-1">
                    {orderData?.paymentMethod === 'card'
                      ? 'Card bancar online (3D Secure)'
                      : 'Ramburs la livrare (Cash sau Card la curier)'}
                  </div>
                  <p className="text-gray-500 mt-1 leading-relaxed">
                    {orderData?.paymentMethod === 'card'
                      ? 'Tranzacția a fost autorizată securizat cu succes.'
                      : 'Plata se achită direct agentului de curierat în momentul recepției coletului.'}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-2">
                    <ShieldCheck size={13} />
                    <span>Factură fiscală inclusă în colet și disponibilă online</span>
                  </div>
                </div>
              </div>

              {/* Total Breakdown */}
              {orderData?.grandTotal && (
                <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal produse:</span>
                    <span className="font-semibold text-gray-900">
                      {Number(orderData.subtotal || orderData.grandTotal - (orderData.deliveryFee || 19)).toFixed(2)} LEI
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxă livrare (curier rapid):</span>
                    <span className="font-semibold text-gray-900">
                      {Number(orderData.deliveryFee || 19).toFixed(2)} LEI
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline text-sm">
                    <span className="font-bold text-gray-900 text-base">Total de achitat:</span>
                    <span className="text-2xl font-black text-blue-900">
                      {Number(orderData.grandTotal).toFixed(2)} LEI
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 print:hidden">
                <Link
                  href="/produse"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 px-4 rounded-xl text-center text-sm shadow-sm transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Continuă cumpărăturile</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/cont"
                  className="sm:w-52 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 px-4 rounded-xl text-center text-sm transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={16} className="text-gray-600" />
                  <span>Vezi în contul meu</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
