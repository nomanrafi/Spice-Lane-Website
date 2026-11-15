'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SOCIAL = [{ n: 'Instagram', h: 'https://instagram.com' }, { n: 'Facebook', h: 'https://facebook.com' }, { n: 'TikTok', h: 'https://tiktok.com' }];
const LEGAL = [{ n: 'Privacy', h: '#' }, { n: 'Terms', h: '#' }, { n: 'Allergens', h: '#faq' }];

/** 8.10 Newsletter (animated success) + footer with scroll-revealed wordmark. */
export default function Footer() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'err' | 'ok'>('idle');
  const word = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !word.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.ft-letter', { yPercent: 110 }, { yPercent: 0, stagger: 0.04, ease: 'expo.out', duration: 1.2, scrollTrigger: { trigger: word.current, start: 'top 95%' } });
    }, word);
    return () => ctx.revert();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setState(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'ok' : 'err');
  };

  return (
    <footer className="relative overflow-hidden border-t border-line pt-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">New plates, first.</h2>
            <p className="mt-3 max-w-md text-muted">Weekly specials and secret-menu drops. No spam, unsubscribe anytime.</p>
          </div>
          <div className="relative min-h-[4rem]">
            <AnimatePresence mode="wait">
              {state === 'ok' ? (
                <motion.p key="ok" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-lg text-white">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400 text-black">✓</motion.span>
                  You’re on the list. See you at the belt.
                </motion.p>
              ) : (
                <motion.form key="f" onSubmit={submit} noValidate exit={{ opacity: 0, y: -12 }} className="flex flex-col gap-2">
                  <div className="flex gap-2 rounded-full border border-line bg-card p-1.5">
                    <label htmlFor="nl-email" className="sr-only">Email</label>
                    <input id="nl-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setState('idle'); }}
                      placeholder="you@email.com" className="min-w-0 flex-1 bg-transparent px-4 text-white outline-none placeholder:text-white/30" aria-invalid={state === 'err'} />
                    <button type="submit" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black">Subscribe</button>
                  </div>
                  {state === 'err' && <p className="pl-4 text-sm text-red-400">Enter a valid email.</p>}
                </motion.form>)}
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 text-sm text-muted">
          <ul className="flex gap-5">{SOCIAL.map((s) => <li key={s.n}><a href={s.h} target="_blank" rel="noopener noreferrer" className="hover:text-white">{s.n}</a></li>)}</ul>
          <ul className="flex gap-5">{LEGAL.map((s) => <li key={s.n}><a href={s.h} className="hover:text-white">{s.n}</a></li>)}</ul>
          <p className="font-mono">© {new Date().getFullYear()} Spice Lane</p>
        </div>
      </div>
      <h2 ref={word} aria-label="Spice Lane" className="mt-10 flex select-none justify-center overflow-hidden whitespace-nowrap text-[17vw] font-semibold leading-[0.85] tracking-tighter text-white/90">
        {'SPICE LANE'.split('').map((c, i) => <span key={i} aria-hidden className="ft-letter inline-block">{c === ' ' ? '\u00A0' : c}</span>)}
      </h2>
    </footer>
  );
}
