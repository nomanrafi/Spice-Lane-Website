'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { getItem, TIERS } from '@/data/menu';
import { useStore } from '@/store/useStore';
import { cartCenter, cartDistance, MAGNET_RADIUS } from '@/lib/dropzone';

/** DOM overlay: the plate "ghost" that follows the pointer while dragging a plate to the cart, plus the drop burst. */
export default function DragGhost() {
  const ghost = useStore((s) => s.ghost);
  const burst = useStore((s) => s.burst);
  const setBurst = useStore((s) => s.setBurst);
  useEffect(() => { if (!burst) return; const t = setTimeout(() => setBurst(null), 800); return () => clearTimeout(t); }, [burst, setBurst]);

  const item = ghost ? getItem(ghost.id) : undefined;
  let x = ghost?.x ?? 0, y = ghost?.y ?? 0, near = false;
  if (ghost) {
    const d = cartDistance(ghost.x, ghost.y); const c = cartCenter();
    if (c && d < MAGNET_RADIUS) { near = true; const k = 1 - d / MAGNET_RADIUS; x += (c.x - x) * k * 0.6; y += (c.y - y) * k * 0.6; }
  }
  const ring = item ? (TIERS as Record<string, { color: string }>)[item.tier]?.color ?? '#fff' : '#fff';

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      <AnimatePresence>
        {ghost && item && (
          <motion.div key="ghost" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: near ? 0.7 : 1, opacity: 1 }} exit={{ scale: 0.2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{ left: x - 44, top: y - 44 }} className="absolute h-[88px] w-[88px]">
            <div className="h-full w-full rounded-full shadow-2xl" style={{ background: `radial-gradient(circle at 50% 45%, ${item.accentColor} 0 34%, ${item.plateColor} 36% 62%, ${ring} 64% 72%, ${item.plateColor} 74%)` }} />
            <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-xs text-white">
              {near ? 'Release to add' : item.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {burst && Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <motion.span key={burst.t + '-' + i} initial={{ x: burst.x, y: burst.y, scale: 1, opacity: 1 }}
          animate={{ x: burst.x + Math.cos(a) * 46, y: burst.y + Math.sin(a) * 46, scale: 0, opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -ml-1 -mt-1 h-2 w-2 rounded-full" style={{ background: burst.color }} />;
      })}
    </div>
  );
}
