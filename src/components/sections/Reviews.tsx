'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MENU, TIERS, formatPrice } from '@/data/menu';
import { useStore } from '@/store/useStore';

const ORDERS = [412, 368, 341, 297, 264, 238, 205, 187];
const RATING = ['4.9', '4.8', '4.9', '4.7', '4.8', '4.9', '4.6', '4.8'];

const REVIEWS = [
  { n: 'Aisha R.', r: 5, t: 'Dragging plates straight into the cart is ridiculously fun. Food arrived hot and beautiful.' },
  { n: 'Tanvir H.', r: 5, t: 'Best salmon roll in town. The 3D belt sold me before I even tasted it.' },
  { n: 'Maya L.', r: 4, t: 'Loved the platter builder — made a sharing board for six in a minute.' },
  { n: 'Daniel K.', r: 5, t: 'The wagyu is unreal. Ordering by plate color is genius for groups.' },
  { n: 'Sara M.', r: 5, t: 'Booked a table from the site, got a confirmation instantly. Smooth all round.' },
  { n: 'Rafi A.', r: 4, t: 'Tuna tataki was perfectly seared. Will be back for the chocolate fondant.' },
];
const AVG = 4.8;
const COUNT = 2347;

function Stars({ value }: { value: number }) {
  return (
    <span className="relative inline-block font-mono text-2xl leading-none tracking-widest" aria-label={`${value} out of 5 stars`}>
      <span className="text-white/15">★★★★★</span>
      <span className="rv-stars absolute inset-0 overflow-hidden whitespace-nowrap text-amber-400" style={{ width: `${(value / 5) * 100}%` }}>★★★★★</span>
    </span>
  );
}

/** 8.6 Social proof: rating count-up + animated stars, hover-pausing marquee, parallax gallery. */
export default function Reviews() {
  const root = useRef<HTMLElement>(null);
  const open = useStore((st) => st.open);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const o = { a: 0, c: 0 };
      gsap.to(o, { a: AVG, c: COUNT, duration: 1.6, ease: 'expo.out', onUpdate: () => { setAvg(o.a); setCount(Math.round(o.c)); },
        scrollTrigger: { trigger: '.rv-summary', start: 'top 85%', once: true } });
      gsap.fromTo('.rv-stars', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.rv-summary', start: 'top 85%', once: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget; const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5; const y = (e.clientY - b.top) / b.height - 0.5;
    el.style.setProperty('--px', `${x * -18}px`); el.style.setProperty('--py', `${y * -18}px`);
  };
  const onLeave = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.setProperty('--px', '0px'); e.currentTarget.style.setProperty('--py', '0px'); };

  return (
    <section ref={root} id="reviews" aria-labelledby="rv-h" className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Loved on the belt</p>
        <div className="rv-summary mt-2 flex flex-wrap items-end justify-between gap-6">
          <h2 id="rv-h" className="text-4xl font-semibold tracking-tight text-white md:text-6xl">What guests say</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-5xl text-white">{avg.toFixed(1)}</span>
            <div><Stars value={AVG} /><p className="mt-1 text-sm text-muted">{count.toLocaleString()} reviews</p></div>
          </div>
        </div>
      </div>

      <div className="group relative mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="flex w-max gap-5 animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[...REVIEWS, ...REVIEWS].map((r, i) => (
            <li key={i} aria-hidden={i >= REVIEWS.length} className="w-80 shrink-0 rounded-card border border-line bg-card p-6">
              <div className="text-amber-400" aria-label={`${r.r} stars`}>{'★'.repeat(r.r)}<span className="text-white/15">{'★'.repeat(5 - r.r)}</span></div>
              <p className="mt-3 text-white/90">“{r.t}”</p>
              <p className="mt-4 font-mono text-xs text-muted">— {r.n}</p>
            </li>))}
        </ul>
      </div>

      {/* 13.10: guest gallery — real dish renders (posters of the GLBs) + always-visible captions, not empty gradients */}
      <div className="mx-auto mt-16 max-w-7xl px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">From the guest wall</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">Most-ordered plates this week</h3>
          </div>
          <a href="#menu" className="rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">Browse the menu →</a>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {MENU.slice(0, 8).map((m, i) => (
            <button type="button" key={m.id} onMouseMove={onMove} onMouseLeave={onLeave} onClick={() => open(m.id)} aria-label={`Open ${m.name}`}
              className={`group/g relative aspect-square overflow-hidden rounded-card border border-line text-left ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
              <div className="absolute -inset-6 transition-transform duration-500 ease-out [transform:translate(var(--px,0),var(--py,0))]"
                style={{ background: `radial-gradient(circle at 50% 42%, ${m.accentColor}99, ${m.accentColor}22 45%, #0d0d0d 80%)` }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.poster} alt="" loading="lazy" decoding="async" width={768} height={768}
                className={`absolute left-1/2 top-[42%] w-[78%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,.6)] transition-transform duration-700 ease-out group-hover/g:scale-110 ${i === 0 ? 'md:w-[70%]' : ''}`} />
              <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 font-mono text-[11px] text-white/80 backdrop-blur">#{String(i + 1).padStart(2, '0')} · {ORDERS[i]} orders</span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-10">
                <p className={`font-medium text-white ${i === 0 ? 'text-lg md:text-2xl' : 'text-sm'}`}>{m.name}</p>
                <p className="mt-0.5 flex items-center gap-2 font-mono text-xs text-white/70"><span className="h-2 w-2 rounded-full" style={{ background: TIERS[m.tier].color }} />{formatPrice(m.price)}<span className="text-amber-400">★ {RATING[i]}</span></p>
                {i === 0 && <p className="mt-2 hidden max-w-md text-sm text-white/70 md:block">“{m.chefNote ?? m.description}” — Chef</p>}
              </div>
            </button>))}
        </div>
      </div>
    </section>
  );
}
