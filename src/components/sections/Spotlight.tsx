'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MENU, TIERS, formatPrice, getItem } from '@/data/menu';
import { useStore } from '@/store/useStore';

const SpotlightCanvas = dynamic(() => import('./SpotlightCanvas'), { ssr: false });

/** 8.1 "Meet your plate": 300vh sticky section, scroll progress (GSAP ScrollTrigger scrub) drives 5 stages. */
export default function Spotlight() {
  const frontId = useStore((s) => s.frontId);
  const add = useStore((s) => s.add);
  const open = useStore((s) => s.open);
  // review 13.9: show ONLY the item that is front-selected on the hero belt
  const item = getItem(frontId) ?? MENU[0];
  const sec = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: sec.current, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (s) => { progress.current = s.progress; setStage(Math.min(4, Math.floor(s.progress * 5))); },
    });
    return () => st.kill();
  }, []);

  const n = item.nutrition;
  const max = { kcal: 900, protein: 60, carbs: 100, fat: 60 } as const;
  const show = (i: number) => stage >= i;
  const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

  return (
    <section id="spotlight" ref={sec} aria-label="Meet your plate" className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px] transition-colors duration-700" style={{ background: item.accentColor }} />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-6 md:grid-cols-[1fr_1.2fr_1fr]">
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">Meet your plate · {String(MENU.indexOf(item) + 1).padStart(2, '0')} / {String(MENU.length).padStart(2, '0')}</p>
            <AnimatePresence mode="wait">
              <motion.div key={item.id} {...fade}>
                <h2 className="text-4xl font-semibold leading-[1.02] tracking-tight text-white md:text-6xl">{item.name}</h2>
                <p className="mt-3 text-muted">{item.longDescription}</p>
                <p className="mt-4 inline-flex items-center gap-2 font-mono text-lg text-white"><span className="h-3 w-3 rounded-full" style={{ background: TIERS[item.tier].color }} />{formatPrice(item.price)}</p>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>{show(3) && (
              <motion.div {...fade} className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {item.allergens.map((a) => <span key={a} className="rounded-full border border-line bg-white/5 px-3 py-1 text-xs text-white">{a}</span>)}
                  {item.vegetarian && <span className="rounded-full bg-tier-green/20 px-3 py-1 text-xs text-tier-green">Vegetarian</span>}
                  {!!item.spicy && <span className="rounded-full bg-tier-red/20 px-3 py-1 text-xs text-tier-red">{'🌶'.repeat(item.spicy)} Spicy</span>}
                </div>
                {item.chefNote && <blockquote className="border-l-2 pl-3 text-sm italic text-white/80" style={{ borderColor: item.accentColor }}>“{item.chefNote}” — Chef</blockquote>}
              </motion.div>)}
            </AnimatePresence>
          </div>

          <div className="relative h-[42vh] md:h-[70vh]">
            <SpotlightCanvas item={item} progress={progress} />
            <AnimatePresence>{show(1) && item.ingredients.map((ing, i) => {
              const a = (i / item.ingredients.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <motion.span key={item.id + ing.name} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.08 }}
                  className="absolute flex items-center gap-2 rounded-full border border-line bg-black/60 px-3 py-1 text-xs text-white backdrop-blur"
                  style={{ left: `${50 + Math.cos(a) * 44}%`, top: `${48 + Math.sin(a) * 40}%`, transform: 'translate(-50%,-50%)' }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: ing.color }} />{ing.name}
                </motion.span>);
            })}</AnimatePresence>
          </div>

          <div className="space-y-5">
            <AnimatePresence>{show(2) && (
              <motion.div {...fade} className="grid grid-cols-2 gap-3 rounded-card border border-line bg-card/70 p-5">
                {(Object.keys(max) as (keyof typeof max)[]).map((k) => (
                  <div key={k}>
                    <p className="font-mono text-2xl text-white">{n[k]}<span className="text-xs text-muted">{k === 'kcal' ? '' : 'g'}</span></p>
                    <p className="text-xs uppercase text-muted">{k}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10"><motion.div className="h-full rounded-full" style={{ background: item.accentColor }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (n[k] / max[k]) * 100)}%` }} transition={{ duration: 0.9 }} /></div>
                  </div>))}
              </motion.div>)}
            </AnimatePresence>
            <AnimatePresence>{show(4) && (
              <motion.div {...fade} className="space-y-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => add(item.id)} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.03]">Add to order · {formatPrice(item.price)}</button>
                  <button type="button" onClick={() => open(item.id)} className="rounded-full border border-line bg-white/5 px-5 py-3 text-sm text-white">Details</button>
                </div>
                {!!item.pairing?.length && <p className="text-xs uppercase tracking-widest text-muted">You might also like</p>}
                <div className="flex flex-wrap gap-2">{item.pairing?.map((id) => { const p = getItem(id); return p && (
                  <button key={id} type="button" onClick={() => open(id)} className="rounded-full border border-line px-3 py-1 text-xs text-white hover:bg-white/10">{p.name}</button>); })}</div>
              </motion.div>)}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
