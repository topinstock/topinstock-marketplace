import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Store,
  MessageSquarePlus,
  ExternalLink,
  PlusCircle,
  Eye,
  CheckCircle,
  ShieldCheck,
  Building2,
  Edit,
  Search,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { safeJsonParse, formatPrice } from '@/lib/utils';
import { RECOMMENDED_PRODUCTS, FLASH_PRODUCTS } from '@/lib/data/products';
import ProductDeleteButton from '@/components/admin/ProductDeleteButton';
import ProductQuickEditModal from '@/components/admin/ProductQuickEditModal';

export const dynamic = 'force-dynamic';

interface AdminDashboardPageProps {
  searchParams?: Promise<{ q?: string; page?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams?.q?.toString().trim() || '';
  const currentPage = Math.max(1, parseInt(resolvedSearchParams?.page?.toString() || '1', 10));
  const PAGE_SIZE = 50;

  const session = await getSession();
  const isAdmin = session?.role === 'ADMIN';
  const isVendor = session?.role === 'VENDOR';
  const vendorId = session?.vendorId;

  let products: any[] = [];
  let ordersCount = 0;
  let totalSales = 0;
  let vendorsCount = 1;
  let totalMatchingProducts = 0;

  try {
    // Multi-Vendor filter
    const productWhere: any = {};
    const orderWhere: any = {};

    if (isVendor && vendorId) {
      productWhere.vendorId = vendorId;
      orderWhere.orderItems = { some: { vendorId } };
    }

    if (query) {
      productWhere.OR = [
        { title: { contains: query } },
        { sku: { contains: query } },
      ];
    }

    const [dbProducts, dbOrders, dbVendors, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: productWhere,
        take: PAGE_SIZE,
        skip: (currentPage - 1) * PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          originalPrice: true,
          stock: true,
          images: true,
          isPublished: true,
          createdAt: true,
          vendor: { select: { storeName: true, isVerified: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.order.findMany({
        where: orderWhere,
        select: {
          totalAmount: true,
          orderItems: {
            where: isVendor && vendorId ? { vendorId } : undefined,
            select: { price: true, quantity: true },
          },
        },
      }),
      prisma.vendor.count(),
      prisma.product.count({ where: productWhere }),
    ]);

    totalMatchingProducts = totalCount || 0;

    products = dbProducts.map((p) => {
      const parsedImages = safeJsonParse<string[]>(p.images, ['/images/product_laptop.jpg']);
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        stock: p.stock,
        image: parsedImages[0] || '/images/product_laptop.jpg',
        images: parsedImages,
        category: p.category?.name || 'General',
        vendor: p.vendor?.storeName || 'Magazin Oficial',
        isVerified: p.vendor?.isVerified ?? true,
        isPublished: p.isPublished,
        createdAt: p.createdAt,
      };
    });

    ordersCount = dbOrders.length;

    // Calculate vendor-specific revenue
    if (isVendor && vendorId) {
      totalSales = dbOrders.reduce((sum, order) => {
        const itemSum = order.orderItems.reduce((iSum, item) => iSum + Number(item.price) * item.quantity, 0);
        return sum + itemSum;
      }, 0);
    } else {
      totalSales = dbOrders.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    }

    vendorsCount = dbVendors || 1;
  } catch (error) {
    // Fallback if DB offline
    products = [...RECOMMENDED_PRODUCTS, ...FLASH_PRODUCTS].map((p) => ({
      id: p.id,
      title: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice || null,
      stock: p.stock,
      image: p.image,
      category: p.category,
      vendor: p.sellerName,
      isVerified: true,
      createdAt: new Date(),
    }));

    ordersCount = 0;
    totalSales = 0;
    vendorsCount = 1;
  }

  const displayName = session?.storeName || session?.name || 'Vânzător TOPinStock';

  return (
    <div className="space-y-8">
      {/* ── Top Header & Quick CTAs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                isAdmin
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-indigo-100 text-indigo-800 border-indigo-300'
              }`}
            >
              {isAdmin ? 'Panou Super-Admin' : 'Panou Vânzător'}
            </span>
            <span className="text-xs text-gray-500">• {displayName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {isAdmin ? 'Administrare Marketplace' : `Dashboard — ${displayName}`}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin
              ? 'Gestionează vânzătorii parteneri, catalogul general și comenzile din toată platforma.'
              : 'Gestionează produsele tale active, stocul și comenzile primite de magazinul tău.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/produse/nou"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-sm transition-all"
          >
            <PlusCircle size={18} />
            <span>Adaugă Produs Nou</span>
          </Link>

          <Link
            href="/admin/importer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-sm px-4 py-3 rounded-2xl shadow-sm transition-all"
          >
            <MessageSquarePlus size={18} className="text-orange-400" />
            <span>Chat Importer AI</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Produse */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center flex-shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {isAdmin ? 'Total Produse Marketplace' : 'Produsele Tale'}
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">
              {totalMatchingProducts.toLocaleString('ro-RO')}
            </p>
            <Link
              href="/admin/produse/nou"
              className="text-[11px] text-orange-600 font-semibold hover:underline"
            >
              + Adaugă produs nou
            </Link>
          </div>
        </div>

        {/* KPI 2: Comenzi */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Comenzi Primite
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">
              {ordersCount}
            </p>
            <Link href="/admin/comenzi" className="text-[11px] text-purple-700 font-semibold hover:underline">
              Vezi toate comenzile →
            </Link>
          </div>
        </div>

        {/* KPI 3: Vânzări */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {isAdmin ? 'Volum Total Vânzări' : 'Vânzări Magazin'}
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">
              {totalSales.toLocaleString('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-gray-500">LEI</span>
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">
              Calculat automat
            </span>
          </div>
        </div>

        {/* KPI 4: Vânzători / Comision */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Store size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {isAdmin ? 'Vânzători Înregistrați' : 'Status Cont'}
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">
              {isAdmin ? vendorsCount : 'Verificat'}
            </p>
            <span className="text-[11px] text-amber-600 font-semibold">
              {isAdmin ? 'Platformă Multi-Vendor' : 'Comision: 12%'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Super-Admin Quick Platform Management Bar ── */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 border border-amber-500/30 shadow-sm text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                <ShieldCheck size={13} />
                <span>Modul Super-Administrator Marketplace</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Control Central: Vânzători Parteneri, Detalii Firmă &amp; Finanțe
              </h3>
              <p className="text-xs text-slate-300">
                Ai acces complet la verificarea dosarelor KYC ale comercianților, datele juridice ale TOPinStock S.R.L. și bilanțul de comisioane.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/admin/vanzatori"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors"
              >
                <Store size={15} />
                <span>Gestiune Vânzători ({vendorsCount})</span>
              </Link>
              <Link
                href="/admin/firma"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-colors"
              >
                <Building2 size={15} />
                <span>Date Firmă &amp; Setări</span>
              </Link>
              <Link
                href="/admin/finante"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-colors"
              >
                <TrendingUp size={15} />
                <span>Finanțe &amp; Deconturi</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Banner Adăugare Produs ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            <span>Funcționalitate Nouă • Formular Complet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black leading-snug">
            Adaugă produse manual în Marketplace
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Formular detaliat cu titlu, categorii din baza de date, preț, reducere, stoc, selector mărimi, culori și încărcare poze de pe computer cu previzualizare live.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/admin/produse/nou"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <PlusCircle size={18} />
            <span>Deschide Formular Produs</span>
          </Link>
          <Link
            href="/admin/importer"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <MessageSquarePlus size={16} />
            <span>Chat Importer AI</span>
          </Link>
        </div>
      </div>

      {/* ── Products Table ── */}
      <div id="produse" className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isAdmin ? 'Catalog Produse Active — Toți Vânzătorii' : 'Catalogul Produselor Tale'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalMatchingProducts.toLocaleString('ro-RO')} produse în catalog
              {query && (
                <span className="font-semibold text-amber-700 ml-1">
                  (rezultate căutare pentru: &quot;{query}&quot;)
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input Form */}
            <form method="GET" action="/admin#produse" className="relative flex items-center">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Caută după titlu sau SKU..."
                className="w-48 sm:w-64 text-xs font-semibold pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-xs"
              />
              <Search size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
              {query && (
                <Link
                  href="/admin#produse"
                  className="ml-2 text-xs text-gray-400 hover:text-gray-700 font-bold"
                >
                  Resetează
                </Link>
              )}
            </form>

            <Link
              href="/admin/produse/nou"
              className="text-xs font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle size={14} />
              <span>Adaugă Produs Nou</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100">
                <th className="py-3.5 px-6">Produs</th>
                <th className="py-3.5 px-4">Categorie</th>
                <th className="py-3.5 px-4">Vânzător</th>
                <th className="py-3.5 px-4">Preț</th>
                <th className="py-3.5 px-4">Stoc</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Title & Thumbnail */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="font-semibold text-gray-900 leading-snug truncate" title={p.title}>
                          {p.title}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          ID: {p.id.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 font-medium text-gray-600">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {p.category}
                    </span>
                  </td>

                  {/* Vendor */}
                  <td className="py-3.5 px-4 font-medium text-blue-700">
                    <div className="flex items-center gap-1">
                      <Store size={12} />
                      <span className="truncate max-w-[120px]">{p.vendor}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {p.price.toFixed(2)} LEI
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4 font-semibold text-gray-800">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        p.stock > 10
                          ? 'bg-emerald-50 text-emerald-700'
                          : p.stock > 0
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {p.stock > 0 ? `${p.stock} buc.` : 'Epuizat'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <CheckCircle size={11} />
                      <span>Publicat</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/produse/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors border border-indigo-200/60"
                        title="Editare completă: preț, poze, descriere, specificații"
                      >
                        <Edit size={13} />
                        <span>Editează</span>
                      </Link>

                      <ProductQuickEditModal
                        product={{
                          id: p.id,
                          title: p.title,
                          price: p.price,
                          originalPrice: p.originalPrice,
                          stock: p.stock,
                          isPublished: p.isPublished ?? true,
                          images: p.images,
                        }}
                      />

                      <Link
                        href={`/produse/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        title="Vezi pe site"
                      >
                        <Eye size={13} />
                        <span>Vezi</span>
                      </Link>

                      <ProductDeleteButton
                        productId={p.id}
                        productTitle={p.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Bar ── */}
        <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <p className="text-xs text-gray-500 font-medium">
            Afișate de la {(currentPage - 1) * PAGE_SIZE + 1} până la {Math.min(currentPage * PAGE_SIZE, totalMatchingProducts)} din {totalMatchingProducts.toLocaleString('ro-RO')} produse
          </p>

          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={`/admin?${new URLSearchParams({ ...(query ? { q: query } : {}), page: (currentPage - 1).toString() }).toString()}#produse`}
                className="px-3 py-1.5 text-xs font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-xs"
              >
                ← Pagina anterioară
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-bold text-gray-400 border border-gray-100 rounded-xl bg-gray-50 cursor-not-allowed">
                ← Pagina anterioară
              </span>
            )}

            <span className="text-xs font-bold text-gray-700 px-2">
              Pagina {currentPage} din {Math.max(1, Math.ceil(totalMatchingProducts / PAGE_SIZE))}
            </span>

            {currentPage * PAGE_SIZE < totalMatchingProducts ? (
              <Link
                href={`/admin?${new URLSearchParams({ ...(query ? { q: query } : {}), page: (currentPage + 1).toString() }).toString()}#produse`}
                className="px-3 py-1.5 text-xs font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-xs"
              >
                Pagina următoare →
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-xs font-bold text-gray-400 border border-gray-100 rounded-xl bg-gray-50 cursor-not-allowed">
                Pagina următoare →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
