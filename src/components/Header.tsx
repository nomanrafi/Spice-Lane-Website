'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, cartCount } from '@/store/useStore';

const NAV = [['Menu', 'menu'], ['How it works', 'how'], ['Specials', 'specials'], ['Reservations', 'reserve'], ['Locations', 'locations']];

export default function Header() {
  const cart = useStore((s) => s.cart);
  const tick = useStore((s) => s.addedTick);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [showAdded, setShowAdded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const first = useRef(true);
  const count = mounted ? cartCount(cart) : 0;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener('scroll', on, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    NAV.forEach(([, id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => { window.removeEventListener('scroll', on); io.disconnect(); };
  }, []);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setShowAdded(true);
    const t = setTimeout(() => setShowAdded(false), 1200);
    return () => clearTimeout(t);
  }, [tick]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-expo ${scrolled ? 'border-b border-line bg-black/50 backdrop-blur-xl' : ''}`}>
      <div className="mx-auto flex h-16 md:h-20 max-w-[1400px] items-center justify-between px-5 md:px-10">
        <a href="#top" className="text-[22px] md:text-[26px] font-semibold leading-none tracking-tight">Spice<span className="text-muted"> Lane</span></a>
        <nav className="hidden items-center gap-8 text-base font-medium text-muted md:flex">{/* S95: user — nav buttons bigger (was gap-7 text-sm py-1) */}
          {NAV.map(([label, id]) => (
            <a key={id} href={`#${id}`} className={`relative px-1 py-2 transition-colors hover:text-white ${active === id ? 'text-white' : ''}`}>
              {label}
              {active === id && <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-px bg-white" />}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {showAdded && (
              <motion.span initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black">Added</motion.span>
            )}
          </AnimatePresence>
          <motion.button id="cart-pill" data-cart-dropzone key={tick} onClick={() => setCartOpen(true)}
            animate={tick ? { scale: [1, 1.12, 0.96, 1] } : undefined} transition={{ duration: 0.45 }}
            aria-label={`Open cart, ${count} items`} className="pill-glass !px-4 !py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
            <span className="relative inline-block h-5 w-4 overflow-hidden text-center font-mono text-sm tabular-nums">
              <AnimatePresence initial={false}>
                <motion.span key={count} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.3 }} className="absolute inset-0">{count}</motion.span>
              </AnimatePresence>
            </span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
