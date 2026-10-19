'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Truck, CheckCircle, XCircle, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusSelectorProps {
  orderId: string;
  initialStatus: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: any }
> = {
  PENDING: {
    label: 'În așteptare',
    bg: 'bg-amber-100 text-amber-800 border-amber-200',
    text: 'text-amber-800',
    icon: Clock,
  },
  PROCESSING: {
    label: 'În procesare',
    bg: 'bg-blue-100 text-blue-800 border-blue-200',
    text: 'text-blue-800',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Livrat',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: 'text-emerald-800',
    icon: CheckCircle,
  },
  COMPLETED: {
    label: 'Finalizat',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: 'text-emerald-800',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Anulat',
    bg: 'bg-red-100 text-red-800 border-red-200',
    text: 'text-red-800',
    icon: XCircle,
  },
};

export default function OrderStatusSelector({
  orderId,
  initialStatus,
}: OrderStatusSelectorProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const CurrentIcon = current.icon;

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status || loading) return;
    setLoading(true);
    setIsOpen(false);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus(newStatus);
        router.refresh();
      } else {
        alert(data.error || 'Nu am putut actualiza statusul comenzii.');
      }
    } catch {
      alert('Eroare de conexiune la actualizarea statusului.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={loading}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border transition-all cursor-pointer shadow-xs hover:opacity-90 active:scale-95',
          current.bg
        )}
        title="Apasă pentru a schimba statusul"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <CurrentIcon size={12} />
        )}
        <span>{current.label}</span>
        <ChevronDown size={11} className="opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white shadow-xl border border-gray-100 py-1.5 z-50 text-xs">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Modifică Status:
            </div>
            {Object.entries(STATUS_CONFIG)
              .filter(([key]) => key !== 'COMPLETED')
              .map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = key === status;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleStatusChange(key)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors',
                      isSelected ? 'font-bold bg-gray-50/80 text-gray-900' : 'text-gray-600'
                    )}
                  >
                    <Icon size={14} className={config.text} />
                    <span>{config.label}</span>
                    {isSelected && <span className="ml-auto text-[10px] text-gray-400">✓</span>}
                  </button>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
