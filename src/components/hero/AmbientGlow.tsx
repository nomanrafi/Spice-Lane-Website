'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { getItem } from '@/data/menu';
import { useStore } from '@/store/useStore';

/**
 * Large blurred stadium-shaped glow behind the hero table, tinted with the front item's accentColor.
 * CSS layer (cheaper than a shader plane). Colour tweens ~600ms via GSAP; breathing pulse via CSS keyframes.
 */
export default function AmbientGlow({ itemId }: { itemId?: string }) {
  const frontId = useStore((s) => s.frontId);
  const ref = useRef<HTMLDivElement>(null);
  const color = getItem(itemId ?? frontId)?.accentColor ?? '#444444';
  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, { '--glow': color, duration: 0.6, ease: 'power2.out', overwrite: true });
  }, [color]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div ref={ref} className="glow-breathe absolute left-1/2 top-[55%] h-[46vh] w-[75vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%/50%] opacity-50"
        style={{ ['--glow' as string]: color, background: 'radial-gradient(closest-side, var(--glow), transparent)', filter: 'blur(120px)' }} />
      {/* vignette keeps the edges near-black */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 55%, transparent 40%, #0a0a0a 100%)' }} />
    </div>
  );
}
