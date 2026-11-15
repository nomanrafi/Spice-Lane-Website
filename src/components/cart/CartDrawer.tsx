'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TIERS, formatPrice, getItem } from '@/data/menu';
import { useStore, cartCount, cartTotal } from '@/store/useStore';

const ease = [0.16, 1, 0.3, 1] as const;

/** Slide-in cart drawer (right). Esc / backdrop closes. Lines: tier dot, name, qty stepper, remove. */
export default function CartDrawer() {
  const open = useStore((s) => s.cartOpen);
  const setOpen = useStore((s) => s.setCartOpen);
  const cart = useStore((s) => s.cart);
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.remove);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, setOpen]);

  if (!mounted) return null;
  const subtotal = cartTotal(cart);
  const service = subtotal * 0.1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="cart" className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <motion.aside role="dialog" aria-modal="true" aria-label="Your order" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.5, ease }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-line bg-card">
            <div className="flex items-center justify-between border-b border-line p-6">
              <h2 className="text-xl font-medium tracking-tight">Your order <span className="font-mono text-sm text-muted">({cartCount(cart)})</span></h2>
              <button type="button" onClick={() => setOpen(false)} className="pill-glass !px-3 !py-1.5 text-xs">Close ✕</button>
            </div>
            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-muted">Your tray is empty. Pick a plate from the belt.</p>
                <button type="button" className="pill-primary" onClick={() => setOpen(false)}>Browse the belt</button>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto p-6">
                  <AnimatePresence initial={false}>
                    {cart.map((l) => {
                      const it = getItem(l.id);
                      if (!it) return null;
                      return (
                        <motion.li key={l.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.3, ease }}
                          className="flex items-center gap-4 rounded-2xl border border-line p-4">
                          <span className="h-10 w-10 shrink-0 rounded-full border-4" style={{ borderColor: TIERS[it.tier].color, background: it.accentColor + '55' }} aria-hidden />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{it.name}</p>
                            <p className="font-mono text-xs text-muted">{formatPrice(it.price)} · {formatPrice(it.price * l.qty)}</p>
                          </div>
                          <div className="flex items-center gap-1 rounded-full border border-line px-1">
                            <button type="button" aria-label={`Decrease ${it.name}`} className="h-7 w-7 rounded-full hover:bg-white/10" onClick={() => setQty(l.id, l.qty - 1)}>–</button>
                            <span className="w-5 text-center font-mono text-sm tabular-nums">{l.qty}</span>
                            <button type="button" aria-label={`Increase ${it.name}`} className="h-7 w-7 rounded-full hover:bg-white/10" onClick={() => setQty(l.id, l.qty + 1)}>+</button>
                          </div>
                          <button type="button" aria-label={`Remove ${it.name}`} className="text-muted hover:text-white" onClick={() => remove(l.id)}>✕</button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                <div className="space-y-2 border-t border-line p-6 text-sm">
                  <div className="flex justify-between text-muted"><span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-muted"><span>Service (10%)</span><span className="font-mono">{formatPrice(service)}</span></div>
                  <div className="flex justify-between pt-2 text-base"><span>Total</span><span className="font-mono">{formatPrice(subtotal + service)}</span></div>
                  <Link href="/checkout" onClick={() => setOpen(false)} className="pill-primary mt-4 w-full justify-center !py-3.5">Checkout →</Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
