'use client';
import { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MenuItem } from '@/data/menu';
import { TIERS } from '@/data/menu';
import { BELT } from '@/lib/belt';
import FoodModel from './FoodModel';

type Props = { item: MenuItem; active: boolean; onOver: () => void; onOut: () => void; onClick: () => void };

/** One plate on the belt: plate body + glowing tier ring + normalised GLB food. Position is set by KaitenTable. */
const Plate = forwardRef<THREE.Group, Props>(function Plate({ item, active, onOver, onOut, onClick }, ref) {
  const lift = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const r = BELT.plateR;
  useFrame((_, dt) => {
    const g = lift.current; if (!g) return;
    const k = 1 - Math.exp(-dt * 10);
    g.position.y += ((active ? 0.12 : 0) - g.position.y) * k;
    const sc = g.scale.x + ((active ? 1.08 : 1) - g.scale.x) * k; g.scale.setScalar(sc);
    if (ring.current) ring.current.opacity += ((active ? 1 : 0.55) - ring.current.opacity) * k;
  });
  return (
    <group ref={ref}>
      <group ref={lift}
        onPointerOver={(e) => { e.stopPropagation(); onOver(); }}
        onPointerOut={(e) => { e.stopPropagation(); onOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}>
        {/* plate body */}
        <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
          <cylinderGeometry args={[r, r * 0.72, 0.06, 48]} />
          <meshStandardMaterial color={item.plateColor} roughness={0.35} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[r * 0.8, 48]} />
          <meshStandardMaterial color={item.plateColor} roughness={0.5} />
        </mesh>
        {/* tier ring just outside the rim */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r * 1.04, r * 1.1, 64]} />
          <meshBasicMaterial ref={ring} color={TIERS[item.tier].color} transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <group position={[0, 0.065, 0]}>
          <FoodModel src={item.model} size={r * 1.45} color={item.accentColor} />
        </group>
      </group>
    </group>
  );
});
export default Plate;
