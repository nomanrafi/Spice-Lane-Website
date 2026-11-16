'use client';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import { useRef } from 'react';
import { beltMotion } from '@/lib/belt';
import { useStore } from '@/store/useStore';
import { getItem } from '@/data/menu';
import { cartCenter, cartDistance, MAGNET_RADIUS } from '@/lib/dropzone';
import KaitenTable from './KaitenTable';

/** R3F canvas for the hero belt. Drag/flick anywhere on it spins the belt with inertia. */
export default function HeroCanvas() {
  const mode = useRef<'none' | 'spin' | 'ghost'>('none');
  const dragId = useRef<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  // review 13.5: on the far (back) lane the plates move the opposite screen direction, so invert the drag there.
  const side = useRef<1 | -1>(1);
  // Drag left/right = spin belt (inertia). Drag UP starting on a plate = carry it to the cart (Step 6).
  const bind = useDrag(({ first, last, delta: [dx], movement: [mx, my], velocity: [vx], direction: [dirx], xy: [px, py] }) => {
    const st = useStore.getState();
    if (first) {
      mode.current = 'none'; dragId.current = st.hoverId; beltMotion.target = null;
      const r = wrap.current?.getBoundingClientRect();
      // table centre projects a little above the canvas middle (camera looks at z=0.3)
      side.current = r && py - r.top < r.height * 0.47 ? -1 : 1;
    }
    if (mode.current === 'none' && Math.hypot(mx, my) > 12) {
      mode.current = dragId.current && my < 0 && Math.abs(my) > Math.abs(mx) ? 'ghost' : 'spin';
      if (mode.current === 'spin') beltMotion.dragging = true;
    }
    if (mode.current === 'spin') {
      beltMotion.offset -= side.current * dx * 0.012;         // drag left → plates move left (front lane runs right → left)
      if (last) { beltMotion.dragging = false; beltMotion.velocity = -side.current * dirx * vx * 6; }
    } else if (mode.current === 'ghost' && dragId.current) {
      if (!last) st.setGhost({ id: dragId.current, x: px, y: py });
      else {
        const c = cartCenter();
        if (c && cartDistance(px, py) < MAGNET_RADIUS) {
          st.add(dragId.current, 1);
          st.setBurst({ x: c.x, y: c.y, color: getItem(dragId.current)?.accentColor ?? '#fff', t: Date.now() });
        }
        st.setGhost(null);
      }
    }
    if (last) { mode.current = 'none'; dragId.current = null; }
  }, { filterTaps: true, pointer: { touch: true } });

  return (
    <div ref={wrap} {...bind()} className="h-full w-full touch-pan-y" aria-hidden>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 9.4, 8.4], fov: 33 }} gl={{ antialias: true }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0.3)}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 6, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 3, -5]} intensity={0.6} color="#bcd" />
        {/* local studio env (no CDN HDRI fetch) */}
        <Environment resolution={256} environmentIntensity={0.35}>
          <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 3, 1]} />
          <Lightformer form="rect" intensity={1.5} position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
          <Lightformer form="rect" intensity={1.5} position={[5, 2, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        </Environment>
        <KaitenTable />
        <ContactShadows position={[0, -0.25, 0]} opacity={0.6} scale={12} blur={2.6} far={2} />
      </Canvas>
    </div>
  );
}
