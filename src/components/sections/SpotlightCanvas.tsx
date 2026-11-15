'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { useRef, type MutableRefObject } from 'react';
import type { Group } from 'three';
import { TIERS, type MenuItem } from '@/data/menu';
import FoodModel from '@/components/hero/FoodModel';
import CanvasBoundary from '@/components/three/CanvasBoundary';

/** Spotlight 3D: model rises + rotates 180° as scroll progress (0..1) grows. Crossfades by scale on item change. */
function Rig({ item, progress }: { item: MenuItem; progress: MutableRefObject<number> }) {
  const g = useRef<Group>(null);
  const born = useRef(0);
  useFrame((st, dt) => {
    if (!g.current) return;
    const p = Math.min(progress.current / 0.35, 1);
    born.current = Math.min(born.current + dt * 2.5, 1);
    const e = 1 - Math.pow(1 - born.current, 3);
    g.current.position.y = -0.35 + p * 0.35;
    g.current.rotation.y = p * Math.PI + st.clock.elapsedTime * 0.15;
    g.current.scale.setScalar(0.6 + 0.4 * e);
  });
  return (
    <group ref={g}>
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.58, 0.06, 64]} />
        <meshStandardMaterial color={item.plateColor} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.83, 0.88, 64]} />
        <meshBasicMaterial color={TIERS[item.tier].color} toneMapped={false} />
      </mesh>
      <group position={[0, 0.065, 0]}><FoodModel src={item.model} size={1.15} color={item.accentColor} /></group>
    </group>
  );
}

export default function SpotlightCanvas({ item, progress }: { item: MenuItem; progress: MutableRefObject<number> }) {
  return (
    <CanvasBoundary>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 1.5, 2.8], fov: 35 }} shadows onCreated={({ camera }) => camera.lookAt(0, 0.2, 0)}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[2, 4, 3]} intensity={1.6} castShadow />
        <directionalLight position={[-3, 2, -3]} intensity={0.6} color={item.accentColor} />
        <Environment resolution={128} environmentIntensity={0.4}>
          <Lightformer form="rect" intensity={3} position={[0, 4, -2]} scale={[8, 3, 1]} />
        </Environment>
        <Rig key={item.id} item={item} progress={progress} />
        <ContactShadows position={[0, -0.36, 0]} opacity={0.5} scale={4} blur={2.4} far={1.5} />
      </Canvas>
    </CanvasBoundary>
  );
}
