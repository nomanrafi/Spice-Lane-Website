'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import type { Group } from 'three';
import { getItem } from '@/data/menu';
import FoodModel from '@/components/hero/FoodModel';
import CanvasBoundary from '@/components/three/CanvasBoundary';

/** Slot positions on the platter (max 6), arranged in a ring. */
export const SLOTS = Array.from({ length: 6 }, (_, k) => {
  const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(a) * 1.05, Math.sin(a) * 0.7] as const;
});

/** One dish dropping onto its slot with a little spring. */
function Dish({ id, slot }: { id: string; slot: number }) {
  const g = useRef<Group>(null);
  const t = useRef(0);
  const it = getItem(id);
  useFrame((_, dt) => {
    if (!g.current) return;
    t.current = Math.min(t.current + dt * 2.2, 1);
    const e = 1 - Math.pow(1 - t.current, 3);
    g.current.position.y = 0.14 + (1 - e) * 1.2;
    g.current.scale.setScalar(0.4 + 0.6 * e);
  });
  if (!it) return null;
  const [x, z] = SLOTS[slot];
  return <group ref={g} position={[x, 0.14, z]}><FoodModel src={it.model} size={0.7} color={it.accentColor} /></group>;
}

/** Big wooden platter (elliptical, scaled cylinder) with dishes in slots. */
export default function PlatterCanvas({ ids }: { ids: string[] }) {
  return (
    <CanvasBoundary>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 2.6, 3.4], fov: 35 }} shadows>
        <ambientLight intensity={0.35} />
        <directionalLight position={[2, 5, 3]} intensity={1.6} castShadow />
        <Environment resolution={128} environmentIntensity={0.4}>
          <Lightformer form="rect" intensity={3} position={[0, 4, -2]} scale={[8, 3, 1]} />
        </Environment>
        <group scale={[1, 1, 0.7]}>
          <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.75, 1.6, 0.1, 96]} />
            <meshStandardMaterial color="#8a5a34" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.101, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.55, 1.62, 96]} />
            <meshStandardMaterial color="#5e3b20" roughness={0.9} />
          </mesh>
        </group>
        {ids.map((id, k) => <Dish key={`${id}-${k}`} id={id} slot={k} />)}
        <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={6} blur={2.4} far={1.5} />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} minPolarAngle={0.5} maxPolarAngle={1.2} />
      </Canvas>
    </CanvasBoundary>
  );
}
