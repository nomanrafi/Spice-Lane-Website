'use client';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { TIERS, formatPrice, getItem } from '@/data/menu';
import { useStore } from '@/store/useStore';

/** Combo sets. Discount applied to the sum of item prices. Adding a combo adds each item to the cart. TODO(agent): true bundle line in cart. */
const COMBOS = [
  { id: 'chef', name: "Chef's tasting", blurb: 'Salmon roll, sesame tuna tataki and the herb-crusted lamb.', items: ['salmon-roll', 'tuna-tataki', 'lamb'], off: 0.15 },
  { id: 'date', name: 'Date night', blurb: 'A5 wagyu, lobster thermidor, and a molten fondant to share.', items: ['wagyu', 'lobster', 'fondant'], off: 0.2, limited: true },
  { id: 'lunch', name: 'Lunch set', blurb: 'Spaghetti al pomodoro, salmon roll and a sweet finish.', items: ['spaghetti', 'salmon-roll', 'fondant'], off: 0.12 },
];

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => { const end = new Date(); end.setHours(23, 59, 59, 999); setLeft(Math.max(0, end.getTime() - Date.now())); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);
  if (left === null) return '--:--:--';
  const s = Math.floor(left / 1000), p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

/** CSS-3D stacked plate tower: one tilted ring per item in its tier color; plates drop in when visible. */
function Tower({ ids, show }: { ids: string[]; show: boolean }) {
  return (
    <div className="relative mx-auto h-44 w-48" style={{ perspective: 700 }} aria-hidden>
      {ids.map((id, k) => { const it = getItem(id)!; return (
        <motion.div key={id + k} initial={{ y: -80, opacity: 0 }} animate={show ? { y: 0, opacity: 1 } : {}} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 * k }}
          className="absolute left-1/2 h-28 w-40 -ml-20 rounded-full border-[10px]"
          style={{ bottom: k * 26, borderColor: TIERS[it.tier].color, background: `radial-gradient(circle at 50% 45%, ${it.accentColor}, ${it.plateColor ?? '#eee'} 60%)`, transform: 'rotateX(68deg)', boxShadow: '0 18px 30px -12px #000' }} />); })}
    </div>
  );
}

function ComboCard({ c, timer }: { c: (typeof COMBOS)[number]; timer: string }) {
  const add = useStore((s) => s.add);
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: '-15% 0px' });
  const full = c.items.reduce((a, id) => a + (getItem(id)?.price ?? 0), 0);
  const price = Math.round(full * (1 - c.off) * 100) / 100;
  return (
    <article ref={ref} className="relative flex flex-col rounded-card border border-line bg-card p-6">
      {c.limited && <span className="absolute right-5 top-5 rounded-full bg-[#ff1555] px-3 py-1 font-mono text-xs text-white">Ends in {timer}</span>}
      <Tower ids={c.items} show={seen} />
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">{c.name}</h3>
      <p className="mt-2 flex-1 text-sm text-muted">{c.blurb}</p>
      <div className="mt-5 flex items-end justify-between">
        <p className="font-mono">
          <span className="relative mr-3 text-muted">{formatPrice(full)}
            <motion.span className="absolute left-0 top-1/2 h-px w-full origin-left bg-white" initial={{ scaleX: 0 }} animate={seen ? { scaleX: 1 } : {}} transition={{ delay: 0.6, duration: 0.5 }} />
          </span>
          <span className="text-xl text-white">{formatPrice(price)}</span>
        </p>
        <button type="button" onClick={() => c.items.forEach((id) => add(id))} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-105">Add combo</button>
      </div>
    </article>
  );
}

/** 8.4 Chef's specials / combos with stacked-plate towers, animated strike-through and a countdown. */
export default function Specials() {
  const timer = useCountdown();
  return (
    <section id="specials" aria-labelledby="sp-h" className="mx-auto max-w-7xl px-6 py-28">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Chef&apos;s specials</p>
      <h2 id="sp-h" className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-6xl">Stack more, pay less</h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">{COMBOS.map((c) => <ComboCard key={c.id} c={c} timer={timer} />)}</div>
    </section>
  );
}
