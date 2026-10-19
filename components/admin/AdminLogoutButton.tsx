'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore error
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/20 transition-all disabled:opacity-50"
      title="Deconectare din cont"
    >
      <div className="flex items-center gap-2">
        <LogOut size={14} />
        <span>{isLoggingOut ? 'Se deconectează...' : 'Deconectare'}</span>
      </div>
      <span className="text-[10px] text-rose-300/70">Ieșire</span>
    </button>
  );
}
