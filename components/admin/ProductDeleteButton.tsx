'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface ProductDeleteButtonProps {
  productId: string;
  productTitle: string;
}

export default function ProductDeleteButton({
  productId,
  productTitle,
}: ProductDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Sigur dorești să ștergi produsul „${productTitle}”?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || 'Eroare la ștergerea produsului.');
      }
    } catch {
      alert('Eroare de conexiune.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Șterge produs"
    >
      <Trash2 size={16} />
    </button>
  );
}
