import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  CreditCard,
  Banknote,
  MapPin,
  Store,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { cn, safeJsonParse, formatPrice } from '@/lib/utils';
import OrderStatusSelector from '@/components/admin/OrderStatusSelector';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const session = await getSession();
  const isAdmin = session?.role === 'ADMIN';
  const isVendor = session?.role === 'VENDOR';
  const vendorId = session?.vendorId;

  let orders: any[] = [];

  try {
    const orderWhere: any = {};
    if (isVendor && vendorId) {
      orderWhere.orderItems = { some: { vendorId } };
    }

    const dbOrders = await prisma.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          where: isVendor && vendorId ? { vendorId } : undefined,
          include: {
            product: { select: { title: true, images: true, slug: true } },
            vendor: { select: { storeName: true } },
          },
        },
      },
    });

    orders = dbOrders.map((o) => {
      const address = safeJsonParse<any>(o.shippingAddress, {});
      const vendorItemsTotal = o.orderItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

      return {
        id: o.id,
        orderNumber: `TS-${o.id.slice(-6).toUpperCase()}`,
        status: o.status,
        totalAmount: isVendor ? vendorItemsTotal : Number(o.totalAmount),
        paymentMethod: o.paymentMethod,
        customerName: address?.fullName || o.user?.name || 'Client Anonim',
        customerEmail: address?.email || o.user?.email || 'N/A',
        customerPhone: address?.phone || 'N/A',
        customerCity: address?.city ? `${address.city}, ${address.county || ''}` : 'România',
        createdAt: o.createdAt,
        items: o.orderItems.map((item) => {
          const productImages = safeJsonParse<string[]>(item.product?.images, ['/images/product_laptop.jpg']);
          return {
            id: item.id,
            title: item.product?.title || 'Produs TOPinStock',
            image: productImages[0] || '/images/product_laptop.jpg',
            price: Number(item.price),
            quantity: item.quantity,
            vendor: item.vendor?.storeName || 'Magazin Oficial',
          };
        }),
      };
    });
  } catch (error) {
    console.error('Error loading orders:', error);
    orders = [];
  }

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;

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
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Gestionare Comenzi
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Urmărește statusul comenzilor plasate de clienți și livrările prin curier.
          </p>
        </div>

        {/* Status Count Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1.5 rounded-xl">
            {pendingCount} În așteptare
          </span>
          <span className="text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/80 px-3 py-1.5 rounded-xl">
            {processingCount} În procesare
          </span>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
            {completedCount} Finalizate
          </span>
        </div>
      </div>

      {/* ── Orders Table or Empty State ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg">
              Nu există comenzi înregistrate
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              În acest moment ai 0 comenzi. Comenzile noi plasate de clienți pe site vor apărea aici în timp real pentru procesare, emiterea AWB-ului și expediere prin curier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100">
                <th className="py-4 px-6">Comandă</th>
                <th className="py-4 px-4">Client &amp; Destinație</th>
                <th className="py-4 px-4">Articole</th>
                <th className="py-4 px-4">Plată</th>
                <th className="py-4 px-4">Total</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Order Number & Date */}
                  <td className="py-4 px-6 align-top">
                    <p className="font-mono font-bold text-gray-900 text-sm">
                      {o.orderNumber}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(o.createdAt).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>

                  {/* Customer Info */}
                  <td className="py-4 px-4 align-top">
                    <p className="font-bold text-gray-900">{o.customerName}</p>
                    <p className="text-[11px] text-gray-500">{o.customerEmail}</p>
                    <p className="text-[11px] text-gray-500">{o.customerPhone}</p>
                    <div className="flex items-center gap-1 text-[11px] text-blue-800 font-medium mt-1">
                      <MapPin size={11} />
                      <span>{o.customerCity}</span>
                    </div>
                  </td>

                  {/* Items list */}
                  <td className="py-4 px-4 align-top">
                    <div className="space-y-2 max-w-xs">
                      {o.items.map((it: any) => (
                        <div key={it.id} className="flex items-center gap-2">
                          <img
                            src={it.image}
                            alt={it.title}
                            className="w-8 h-10 object-cover rounded bg-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-xs truncate">
                              {it.quantity}x {it.title}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Vândut de {it.vendor}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="py-4 px-4 align-top">
                    {o.paymentMethod === 'CARD_ONLINE' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                        <CreditCard size={13} />
                        Card online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-1 rounded-md">
                        <Banknote size={13} />
                        Ramburs
                      </span>
                    )}
                  </td>

                  {/* Total */}
                  <td className="py-4 px-4 align-top">
                    <p className="font-black text-gray-900 text-sm">
                      {o.totalAmount.toFixed(2)} LEI
                    </p>
                    <p className="text-[10px] text-gray-400">incl. livrare</p>
                  </td>

                  {/* Status Pill with interactive changer */}
                  <td className="py-4 px-6 align-top text-center">
                    <OrderStatusSelector orderId={o.id} initialStatus={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
