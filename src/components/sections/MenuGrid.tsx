'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { CATEGORIES, CATEGORY_OF, MENU, TIERS, formatPrice, isGlutenFree, type Category, type MenuItem, type Tier } from '@/data/menu';
import { useStore } from '@/store/useStore';

const ModelViewer = dynamic(() => import('@/components/three/ModelViewer'), { ssr: false });
const TIER_ORDER: Tier[] = ['blue', 'green', 'orange', 'purple', 'red'];

/** Card: accent-glow poster by default, live 3D only while hovered/focused (one canvas at a time). 3D tilt follows cursor. */
function Card({ item, live, onLive }: { item: MenuItem; live: boolean; onLive: (v: boolean) => void }) {
  const add = useStore((s) => s.add);
  const open = useStore((s) => s.open);
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <motion.article layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}
      ref={ref} onPointerEnter={() => onLive(true)} onPointerLeave={() => { onLive(false); setTilt({ x: 0, y: 0 }); }}
      onPointerMove={(e) => { const r = ref.current!.getBoundingClientRect(); setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 8 }); }}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, boxShadow: live ? `0 0 0 1px ${item.accentColor}88, 0 20px 60px -20px ${item.accentColor}66` : undefined }}
      className="group relative overflow-hidden rounded-card border border-line bg-card transition-shadow duration-300">
      <button type="button" onClick={() => open(item.id)} onFocus={() => onLive(true)} onBlur={() => onLive(false)} aria-label={`Open ${item.name}`} className="relative block h-56 w-full">
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(60% 60% at 50% 60%, ${item.accentColor}55, transparent 70%)` }} />
        {live ? <div className="absolute inset-0"><ModelViewer item={item} /></div> : (
          // Poster = pre-rendered PNG of the real GLB (npm run generate-posters).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.poster} alt={`${item.name}, 3D render`} loading="lazy" decoding="async" width={768} height={768}
            className="absolute inset-0 m-auto h-full w-auto object-contain p-2 transition-transform duration-500 group-hover:scale-105" />)}
      </button>
      <div className="flex items-end justify-between gap-3 p-5">
        <div>
          <h3 className="text-lg font-medium text-white">{item.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
          <p className="mt-2 flex items-center gap-2 font-mono text-sm text-white"><span className="h-2.5 w-2.5 rounded-full" style={{ background: TIERS[item.tier].color }} />{formatPrice(item.price)}</p>
        </div>
        <button type="button" onClick={() => add(item.id)} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-105" aria-label={`Add ${item.name}`}>+ Add</button>
      </div>
    </motion.article>
  );
}

export default function MenuGrid() {
  const [cat, setCat] = useState<Category>('All');
  const [q, setQ] = useState('');
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [veg, setVeg] = useState(false), [spicy, setSpicy] = useState(false), [gf, setGf] = useState(false);
  const [live, setLive] = useState<string | null>(null);
  const items = useMemo(() => MENU.filter((m) =>
    (cat === 'All' || CATEGORY_OF[m.id] === cat) &&
    (!q || (m.name + m.description + m.tags.join(' ')).toLowerCase().includes(q.toLowerCase())) &&
    (!tiers.length || tiers.includes(m.tier)) && (!veg || m.vegetarian) && (!spicy || (m.spicy ?? 0) > 0) && (!gf || isGlutenFree(m))), [cat, q, tiers, veg, spicy, gf]);
  const toggle = (on: boolean, set: (v: boolean) => void, label: string) => (
    <button type="button" aria-pressed={on} onClick={() => set(!on)} className={`rounded-full border px-3 py-1.5 text-xs transition ${on ? 'border-white bg-white text-black' : 'border-line text-white hover:bg-white/10'}`}>{label}</button>);

  return (
    <section id="menu" aria-labelledby="menu-h" className="mx-auto max-w-7xl px-6 py-28">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">The full menu</p>
      <h2 id="menu-h" className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-6xl">Everything on the belt</h2>
      <LayoutGroup>
        <div role="tablist" aria-label="Categories" className="mt-8 flex flex-wrap gap-1 rounded-full border border-line bg-white/5 p-1 w-fit">
          {CATEGORIES.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} type="button" onClick={() => setCat(c)} className="relative rounded-full px-4 py-2 text-sm">
              {cat === c && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className={`relative ${cat === c ? 'text-black' : 'text-white'}`}>{c}</span>
            </button>))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes…" aria-label="Search menu"
            className="w-56 rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-white/40" />
          <div className="flex gap-1.5" aria-label="Price tier filter">
            {TIER_ORDER.map((t) => (
              <button key={t} type="button" aria-pressed={tiers.includes(t)} aria-label={`${t} tier ${formatPrice(TIERS[t].price)}`}
                onClick={() => setTiers((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))}
                className={`h-7 w-7 rounded-full border-[3px] transition ${tiers.includes(t) ? 'scale-110 ring-2 ring-white' : ''}`} style={{ borderColor: TIERS[t].color }} />))}
          </div>
          {toggle(veg, setVeg, 'Veg')}{toggle(spicy, setSpicy, 'Spicy')}{toggle(gf, setGf, 'Gluten-free')}
        </div>
        <motion.div layout className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {items.map((m) => <Card key={m.id} item={m} live={live === m.id} onLive={(v) => setLive((l) => (v ? m.id : l === m.id ? null : l))} />)}
          </AnimatePresence>
        </motion.div>
        {!items.length && <p className="mt-10 text-muted">No dishes match those filters.</p>}
      </LayoutGroup>
    </section>
  );
}
