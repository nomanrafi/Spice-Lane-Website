'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MENU, TIERS, formatPrice, type Tier } from '@/data/menu';

const TIER_ORDER: Tier[] = ['blue', 'green', 'orange', 'purple', 'red'];
const STEPS = [
  { n: '01', t: 'Pick a color', d: 'Every plate rim tells you its price. Five colors, five prices — no menu maths.' },
  { n: '02', t: 'Grab a plate', d: 'Spin the belt, hover to preview, then click or drag any plate straight into your order.' },
  { n: '03', t: 'Stack it up', d: 'Plates stack in tier colors as you add them, just like a real kaiten bill.' },
  { n: '04', t: 'Pay by plates', d: 'Count the stack, check out in seconds. Pickup or delivery, your call.' },
];

/** Animated SVG icon per step (stroke-draw on reveal). */
function Icon({ i }: { i: number }) {
  const c = TIERS[TIER_ORDER[i + 1]].color;
  const common = { fill: 'none', stroke: c, strokeWidth: 3, strokeLinecap: 'round' as const, className: 'hiw-draw' };
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden>
      {i === 0 && TIER_ORDER.map((t, k) => <circle key={t} cx={60} cy={60} r={14 + k * 9} {...common} stroke={TIERS[t].color} />)}
      {i === 1 && (<><ellipse cx={60} cy={70} rx={40} ry={14} {...common} /><path d="M40 62c6-14 34-14 40 0" {...common} /><path d="M60 20v26m-10-10 10 10 10-10" {...common} /></>)}
      {i === 2 && [0, 1, 2, 3].map((k) => <ellipse key={k} cx={60} cy={92 - k * 18} rx={36} ry={10} {...common} stroke={TIERS[TIER_ORDER[k]].color} />)}
      {i === 3 && (<><rect x={22} y={34} width={76} height={52} rx={10} {...common} /><path d="M22 50h76M34 72h20" {...common} /></>)}
    </svg>
  );
}

/** 8.3 How it works: horizontal scroll-pinned storyline (4 steps) + interactive tier-ring legend. */
export default function HowItWorks() {
  const sec = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState<Tier | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<SVGGeometryElement>('.hiw-draw').forEach((el) => {
        const len = el.getTotalLength?.() ?? 300;
        gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
      });
      if (reduce || window.innerWidth < 768 || !track.current) return;
      const dist = () => track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec.current, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section id="how" aria-labelledby="how-h" className="relative overflow-hidden py-24">
      <div ref={sec} className="flex min-h-screen flex-col justify-center">
        <div className="mx-auto w-full max-w-7xl px-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Kaiten, explained</p>
          <h2 id="how-h" className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-6xl">How the belt works</h2>
        </div>
        <div ref={track} className="mt-12 flex flex-col gap-5 px-6 md:w-max md:flex-row md:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] md:pr-24">
          {STEPS.map((s, i) => (
            <article key={s.n} className="flex flex-col justify-between rounded-card border border-line bg-card p-8 md:h-[26rem] md:w-[26rem]">
              <div className="flex items-start justify-between"><span className="font-mono text-sm text-muted">{s.n} / 04</span><Icon i={i} /></div>
              <div><h3 className="text-3xl font-semibold tracking-tight text-white">{s.t}</h3><p className="mt-3 text-muted">{s.d}</p></div>
            </article>))}
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-7xl px-6">
        <h3 className="text-2xl font-medium text-white">Plate color = price</h3>
        <div className="mt-8 flex flex-wrap gap-6">
          {TIER_ORDER.map((t) => (
            <button key={t} type="button" onMouseEnter={() => setHot(t)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(t)} onBlur={() => setHot(null)}
              aria-label={`${t} plates ${formatPrice(TIERS[t].price)}`}
              className="group flex flex-col items-center gap-3 transition-transform duration-300 hover:-translate-y-1">
              <span className="grid h-24 w-24 place-items-center rounded-full border-[10px] transition-all duration-300 group-hover:scale-110"
                style={{ borderColor: TIERS[t].color, boxShadow: hot === t ? `0 0 40px ${TIERS[t].color}88` : 'none' }} />
              <span className="font-mono text-sm text-white">{formatPrice(TIERS[t].price)}</span>
            </button>))}
        </div>
        <ul className="mt-8 flex flex-wrap gap-2" aria-live="polite">
          {MENU.map((m) => (
            <li key={m.id} className="rounded-full border px-3 py-1.5 text-sm transition-all duration-300"
              style={{ borderColor: hot === m.tier ? TIERS[m.tier].color : '#ffffff14', color: hot && hot !== m.tier ? '#555' : '#fff', background: hot === m.tier ? `${TIERS[m.tier].color}22` : 'transparent' }}>{m.name}</li>))}
        </ul>
      </div>
    </section>
  );
}
