'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Truck,
  CreditCard,
  Banknote,
  Store,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ContPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refresh, logout } = useAuth();

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'settings'>('orders');

  // Auth form states (when not logged in)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile update form state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Fetch orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setOrdersLoading(true);
      fetch('/api/user/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        })
        .catch(console.error)
        .finally(() => setOrdersLoading(false));

      // Prefill profile settings
      if (user) {
        setProfileName(user.name || '');
        setProfilePhone(user.phone || '');
        setProfileAddress(user.address || '');
      }
    }
  }, [isAuthenticated, user]);

  // Handle Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Autentificare eșuată.');
      }

      setAuthSuccess('Autentificare reușită! Vă redirecționăm...');
      window.dispatchEvent(new Event('topinstock_auth_changed'));
      await refresh();
    } catch (err: any) {
      setAuthError(err.message || 'Email sau parolă incorectă.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Register
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Înregistrare eșuată.');
      }

      setAuthSuccess('Contul a fost creat cu succes!');
      window.dispatchEvent(new Event('topinstock_auth_changed'));
      await refresh();
    } catch (err: any) {
      setAuthError(err.message || 'Eroare la crearea contului.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Profile Update
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsUpdatingProfile(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          address: profileAddress,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Nu am putut actualiza datele.');
      }

      setProfileSuccess('Modificările au fost salvate cu succes!');
      window.dispatchEvent(new Event('topinstock_auth_changed'));
      await refresh();
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Eroare la salvare.');
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/70 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#008fa8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // 1. UNAUTHENTICATED STATE — Login / Register
  // ─────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          {/* Header icon & title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#008fa8] to-[#005c6e] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#008fa8]/20">
              <User size={30} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {authMode === 'login' ? 'Autentificare Client' : 'Creează Cont TOPinStock'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
              {authMode === 'login'
                ? 'Conectează-te pentru a vedea comenzile, adresele și produsele tale favorite.'
                : 'Completează datele pentru a începe cumpărăturile ca și client înregistrat.'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
            {/* Tabs */}
            <div className="flex bg-gray-100/80 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Autentificare
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Cont Nou
              </button>
            </div>

            {/* Error / Success Alerts */}
            {authError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Adresă Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="adresa.ta@exemplu.ro"
                      className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none transition-all"
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Parolă
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-10 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none transition-all"
                    />
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-[#008fa8] to-[#006b80] hover:from-[#007d94] hover:to-[#005c6e] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Autentifică-te în cont</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nume și Prenume
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ex: Andrei Ionescu"
                      className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none transition-all"
                    />
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Adresă Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="andrei@exemplu.ro"
                      className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none transition-all"
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Număr de Telefon (Opțional)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="07xxxxxxxx"
                      className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none transition-all"
                    />
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Parolă (Minim 6 caractere)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none transition-all"
                    />
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-[#C03653] to-[#e63946] hover:from-[#A02B44] hover:to-[#C03653] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Creează contul meu</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Helper info */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2.5 text-xs text-gray-500">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-gray-600">Ești partener sau vrei să vinzi pe platformă? </span>
                <Link
                  href="/admin/login"
                  className="text-orange-600 font-bold hover:underline inline-flex items-center gap-1 ml-1"
                >
                  <Store size={13} />
                  Panou Vânzător
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // 2. AUTHENTICATED STATE — User Dashboard
  // ─────────────────────────────────────────────
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CL';

  return (
    <div className="min-h-screen bg-gray-50/70 py-10">
      <div className="container-app max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 flex items-center gap-1.5 mb-6">
          <Link href="/" className="hover:text-blue-900 transition-colors">Acasă</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Contul meu ({user.name})</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar (Left: 4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            {/* User Profile Card */}
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#008fa8] to-[#005c6e] text-white flex items-center justify-center font-black text-xl shadow-md">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-gray-900 truncate">
                  {user.name}
                </h2>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1.5 ${
                    user.role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-800'
                      : user.role === 'VENDOR'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <ShieldCheck size={11} />{' '}
                  {user.role === 'ADMIN'
                    ? 'Administrator'
                    : user.role === 'VENDOR'
                    ? 'Vânzător Partener'
                    : 'Client Verificat'}
                </span>
              </div>
            </div>

            {/* Vendor / Admin Quick Portal */}
            {(user.role === 'VENDOR' || user.role === 'ADMIN') && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/60 border border-orange-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <Store size={15} className="text-orange-600" />
                    Panou Vânzător Activ
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-600 text-white">
                    {user.role}
                  </span>
                </div>
                <p className="text-[11px] text-orange-800/80 mb-3 leading-relaxed">
                  Ai acces la catalogul de produse, stocuri, comenzi și importatorul AI.
                </p>
                <Link
                  href="/admin"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all active:scale-98"
                >
                  <span>Deschide Panoul de Vânzător</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* Nav Menu */}
            <nav className="space-y-1 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-blue-50/70 text-blue-900 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={18} />
                  <span>Comenzile mele ({orders.length})</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-blue-50/70 text-blue-900 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={18} />
                  <span>Adrese de livrare</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-blue-50/70 text-blue-900 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} />
                  <span>Setări cont</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    router.push('/cont');
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut size={18} />
                  <span>Deconectare</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content Area (Right: 8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            {/* 1. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Istoric Comenzi</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Vezi comenzile plasate de tine și statusul livrării în timp real</p>
                </div>

                {ordersLoading ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#008fa8] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag size={28} />
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">Nu ai plasat nicio comandă</h4>
                    <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                      Coșul tău este pregătit. Alege din cele 395 de produse originale și plasează prima ta comandă!
                    </p>
                    <Link
                      href="/produse"
                      className="inline-flex items-center gap-2 bg-[#008fa8] hover:bg-[#007d94] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all"
                    >
                      <Sparkles size={14} />
                      <span>Vezi Catalogul</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      let shippingData: any = {};
                      try {
                        shippingData = typeof order.shippingAddress === 'string'
                          ? JSON.parse(order.shippingAddress)
                          : order.shippingAddress || {};
                      } catch {}

                      const orderDate = new Date(order.createdAt).toLocaleDateString('ro-RO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });

                      return (
                        <div
                          key={order.id}
                          className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors bg-white shadow-xs space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                            <div>
                              <span className="text-[11px] font-bold text-gray-400">Comandă #{order.id.slice(-8).toUpperCase()}</span>
                              <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                                <Clock size={13} className="text-gray-400" />
                                <span>{orderDate}</span>
                                <span>•</span>
                                <span>Total: <strong className="text-gray-900 font-extrabold">{order.totalAmount.toFixed(2)} LEI</strong></span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                  order.status === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : order.status === 'PROCESSING'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {order.status === 'COMPLETED'
                                  ? 'Livrat'
                                  : order.status === 'PROCESSING'
                                  ? 'În procesare'
                                  : 'Confirmată'}
                              </span>
                            </div>
                          </div>

                          {/* Items in this order */}
                          <div className="space-y-2">
                            {order.orderItems?.map((oi: any) => {
                              const product = oi.product;
                              let images: string[] = [];
                              try {
                                images = Array.isArray(product?.images)
                                  ? product.images
                                  : (product?.images ? JSON.parse(product.images) : []);
                              } catch {
                                images = [];
                              }
                              const imgUrl = images[0] || '/images/product_laptop.jpg';

                              return (
                                <div key={oi.id} className="flex items-center gap-3 text-xs">
                                  <div className="relative w-12 h-12 rounded-xl bg-white p-1 overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                                    <Image src={imgUrl} alt={product?.title || ''} fill className="object-contain object-center" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-gray-900 truncate">
                                      {product?.title || 'Produs TOPinStock'}
                                    </h5>
                                    <p className="text-gray-400 text-[11px]">
                                      {oi.quantity} x {oi.price.toFixed(2)} LEI
                                    </p>
                                  </div>
                                  <div className="font-black text-gray-900">
                                    {(oi.quantity * oi.price).toFixed(2)} LEI
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Delivery Destination */}
                          {shippingData.address && (
                            <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                              <div className="flex items-center gap-1.5 truncate">
                                <Truck size={13} className="text-[#008fa8]" />
                                <span className="truncate">Livrare la: {shippingData.city}, {shippingData.address}</span>
                              </div>
                              <span className="font-semibold text-gray-700 whitespace-nowrap">
                                {order.paymentMethod === 'CARD_ONLINE' ? 'Plată cu cardul' : 'Ramburs curier'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Adresă de Livrare</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Gestionează adresa de livrare pentru finalizarea rapidă a comenzilor la checkout</p>
                </div>

                {profileSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nume Destinatar
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Numele tău complet"
                      className="w-full h-11 px-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Număr de Telefon
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="07xxxxxxxx"
                      className="w-full h-11 px-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Adresă Completă de Livrare (Județ, Oraș, Stradă, Număr)
                    </label>
                    <textarea
                      rows={3}
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Ex: București, Sector 1, Calea Victoriei nr. 45, bloc A, ap. 12"
                      className="w-full p-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 h-11 bg-[#008fa8] hover:bg-[#007d94] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isUpdatingProfile ? 'Se salvează...' : 'Salvează Adresa'}
                  </button>
                </form>
              </div>
            )}

            {/* 3. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Setări Cont</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Actualizează detaliile personale și datele de conectare</p>
                </div>

                {profileSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Adresă Email (Permanentă)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full h-11 px-4 text-xs font-medium rounded-xl border border-gray-100 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nume Afișat
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full h-11 px-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="07xxxxxxxx"
                      className="w-full h-11 px-4 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#008fa8] focus:ring-2 focus:ring-[#008fa8]/10 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 h-11 bg-[#008fa8] hover:bg-[#007d94] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isUpdatingProfile ? 'Se salvează...' : 'Actualizează Profilul'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
