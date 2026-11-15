'use client';
import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { beltMotion } from '@/lib/belt';

/** Step 9.3: Lenis smooth scroll synced with GSAP ScrollTrigger; everything respects prefers-reduced-motion. */
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const AUTO = 0.35;
    const applyBelt = () => { beltMotion.autoSpeed = mq.matches ? 0 : AUTO; };
    applyBelt();
    mq.addEventListener('change', applyBelt);
    if (mq.matches) return () => mq.removeEventListener('change', applyBelt);

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.1, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { mq.removeEventListener('change', applyBelt); gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
