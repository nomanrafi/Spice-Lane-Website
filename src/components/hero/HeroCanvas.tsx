'use client';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import { beltMotion } from '@/lib/belt';
import KaitenTable from './KaitenTable';

/** R3F canvas for the hero belt. Drag/flick anywhere on it spins the belt with inertia. */
export default function HeroCanvas() {
  const bind = useDrag(({ first, last, delta: [dx], velocity: [vx], direction: [dirx] }) => {
    if (first) { beltMotion.dragging = true; beltMotion.target = null; }
    beltMotion.offset -= dx * 0.012;           // drag left → plates move left (front lane runs right → left)
    if (last) { beltMotion.dragging = false; beltMotion.velocity = -dirx * vx * 6; }
  }, { filterTaps: true, pointer: { touch: true } });

  return (
    <div {...bind()} className="h-full w-full touch-pan-y" aria-hidden>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 5.2, 6.2], fov: 34 }} gl={{ antialias: true }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0.3)}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 6, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 3, -5]} intensity={0.6} color="#bcd" />
        <Environment preset="studio" environmentIntensity={0.35} />
        <KaitenTable />
        <ContactShadows position={[0, -0.25, 0]} opacity={0.6} scale={12} blur={2.6} far={2} />
      </Canvas>
    </div>
  );
}
