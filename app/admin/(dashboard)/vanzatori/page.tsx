import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Plus, Store } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import VendorsManager from '@/components/admin/VendorsManager';

export const dynamic = 'force-dynamic';

export default async function AdminVendorsPage() {
  const session = await getSession();

  // Strict Super-Admin check
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin');
  }

  const dbVendors = await prisma.vendor.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
      orderItems: {
        select: {
          price: true,
          quantity: true,
        },
      },
    },
  });

  const formattedVendors = dbVendors.map((v) => {
    const totalSales = v.orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    return {
      id: v.id,
      userId: v.userId,
      storeName: v.storeName,
      slug: v.slug,
      description: v.description,
      rating: v.rating,
      isVerified: v.isVerified,
      commissionRate: v.commissionRate,
      legalName: v.legalName || 'Nespecificat',
      cui: v.cui || 'Nespecificat',
      regCom: v.regCom || 'Nespecificat',
      iban: v.iban || 'Nespecificat',
      bank: v.bank || 'Nespecificat',
      legalAddress: v.legalAddress || 'Nespecificat',
      contactPerson: v.contactPerson || v.user?.name || 'Nespecificat',
      phone: v.phone || v.user?.phone || 'Nespecificat',
      email: v.user?.email || 'Nespecificat',
      status: (v.status as 'ACTIVE' | 'PENDING' | 'SUSPENDED') || (v.isVerified ? 'ACTIVE' : 'PENDING'),
      productsCount: v._count.products,
      totalSales,
      createdAt: v.createdAt.toISOString(),
    };
  });

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
            <span>Gestiune Vânzători Parteneri</span>
            <ShieldCheck size={26} className="text-amber-500" />
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Verifică documentele KYC ale comercianților, aprobă cererile de vânzare, gestionează comisioanele și monitorizează starea fiecărui magazin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/vanzator"
            target="_blank"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-sm transition-all"
          >
            <Store size={15} />
            <span>Vezi Pagina de Înregistrare Vânzători</span>
          </Link>
        </div>
      </div>

      {/* ── Main Vendors Table & KYC Manager ── */}
      <VendorsManager initialVendors={formattedVendors} />
    </div>
  );
}
