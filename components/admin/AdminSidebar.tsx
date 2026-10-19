import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquarePlus,
  Package,
  PlusCircle,
  ShoppingBag,
  ExternalLink,
  Store,
  ShieldCheck,
  UserCheck,
  Building2,
  Coins,
} from 'lucide-react';
import type { AuthSession } from '@/lib/auth';
import AdminLogoutButton from './AdminLogoutButton';

interface AdminSidebarProps {
  session: AuthSession;
}

export default function AdminSidebar({ session }: AdminSidebarProps) {
  const isAdmin = session.role === 'ADMIN';
  const displayName = session.storeName || session.name || 'Magazin Partener';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="w-full md:w-64 bg-[#0c1f38] text-white flex-shrink-0 flex flex-col justify-between p-5 border-r border-gray-800">
      <div className="space-y-6">
        {/* Logo & Platform Info */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-1.5">
            <span className="text-xl font-black text-white tracking-tight">
              top<span className="text-orange-500">in</span>stock
            </span>
          </Link>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}
          >
            {isAdmin ? 'ADMIN' : 'VÂNZĂTOR'}
          </span>
        </div>

        {/* Store info banner for Vendors */}
        <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
            {isAdmin ? (
              <ShieldCheck size={14} className="text-amber-400" />
            ) : (
              <Store size={14} className="text-indigo-400" />
            )}
            <span className="truncate">{displayName}</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {isAdmin ? 'Acces complet Marketplace' : `Cont vânzător dedicat`}
          </p>
        </div>

        {/* Primary Action Button */}
        <div>
          <Link
            href="/admin/produse/nou"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-md shadow-orange-500/20 transition-all"
          >
            <PlusCircle size={16} />
            <span>Adaugă Produs Nou</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4 text-sm font-medium">
          {/* Section 1: Panou Vânzător (Valabil pentru toți, inclusiv contul propriu de Admin) */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider px-3.5 block mb-1">
              {isAdmin ? 'Magazinul Tău (Vânzător)' : 'Meniul Tău'}
            </span>

            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LayoutDashboard size={17} className="text-blue-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/produse/nou"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <PlusCircle size={17} className="text-emerald-400" />
                <span>Adaugă Manual</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                NOU
              </span>
            </Link>

            <Link
              href="/admin/importer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <MessageSquarePlus size={17} className="text-orange-400" />
                <span>Chat Importer AI</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">
                AI
              </span>
            </Link>

            <Link
              href="/admin#produse"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Package size={17} className="text-cyan-400" />
              <span>Catalog Produse</span>
            </Link>

            <Link
              href="/admin/comenzi"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ShoppingBag size={17} className="text-purple-400" />
              <span>Comenzi Primite</span>
            </Link>
          </div>

          {/* Section 2: Super-Admin Marketplace (EXCLUSIV CONTUL DE ADMIN) */}
          {isAdmin && (
            <div className="pt-3 border-t border-gray-800/80 space-y-1">
              <div className="flex items-center justify-between px-3.5 mb-1.5">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                  Administrare Platformă
                </span>
                <span className="text-[9px] font-extrabold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                  SUPER
                </span>
              </div>

              <Link
                href="/admin/vanzatori"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Store size={17} className="text-amber-400" />
                  <span>Vânzători Parteneri</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                  KYC
                </span>
              </Link>

              <Link
                href="/admin/firma"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Building2 size={17} className="text-blue-400" />
                <span>Date Firmă &amp; Setări</span>
              </Link>

              <Link
                href="/admin/finante"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Coins size={17} className="text-emerald-400" />
                <span>Finanțe &amp; Deconturi</span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="pt-6 border-t border-gray-800 space-y-3">
        <Link
          href="/produse"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Store size={14} />
            <span>Vezi magazinul live</span>
          </div>
          <ExternalLink size={12} />
        </Link>

        {/* User Card */}
        <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
              {initials || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-xs truncate">
                {session.name || displayName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{session.email}</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
