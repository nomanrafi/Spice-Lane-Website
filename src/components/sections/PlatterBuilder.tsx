'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { MENU, TIERS, formatPrice, getItem } from '@/data/menu';
import { useStore } from '@/store/useStore';

const PlatterCanvas = dynamic(() => import('./PlatterCanvas'), { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-card bg-white/5" /> });
const MAX = 6;
const BUNDLE_OFF = 0.1; // 10% off a full platter (6 dishes)

/** 8.5 Build your own platter: drag (or click) dishes onto a 3D wooden platter; live total; add all to cart.
 *  A full platter goes to the cart as ONE bundle line at the discounted price; a partial one adds dishes individually. */
export default function PlatterBuilder() {
  const [ids, setIds] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const add = useStore((s) => s.add);
  const addBundle = useStore((s) => s.addBundle);
  const put = (id: string) => setIds((v) => (v.length >= MAX ? v : [...v, id]));
  const sum = ids.reduce((a, id) => a + (getItem(id)?.price ?? 0), 0);
  const total = ids.length === MAX ? Math.round(sum * (1 - BUNDLE_OFF) * 100) / 100 : sum;

  return (
    <section id="platter" aria-labelledby="pl-h" className="mx-auto max-w-7xl px-6 py-28">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Build your own</p>
      <h2 id="pl-h" className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-6xl">Your platter, your rules</h2>
      <p className="mt-3 max-w-xl text-muted">Drag up to {MAX} dishes onto the board. Fill every spot and get {BUNDLE_OFF * 100}% off.</p>
      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <ul className="grid grid-cols-2 gap-3 self-start" aria-label="Dishes">
          {MENU.map((it) => (
            <li key={it.id}>
              <button type="button" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', it.id)} onClick={() => put(it.id)}
                disabled={ids.length >= MAX} aria-label={`Add ${it.name} to platter`}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card p-3 text-left transition hover:border-white/30 disabled:opacity-40">
                <span className="h-8 w-8 shrink-0 rounded-full border-4" style={{ borderColor: TIERS[it.tier].color, background: it.accentColor }} />
                <span className="min-w-0"><span className="block truncate text-sm text-white">{it.name}</span><span className="font-mono text-xs text-muted">{formatPrice(it.price)}</span></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4">
          <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData('text/plain'); if (getItem(id)) put(id); }}
            className={`relative h-[420px] overflow-hidden rounded-card border bg-card transition ${over ? 'border-white/60' : 'border-line'}`}>
            <PlatterCanvas ids={ids} />
            {ids.length === 0 && <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-sm text-muted">Drop dishes here</p>}
            <span className="absolute left-5 top-5 font-mono text-xs text-muted">{String(ids.length).padStart(2, '0')} / {String(MAX).padStart(2, '0')}</span>
          </div>
          <div className="flex flex-wrap gap-2" aria-live="polite">
            <AnimatePresence>
              {ids.map((id, k) => (
                <motion.button key={`${id}-${k}`} layout initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
                  type="button" onClick={() => setIds((v) => v.filter((_, j) => j !== k))} aria-label={`Remove ${getItem(id)?.name}`}
                  className="rounded-full border border-line bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10">{getItem(id)?.name} ×</motion.button>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between rounded-card border border-line bg-card p-5">
            <p className="font-mono text-white"><span className="text-muted">Total </span><span className="text-2xl">{formatPrice(total)}</span>
              {ids.length === MAX && <span className="ml-2 text-xs text-[#01b87b]">-{BUNDLE_OFF * 100}%</span>}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIds([])} disabled={!ids.length} className="rounded-full border border-line px-4 py-2 text-sm text-white disabled:opacity-40">Clear</button>
              <button type="button" disabled={!ids.length} onClick={() => { if (ids.length === MAX) addBundle('platter-' + [...ids].sort().join('-'), { name: 'Custom platter', items: ids, price: total }); else ids.forEach((id) => add(id)); setIds([]); }}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-105 disabled:opacity-40">Add platter</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
