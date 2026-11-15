'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MENU } from '@/data/menu';

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

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget; const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5; const y = (e.clientY - b.top) / b.height - 0.5;
    el.style.setProperty('--px', `${x * -18}px`); el.style.setProperty('--py', `${y * -18}px`);
  };
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.setProperty('--px', '0px'); e.currentTarget.style.setProperty('--py', '0px'); };

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

      <div className="mx-auto mt-16 grid max-w-7xl grid-cols-2 gap-3 px-6 md:grid-cols-4">
        {MENU.slice(0, 8).map((m, i) => (
          <div key={m.id} onMouseMove={onMove} onMouseLeave={onLeave}
            className={`group/g relative aspect-square overflow-hidden rounded-card border border-line ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
            <div className="absolute -inset-6 transition-transform duration-500 ease-out [transform:translate(var(--px,0),var(--py,0))]"
              style={{ background: `radial-gradient(circle at 35% 30%, ${m.accentColor}cc, ${m.accentColor}33 45%, #0d0d0d 80%)` }} />
            <div className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover/g:opacity-100 bg-gradient-to-t from-black/70 to-transparent">
              <span className="text-sm font-medium text-white">@spicelane · {m.name}</span>
            </div>
          </div>))}
      </div>
    </section>
  );
}
