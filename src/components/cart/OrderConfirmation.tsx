'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatPrice, getItem } from '@/data/menu';

type Order = { id: string; name: string; mode: 'pickup' | 'delivery'; time: string; address?: string; total: number; lines: { id: string; qty: number }[]; at: string };

/** Order confirmation: reads the order saved by CheckoutForm in sessionStorage. TODO(agent): fetch from a real API. */
export default function OrderConfirmation({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  useEffect(() => {
    try { const raw = sessionStorage.getItem('spice-lane-order-' + id); setOrder(raw ? JSON.parse(raw) : null); } catch { setOrder(null); }
  }, [id]);
  if (order === undefined) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="rounded-card border border-line bg-card p-8 text-center md:p-12">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-2xl text-black" aria-hidden>✓</motion.div>
      <h1 className="mt-6 text-4xl font-medium tracking-tight md:text-5xl">Order confirmed</h1>
      <p className="mt-3 font-mono text-sm text-muted">#{id}</p>
      {order ? (
        <>
          <p className="mt-4 text-muted">
            Thanks, {order.name}. {order.mode === 'pickup' ? 'Pick up' : 'Delivery'} {order.time === 'asap' ? 'in about 25 minutes' : `at ${order.time}`}{order.mode === 'delivery' && order.address ? ` to ${order.address}` : ''}.
          </p>
          <ul className="mx-auto mt-8 max-w-sm space-y-2 text-left text-sm">
            {order.lines.map((l) => { const it = getItem(l.id); return it ? <li key={l.id} className="flex justify-between"><span className="text-white/80">{l.qty} × {it.name}</span><span className="font-mono">{formatPrice(it.price * l.qty)}</span></li> : null; })}
            <li className="flex justify-between border-t border-line pt-3 text-base"><span>Total</span><span className="font-mono">{formatPrice(order.total)}</span></li>
          </ul>
        </>
      ) : (
        <p className="mt-4 text-muted">We couldn&apos;t load the order details in this tab, but your order number is above.</p>
      )}
      <a href="/" className="pill-primary mt-10">Back to the belt</a>
    </motion.div>
  );
}
