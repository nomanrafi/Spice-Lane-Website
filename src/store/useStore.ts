'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MENU, getItem } from '@/data/menu';

export type CartLine = { id: string; qty: number };
type State = {
  frontId: string;            // plate closest to camera at the front of the belt
  hoverId: string | null;     // plate under the pointer
  selectedId: string | null;  // item open in the product modal
  paused: boolean;            // auto-rotation toggle
  cart: CartLine[];
  cartOpen: boolean;
  addedTick: number;          // increments on every add → drives the "Added" chip + bounce
  ghost: { id: string; x: number; y: number } | null; // plate being dragged to the cart (Step 6)
  burst: { x: number; y: number; color: string; t: number } | null; // drop burst at cart pill
  setGhost: (g: State['ghost']) => void;
  setBurst: (b: State['burst']) => void;
  setFront: (id: string) => void;
  setHover: (id: string | null) => void;
  open: (id: string | null) => void;
  togglePause: () => void;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setCartOpen: (v: boolean) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      frontId: MENU[0].id, hoverId: null, selectedId: null, paused: false,
      cart: [], cartOpen: false, addedTick: 0, ghost: null, burst: null,
      setGhost: (ghost) => set({ ghost }),
      setBurst: (burst) => set({ burst }),
      setFront: (id) => set((s) => (s.frontId === id ? s : { frontId: id })),
      setHover: (id) => set({ hoverId: id }),
      open: (id) => set({ selectedId: id }),
      togglePause: () => set((s) => ({ paused: !s.paused })),
      add: (id, qty = 1) => set((s) => {
        const ex = s.cart.find((l) => l.id === id);
        const cart = ex ? s.cart.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l)) : [...s.cart, { id, qty }];
        return { cart, addedTick: s.addedTick + 1 };
      }),
      setQty: (id, qty) => set((s) => ({ cart: qty <= 0 ? s.cart.filter((l) => l.id !== id) : s.cart.map((l) => (l.id === id ? { ...l, qty } : l)) })),
      remove: (id) => set((s) => ({ cart: s.cart.filter((l) => l.id !== id) })),
      clear: () => set({ cart: [] }),
      setCartOpen: (v) => set({ cartOpen: v }),
    }),
    { name: 'spice-lane-cart', storage: createJSONStorage(() => localStorage), partialize: (s) => ({ cart: s.cart }) },
  ),
);

export const cartCount = (c: CartLine[]) => c.reduce((n, l) => n + l.qty, 0);
export const cartTotal = (c: CartLine[]) => c.reduce((n, l) => n + (getItem(l.id)?.price ?? 0) * l.qty, 0);
