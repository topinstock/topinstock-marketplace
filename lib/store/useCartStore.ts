import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';

// ============================================
//   Cart State Management — Zustand Store
//   Supports multi-vendor marketplace cart items,
//   localStorage persistence and safe hydration.
// ============================================

export interface CartItem {
  id: string; // unique item key: `${productId}-${size || 'std'}-${color || 'std'}`
  productId: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  vendorId: string;
  vendorName: string;
}

export const FLAT_DELIVERY_FEE = 19; // Flat 19 LEI delivery fee
export const MINIMUM_ORDER_AMOUNT = 50; // Valoare minimă comandă: 50 LEI

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isHydrated: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { id?: string; quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setHydrated: (state: boolean) => void;

  // Selectors / Helpers
  getTotalCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getGrandTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isHydrated: false,

      addItem: (newItem) => {
        const itemKey =
          newItem.id ||
          `${newItem.productId}-${newItem.size || 'std'}-${newItem.color || 'std'}`;
        const addQty = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === itemKey);
          let updatedItems: CartItem[];

          if (existingIndex > -1) {
            updatedItems = state.items.map((item, idx) =>
              idx === existingIndex
                ? { ...item, quantity: item.quantity + addQty }
                : item
            );
          } else {
            updatedItems = [
              ...state.items,
              {
                ...newItem,
                id: itemKey,
                quantity: addQty,
              },
            ];
          }

          return { items: updatedItems, isOpen: true };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setHydrated: (val) => set({ isHydrated: val }),

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        const total = get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        return Math.round(total * 100) / 100;
      },

      getDeliveryFee: () => {
        return get().items.length > 0 ? FLAT_DELIVERY_FEE : 0;
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const delivery = get().getDeliveryFee();
        return Math.round((subtotal + delivery) * 100) / 100;
      },
    }),
    {
      name: 'topinstock_cart_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Safe SSR / Client Hydration Hook
export function useHydratedCart() {
  const store = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    ...store,
    isReady: mounted,
    items: mounted ? store.items : [],
    totalCount: mounted ? store.getTotalCount() : 0,
    subtotal: mounted ? store.getSubtotal() : 0,
    deliveryFee: mounted ? store.getDeliveryFee() : 0,
    grandTotal: mounted ? store.getGrandTotal() : 0,
    isMinimumMet: (mounted ? store.getSubtotal() : 0) >= MINIMUM_ORDER_AMOUNT,
    minimumDifference: Math.max(0, Math.round((MINIMUM_ORDER_AMOUNT - (mounted ? store.getSubtotal() : 0)) * 100) / 100),
    minimumOrderAmount: MINIMUM_ORDER_AMOUNT,
  };
}
