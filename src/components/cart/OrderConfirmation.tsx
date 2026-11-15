'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatPrice, getItem } from '@/data/menu';
import type { CartLine } from '@/store/useStore';

type Order = { id: string; name: string; mode: string; time: string; lines: CartLine[]; total: number };
const ease = [0.16, 1, 0.3, 1] as const;

/** Reads the order saved by CheckoutForm in sessionStorage and shows an animated confirmation. */
export default function OrderConfirmation({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  useEffect(() => {
    const raw = sessionStorage.getItem('spice-lane-order-' + id);
    setOrder(raw ? (JSON.parse(raw) as Order) : null);
  }, [id]);

  return (
    <main className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center px-5 py-24 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-white text-3xl text-black" aria-hidden>✓</motion.div>
      <motion.h1 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6, ease }} className="mt-8 text-4xl font-medium tracking-tight md:text-5xl">
        Order confirmed
      </motion.h1>
      <p className="mt-3 font-mono text-sm text-muted">#{id}</p>
      {order === null && <p className="mt-6 text-muted">We couldn’t find the details for this order on this device, but the kitchen has it.</p>}
      {order && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6, ease }} className="mt-8 w-full rounded-card border border-line bg-card p-6 text-left">
          <p className="text-sm text-muted">Thanks, {order.name}. {order.mode === 'delivery' ? 'Your delivery' : 'Your pickup'} is set for {order.time === 'asap' ? 'about 25 minutes from now' : order.time}.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {order.lines.map((l) => { const it = getItem(l.id); return it ? <li key={l.id} className="flex justify-between"><span>{l.qty} × {it.name}</span><span className="font-mono">{formatPrice(it.price * l.qty)}</span></li> : null; })}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4"><span>Total paid</span><span className="font-mono">{formatPrice(order.total)}</span></div>
        </motion.div>
      )}
      <a href="/" className="pill-primary mt-10">Back to the belt</a>
    </main>
  );
}
