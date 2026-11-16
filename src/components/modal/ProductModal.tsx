'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { MENU, TIERS, formatPrice, getItem } from '@/data/menu';
import { useStore } from '@/store/useStore';
import { lockScroll, unlockScroll } from '@/lib/scrollLock';

const ModelViewer = dynamic(() => import('@/components/three/ModelViewer'), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-white/5" /> });
const ease = [0.16, 1, 0.3, 1] as const;

/** Product popup: 3D orbit viewer left, details right. Esc / click-outside / ✕ close; ‹ › browse; focus trap; body scroll lock. */
export default function ProductModal() {
  const selectedId = useStore((s) => s.selectedId);
  const open = useStore((s) => s.open);
  const add = useStore((s) => s.add);
  const item = selectedId ? getItem(selectedId) : undefined;
  const idx = item ? MENU.findIndex((m) => m.id === item.id) : -1;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => { setQty(1); setAdded(false); }, [selectedId]);
  const go = (d: number) => open(MENU[(idx + d + MENU.length) % MENU.length].id);

  useEffect(() => {
    if (!item) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    lockScroll();
    setTimeout(() => card.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') open(null);
      if (e.key === 'Tab' && card.current) {
        const f = card.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); unlockScroll(); prevFocus?.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!item]);

  const onAdd = () => { if (!item) return; add(item.id, qty); setAdded(true); setTimeout(() => setAdded(false), 1600); };

  return (
    <AnimatePresence>
      {item && (
        <motion.div key="backdrop" data-lenis-prevent className="fixed inset-0 z-[60] flex overscroll-contain items-end justify-center bg-black/60 backdrop-blur-md md:items-center md:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) open(null); }}>
          <motion.div ref={card} role="dialog" aria-modal="true" aria-labelledby="pm-title"
            initial={{ opacity: 0, y: 60, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.55, ease }}
            className="relative grid max-h-[94svh] w-full max-w-[1120px] grid-cols-1 overflow-hidden rounded-t-card border border-line bg-card md:grid-cols-[1.15fr_1fr] md:rounded-card">
            <button type="button" onClick={() => open(null)} className="pill-glass absolute right-4 top-4 z-10 !px-3 !py-1.5 text-xs">Close ✕</button>
            <div className="relative h-[340px] md:h-[600px]" style={{ background: `radial-gradient(closest-side, ${item.accentColor}33, transparent)` }}>
              <AnimatePresence mode="wait">
                <motion.div key={item.id} className="h-full w-full" initial={{ opacity: 0, rotate: -8, scale: 0.9 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.45, ease }}>
                  <ModelViewer item={item} />
                </motion.div>
              </AnimatePresence>
              <span className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-line bg-black/50 px-3 py-1 text-xs text-muted backdrop-blur">Drag to rotate</span>
            </div>
            <div className="flex flex-col gap-5 overflow-y-auto overscroll-contain p-7 pt-14 md:p-10 md:pt-16">
              <p className="flex items-center gap-2 font-mono text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: TIERS[item.tier].color }} />
                {String(idx + 1).padStart(2, '0')} / {String(MENU.length).padStart(2, '0')}
              </p>
              <AnimatePresence mode="wait">
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease }}>
                  <h2 id="pm-title" className="text-3xl font-medium tracking-tight md:text-4xl">{item.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{item.longDescription}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((t) => <li key={t} className="rounded-full border border-line px-3 py-1 text-xs text-white/80">{t}</li>)}
                  </ul>
                </motion.div>
              </AnimatePresence>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-mono text-2xl">{formatPrice(item.price)}</span>
                <div className="flex items-center gap-3 rounded-full border border-line px-2 py-1" aria-label="Quantity">
                  <button type="button" aria-label="Decrease quantity" className="h-8 w-8 rounded-full hover:bg-white/10" onClick={() => setQty((q) => Math.max(1, q - 1))}>–</button>
                  <span className="w-5 text-center font-mono tabular-nums" aria-live="polite">{qty}</span>
                  <button type="button" aria-label="Increase quantity" className="h-8 w-8 rounded-full hover:bg-white/10" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
                </div>
              </div>
              <motion.button data-autofocus type="button" onClick={onAdd} layout className="pill-primary justify-center !py-3.5">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={added ? 'a' : 'b'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                    {added ? '✓ Added' : `+ Add to order · ${formatPrice(item.price * qty)}`}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <div className="flex justify-between">
                <button type="button" className="pill-glass !py-2" onClick={() => go(-1)} aria-label="Previous item">‹ Prev</button>
                <button type="button" className="pill-glass !py-2" onClick={() => go(1)} aria-label="Next item">Next ›</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
