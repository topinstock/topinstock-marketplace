'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect } from 'react';

// ============================================
//   Wishlist Store (Favorite) — TopinStock
//   Zustand store with localStorage persistence
// ============================================

export interface WishlistItem {
  productId: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  vendorId?: string;
  vendorName?: string;
  stock?: number;
  rating?: number;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItem) => boolean; // returns true if added, false if removed
  hasItem: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        if (!items.some((i) => i.productId === item.productId)) {
          set({ items: [item, ...items] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      toggleItem: (item) => {
        const { items } = get();
        const exists = items.some((i) => i.productId === item.productId);
        if (exists) {
          set({ items: items.filter((i) => i.productId !== item.productId) });
          return false;
        } else {
          set({ items: [item, ...items] });
          return true;
        }
      },

      hasItem: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'topinstock_wishlist',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

// ── SSR-safe Hydration Hook ───────────────────
export function useHydratedWishlist() {
  const [isReady, setIsReady] = useState(false);
  const items = useWishlistStore((s) => s.items);
  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const hasItem = useWishlistStore((s) => s.hasItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return {
    isReady,
    items: isReady ? items : [],
    totalCount: isReady ? items.length : 0,
    addItem,
    removeItem,
    toggleItem,
    hasItem,
    clearWishlist,
  };
}
