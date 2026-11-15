'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { MENU, TIERS, formatPrice, getItem, type Tier } from '@/data/menu';
import { useStore } from '@/store/useStore';
import { seekSlot } from '@/lib/belt';
import AmbientGlow from './AmbientGlow';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-card bg-card/40" /> });

const TIER_ORDER: Tier[] = ['blue', 'green', 'orange', 'purple', 'red'];

function RoundBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white/5 text-white backdrop-blur transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
      {children}
    </button>
  );
}

export default function Hero() {
  const hoverId = useStore((s) => s.hoverId);
  const frontId = useStore((s) => s.frontId);
  const paused = useStore((s) => s.paused);
  const togglePause = useStore((s) => s.togglePause);
  const open = useStore((s) => s.open);
  const active = getItem(hoverId ?? '') ?? (paused ? getItem(frontId) : undefined);

  // keyboard: ←/→ rotate one slot, Space pause, Enter open front item (only when hero focused)
  useEffect(() => {
    const el = document.getElementById('hero');
    const onKey = (e: KeyboardEvent) => {
      if (!el?.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); seekSlot(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); seekSlot(1); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="hero" aria-label="Spice Lane tasting belt" className="relative isolate mx-auto grid min-h-[100svh] max-w-7xl grid-cols-1 items-center gap-8 px-6 pt-28 pb-12 lg:grid-cols-[minmax(0,36%)_1fr]">
      <AmbientGlow />
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Spice Lane · Tasting belt</p>
        <h1 className="mt-5 text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-5xl">
          A tasting belt that keeps turning, right on the page.
        </h1>
        <ul className="mt-7 flex flex-wrap gap-4 font-mono text-sm text-muted" aria-label="Plate colour price legend">
          {TIER_ORDER.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2" style={{ borderColor: TIERS[t].color }} />
              {formatPrice(TIERS[t].price)}
            </li>
          ))}
        </ul>
        <div className="mt-6 min-h-[4.5rem] text-muted" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p key={active?.id ?? 'default'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              {active ? (<><b className="font-semibold text-white">{active.name} · {formatPrice(active.price)}</b><br />{active.description}</>)
                : 'Hover to stop the belt, flick to spin it, pick a plate to order.'}
            </motion.p>
          </AnimatePresence>
        </div>
        <a href="#menu" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90">See full menu</a>
      </div>

      <div className="relative">
        <div className="relative aspect-[4/3] w-full">
          <HeroCanvas />
          <AnimatePresence>
            {active && (
              <motion.div key={active.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line bg-black/70 px-4 py-2 text-sm text-white backdrop-blur">
                <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: TIERS[active.tier].color }} />
                {active.name} <span className="ml-1 text-muted">{formatPrice(active.price)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <RoundBtn label="Previous plate" onClick={() => seekSlot(-1)}>‹</RoundBtn>
          <RoundBtn label={paused ? 'Play belt' : 'Pause belt'} onClick={togglePause}>{paused ? (<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor"><path d="M4 2.5v9a.5.5 0 0 0 .77.42l7-4.5a.5.5 0 0 0 0-.84l-7-4.5A.5.5 0 0 0 4 2.5Z"/></svg>) : (<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>)}</RoundBtn>
          <RoundBtn label="Next plate" onClick={() => seekSlot(1)}>›</RoundBtn>
        </div>
        {/* accessible plate list (keyboard/screen-reader alternative to the 3D belt) */}
        <ul className="sr-only">
          {MENU.map((m) => (<li key={m.id}><button type="button" onClick={() => open(m.id)}>{m.name}, {formatPrice(m.price)}</button></li>))}
        </ul>
      </div>
    </section>
  );
}
