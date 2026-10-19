import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Coins,
  TrendingUp,
  Percent,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Store,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminFinantePage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/admin');
  }

  // Fetch all vendors with their order items to calculate marketplace financial balance
  const [vendors, allOrders, settings] = await Promise.all([
    prisma.vendor.findMany({
      include: {
        orderItems: {
          include: {
            order: { select: { status: true, createdAt: true } },
          },
        },
      },
    }),
    prisma.order.findMany({
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.marketplaceSettings.findUnique({
      where: { id: 'default' },
    }),
  ]);

  // Calculations
  const defaultRate = settings?.defaultCommission || 0.0;
  const totalGmv = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  // Vendor payouts ledger
  const vendorLedger = vendors.map((v) => {
    const rate = v.commissionRate ?? defaultRate;
    const vendorSales = v.orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    const marketplaceFee = vendorSales * rate;
    const netPayout = vendorSales - marketplaceFee;

    return {
      id: v.id,
      storeName: v.storeName,
      legalName: v.legalName || 'S.C. ' + v.storeName + ' S.R.L.',
      iban: v.iban || 'Nespecificat',
      bank: v.bank || 'Bancă nedeclarată',
      itemsCount: v.orderItems.length,
      grossSales: vendorSales,
      commissionRate: rate,
      marketplaceFee,
      netPayout,
    };
  });

  const totalMarketplaceRevenue = vendorLedger.reduce((sum, v) => sum + v.marketplaceFee, 0);
  const totalVendorPayouts = vendorLedger.reduce((sum, v) => sum + v.netPayout, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
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
            <span className="text-gray-300">•</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800 border border-amber-300">
              Modul Super-Admin
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <span>Finanțe, Comisioane &amp; Deconturi</span>
            <Coins size={26} className="text-amber-500" />
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Urmărește volumul brut al tranzacțiilor (GMV), marja din comisioane realizată de TOPinStock și deconturile datorate comercianților parteneri.
          </p>
        </div>
      </div>

      {/* ── Financial KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* GMV Total */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Volum Brut Tranzacționat (GMV)</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {totalGmv.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-sm font-bold text-gray-400">LEI</span>
          </p>
          <p className="text-xs text-gray-500">Total vânzări generate pe tot marketplace-ul</p>
        </div>

        {/* Venit din Comisioane TOPinStock */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-sm space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Venit Comisioane TOPinStock
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Percent size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            {totalMarketplaceRevenue.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-sm font-bold text-orange-400">LEI</span>
          </p>
          <p className="text-xs text-slate-400">Marja brută realizată de platformă din comisioane</p>
        </div>

        {/* Deconturi Vânzători */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Deconturi Datorate Partenerilor</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">
            {totalVendorPayouts.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-sm font-bold text-gray-400">LEI</span>
          </p>
          <p className="text-xs text-gray-500">Sume nete de virat în conturile IBAN ale vânzătorilor</p>
        </div>
      </div>

      {/* ── Vendor Payout Ledger Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Registru Deconturi per Vânzător</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Situația financiară calculată pentru fiecare comerciant partener înregistrat pe platformă
            </p>
          </div>
          <Link
            href="/admin/firma"
            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
          >
            <span>Setări comision global</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100">
                <th className="py-4 px-6">Comerciant / Firmă</th>
                <th className="py-4 px-4">Cont IBAN &amp; Bancă</th>
                <th className="py-4 px-4 text-center">Articole Vândute</th>
                <th className="py-4 px-4">Vânzări Brute</th>
                <th className="py-4 px-4 text-center">Comision %</th>
                <th className="py-4 px-4">Comision TOPinStock</th>
                <th className="py-4 px-6 text-right font-black text-gray-900">Net De Virat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {vendorLedger.map((vl) => (
                <tr key={vl.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Merchant & Firm */}
                  <td className="py-4 px-6 align-top">
                    <p className="font-bold text-gray-900 text-sm">{vl.storeName}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{vl.legalName}</p>
                  </td>

                  {/* Bank & IBAN */}
                  <td className="py-4 px-4 align-top">
                    <p className="font-mono font-semibold text-gray-800 text-xs">{vl.iban}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{vl.bank}</p>
                  </td>

                  {/* Sold items */}
                  <td className="py-4 px-4 align-top text-center font-bold text-gray-700">
                    {vl.itemsCount} buc.
                  </td>

                  {/* Gross Sales */}
                  <td className="py-4 px-4 align-top font-bold text-gray-900">
                    {vl.grossSales.toFixed(2)} LEI
                  </td>

                  {/* Rate */}
                  <td className="py-4 px-4 align-top text-center">
                    <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full text-xs font-bold">
                      {(vl.commissionRate * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Marketplace Fee */}
                  <td className="py-4 px-4 align-top font-bold text-indigo-700">
                    {vl.marketplaceFee.toFixed(2)} LEI
                  </td>

                  {/* Net Payout */}
                  <td className="py-4 px-6 align-top text-right">
                    <p className="font-black text-emerald-600 text-sm">
                      {vl.netPayout.toFixed(2)} LEI
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium block">
                      Transfer IBAN la scadență
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
