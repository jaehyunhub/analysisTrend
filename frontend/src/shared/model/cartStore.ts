import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  option?: string;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: number, option?: string) => void;
  updateQuantity: (id: number, quantity: number, option?: string) => void;
  clearCart: () => void;
}

const calculateTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set) => ({
      items: [],
      totalPrice: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === item.id && i.option === item.option
          );
          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((i) =>
              i.id === item.id && i.option === item.option
                ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                : i
            );
          } else {
            newItems = [...state.items, { ...item, quantity: item.quantity ?? 1 }];
          }
          return { items: newItems, totalPrice: calculateTotal(newItems) };
        }),

      removeItem: (id, option) =>
        set((state) => {
          const newItems = state.items.filter(
            (i) => !(i.id === id && i.option === option)
          );
          return { items: newItems, totalPrice: calculateTotal(newItems) };
        }),

      updateQuantity: (id, quantity, option) =>
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter(
              (i) => !(i.id === id && i.option === option)
            );
            return { items: newItems, totalPrice: calculateTotal(newItems) };
          }
          const newItems = state.items.map((i) =>
            i.id === id && i.option === option ? { ...i, quantity } : i
          );
          return { items: newItems, totalPrice: calculateTotal(newItems) };
        }),

      clearCart: () => set({ items: [], totalPrice: 0 }),
    }),
    { name: 'cart-storage' }
  )
);
