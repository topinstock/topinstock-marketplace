'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  Filter,
  ExternalLink,
  Edit3,
  Building2,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Percent,
  Package,
  TrendingUp,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface VendorItem {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description: string | null;
  rating: number;
  isVerified: boolean;
  commissionRate: number;
  legalName: string;
  cui: string;
  regCom: string;
  iban: string;
  bank: string;
  legalAddress: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  productsCount: number;
  totalSales: number;
  createdAt: string;
}

interface VendorsManagerProps {
  initialVendors: VendorItem[];
}

export default function VendorsManager({ initialVendors }: VendorsManagerProps) {
  const [vendors, setVendors] = useState<VendorItem[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null);
  const [isEditingKyc, setIsEditingKyc] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<VendorItem>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Quick stats
  const totalCount = vendors.length;
  const activeCount = vendors.filter((v) => v.status === 'ACTIVE').length;
  const pendingCount = vendors.filter((v) => v.status === 'PENDING').length;
  const totalGmv = vendors.reduce((sum, v) => sum + v.totalSales, 0);

  // Filtered list
  const filteredVendors = vendors.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.storeName.toLowerCase().includes(q) ||
      v.legalName.toLowerCase().includes(q) ||
      v.cui.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q)
    );
  });

  function showNotification(text: string, type: 'success' | 'error' = 'success') {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  }

  // Quick toggle status (Approve or Suspend)
  async function handleStatusChange(vendorId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING') {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Nu am putut actualiza statusul.');
      }

      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendorId
            ? { ...v, status: newStatus, isVerified: newStatus === 'ACTIVE' }
            : v
        )
      );

      if (selectedVendor && selectedVendor.id === vendorId) {
        setSelectedVendor((prev) =>
          prev ? { ...prev, status: newStatus, isVerified: newStatus === 'ACTIVE' } : null
        );
      }

      showNotification(
        newStatus === 'ACTIVE'
          ? 'Vânzătorul a fost aprobat și activat cu succes!'
          : newStatus === 'SUSPENDED'
          ? 'Contul vânzătorului a fost suspendat.'
          : 'Statusul a fost trecut în așteptare.'
      );
    } catch (err: any) {
      showNotification(err.message || 'Eroare la actualizare', 'error');
    } finally {
      setIsUpdating(false);
    }
  }

  // Update commission or KYC
  async function handleSaveKycDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVendor) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/vendors/${selectedVendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Nu am putut salva datele.');
      }

      setVendors((prev) =>
        prev.map((v) => (v.id === selectedVendor.id ? { ...v, ...editFormData } : v))
      );
      setSelectedVendor((prev) => (prev ? { ...prev, ...editFormData } : null));
      setIsEditingKyc(false);
      showNotification('Datele firmei și comisionul au fost actualizate!');
    } catch (err: any) {
      showNotification(err.message || 'Eroare la salvare', 'error');
    } finally {
      setIsUpdating(false);
    }
  }

  function openVendorModal(vendor: VendorItem) {
    setSelectedVendor(vendor);
    setEditFormData({
      legalName: vendor.legalName,
      cui: vendor.cui,
      regCom: vendor.regCom,
      iban: vendor.iban,
      bank: vendor.bank,
      legalAddress: vendor.legalAddress,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      commissionRate: vendor.commissionRate,
      status: vendor.status,
    });
    setIsEditingKyc(false);
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 transition-all animate-bounce ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border border-emerald-700'
              : 'bg-rose-900 text-rose-100 border border-rose-700'
          }`}
        >
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Store size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Vânzători</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{totalCount}</p>
            <span className="text-[11px] text-gray-500 font-medium">Magazine înregistrate</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vânzători Activi</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{activeCount}</p>
            <span className="text-[11px] text-emerald-700 font-medium">Conturi verificate KYC</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">În Verificare</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingCount}</p>
            <span className="text-[11px] text-amber-700 font-medium">Așteaptă aprobare</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vânzări Parteneri</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">
              {totalGmv.toLocaleString('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{' '}
              <span className="text-xs font-bold text-gray-400">LEI</span>
            </p>
            <span className="text-[11px] text-blue-700 font-medium">Volum total tranzacționat</span>
          </div>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Controls: Search + Filter Tabs */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Toți ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Activi ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              În Verificare ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SUSPENDED')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'SUSPENDED' ? 'bg-white text-rose-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Suspendați ({vendors.filter((v) => v.status === 'SUSPENDED').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută magazin, firmă, CUI..."
              className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100">
                <th className="py-4 px-6">Magazin &amp; Brand</th>
                <th className="py-4 px-4">Date Juridice (KYC)</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4 text-center">Produse</th>
                <th className="py-4 px-4">Vânzări</th>
                <th className="py-4 px-4 text-center">Comision</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Store size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Niciun vânzător găsit pentru criteriile selectate.</p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Store & Slug */}
                    <td className="py-4 px-6 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                          {v.storeName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 leading-snug truncate">{v.storeName}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">/{v.slug}</p>
                          {v.description && (
                            <p className="text-[11px] text-gray-500 truncate max-w-xs mt-0.5">
                              {v.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Fiscal details */}
                    <td className="py-4 px-4 align-top">
                      <p className="font-semibold text-gray-900 text-xs truncate max-w-[200px]" title={v.legalName}>
                        {v.legalName}
                      </p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                        CUI: <strong className="text-gray-700">{v.cui}</strong>
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[200px]" title={v.legalAddress}>
                        {v.legalAddress}
                      </p>
                    </td>

                    {/* Contact details */}
                    <td className="py-4 px-4 align-top">
                      <p className="font-medium text-gray-900 text-xs">{v.contactPerson}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail size={11} className="text-gray-400" />
                        <span className="truncate max-w-[150px]">{v.email}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone size={11} className="text-gray-400" />
                        <span>{v.phone}</span>
                      </p>
                    </td>

                    {/* Products count */}
                    <td className="py-4 px-4 align-top text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                        <Package size={12} className="text-gray-500" />
                        <span>{v.productsCount}</span>
                      </span>
                    </td>

                    {/* Total Sales */}
                    <td className="py-4 px-4 align-top font-bold text-gray-900">
                      {v.totalSales.toFixed(2)} LEI
                    </td>

                    {/* Commission Rate */}
                    <td className="py-4 px-4 align-top text-center font-bold text-orange-600">
                      <span className="bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 rounded-full text-xs">
                        {(v.commissionRate * 100).toFixed(0)}%
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 align-top text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                          v.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : v.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {v.status === 'ACTIVE' ? (
                          <CheckCircle2 size={12} />
                        ) : v.status === 'PENDING' ? (
                          <Clock size={12} />
                        ) : (
                          <Ban size={12} />
                        )}
                        <span>
                          {v.status === 'ACTIVE'
                            ? 'Activ'
                            : v.status === 'PENDING'
                            ? 'În Verificare'
                            : 'Suspendat'}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Quick Approve if Pending */}
                        {v.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(v.id, 'ACTIVE')}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                            title="Aprobă magazinul și validează KYC"
                          >
                            <Check size={13} />
                            <span>Aprobă</span>
                          </button>
                        )}

                        {/* View & Edit KYC Modal */}
                        <button
                          type="button"
                          onClick={() => openVendorModal(v)}
                          className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          <Edit3 size={12} />
                          <span>Detalii KYC</span>
                        </button>

                        {/* Suspend or Reactivate */}
                        {v.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(v.id, 'SUSPENDED')}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1.5 rounded-xl transition-colors cursor-pointer"
                            title="Suspendă activitatea vânzătorului"
                          >
                            <Ban size={12} />
                          </button>
                        ) : v.status === 'SUSPENDED' ? (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(v.id, 'ACTIVE')}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1.5 rounded-xl transition-colors cursor-pointer"
                            title="Reactivează magazinul"
                          >
                            <CheckCircle2 size={12} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: DETALII COMPLETE KYC & SETARE COMISION ── */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{selectedVendor.storeName}</h3>
                  <p className="text-xs text-gray-500">Dosar de Parteneriat &amp; Detalii Fiscale KYC</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVendor(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* View or Edit mode toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700">Status Cont:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    selectedVendor.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedVendor.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedVendor.status === 'ACTIVE'
                    ? 'Activ'
                    : selectedVendor.status === 'PENDING'
                    ? 'În Așteptare Aprobare'
                    : 'Suspendat'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedVendor.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedVendor.id, 'ACTIVE')}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check size={14} />
                    <span>Aprobă Magazin</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsEditingKyc(!isEditingKyc)}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Edit3 size={13} />
                  <span>{isEditingKyc ? 'Renunță' : 'Editează Date'}</span>
                </button>
              </div>
            </div>

            {/* FORM or READ-ONLY VIEW */}
            {isEditingKyc ? (
              <form onSubmit={handleSaveKycDetails} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nume Juridic Firmă (S.R.L. / P.F.A.)</label>
                    <input
                      type="text"
                      value={editFormData.legalName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, legalName: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Cod Fiscal (CUI / CIF)</label>
                    <input
                      type="text"
                      value={editFormData.cui || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, cui: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nr. Registrul Comerțului</label>
                    <input
                      type="text"
                      value={editFormData.regCom || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, regCom: e.target.value })}
                      placeholder="J40/1234/2023"
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Comision Marketplace (% zecimal, ex: 0.12 = 12%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={editFormData.commissionRate ?? 0.12}
                      onChange={(e) => setEditFormData({ ...editFormData, commissionRate: parseFloat(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 font-bold text-xs text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Cont IBAN (Plată Deconturi)</label>
                    <input
                      type="text"
                      value={editFormData.iban || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, iban: e.target.value })}
                      placeholder="RO49BTRL..."
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Banca Emitentă</label>
                    <input
                      type="text"
                      value={editFormData.bank || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, bank: e.target.value })}
                      placeholder="ex: Banca Transilvania"
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Persoană Responsabilă / Contact</label>
                    <input
                      type="text"
                      value={editFormData.contactPerson || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Număr Telefon</label>
                    <input
                      type="text"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-gray-300 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">Sediu Social Complet</label>
                  <textarea
                    rows={2}
                    value={editFormData.legalAddress || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, legalAddress: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-300 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingKyc(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors"
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    {isUpdating ? 'Se salvează...' : 'Salvează Modificările'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 block mb-1">DENUMIRE JURIDICĂ</span>
                    <p className="font-extrabold text-gray-900 text-sm">{selectedVendor.legalName}</p>
                    <p className="text-gray-500 font-mono mt-1">CUI: {selectedVendor.cui}</p>
                    <p className="text-gray-500 font-mono">Reg. Com: {selectedVendor.regCom}</p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 block mb-1">DATE BANCARE DECONTĂRI</span>
                    <p className="font-mono font-bold text-gray-900">{selectedVendor.iban}</p>
                    <p className="text-gray-600 mt-1">{selectedVendor.bank}</p>
                    <p className="text-orange-600 font-bold mt-1">
                      Comision Marketplace agreat: {(selectedVendor.commissionRate * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 block mb-1">SEDIU SOCIAL &amp; CONTACT</span>
                  <div className="flex items-start gap-2 text-gray-700 mb-1.5">
                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{selectedVendor.legalAddress}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Mail size={13} className="text-gray-400" />
                      <span>{selectedVendor.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-gray-400" />
                      <span>{selectedVendor.phone} ({selectedVendor.contactPerson})</span>
                    </div>
                  </div>
                </div>

                {/* Quick Store Links */}
                <div className="pt-2 flex justify-between items-center text-xs">
                  <Link
                    href={`/vanzator/${selectedVendor.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                  >
                    <Store size={14} />
                    <span>Vezi profilul magazinului pe site</span>
                    <ExternalLink size={12} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedVendor(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                  >
                    Închide
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
