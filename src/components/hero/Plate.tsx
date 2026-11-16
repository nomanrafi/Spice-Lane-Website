'use client';
import { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MenuItem } from '@/data/menu';
import { TIERS } from '@/data/menu';
import { BELT } from '@/lib/belt';
import FoodModel from './FoodModel';

type Props = { item: MenuItem; active: boolean; onOver: () => void; onOut: () => void; onClick: () => void };

const noRay = () => null;

/**
 * One plate on the belt. The GLB already contains a round plate, so NO extra plate mesh is drawn (review 13.3):
 * the model is fitted to diameter 2·plateR and the glowing tier ring hugs that circle.
 * Pointer events go to one invisible hit disc per plate (stable hover, review 13.4).
 */
const Plate = forwardRef<THREE.Group, Props>(function Plate({ item, active, onOver, onOut, onClick }, ref) {
  const lift = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const r = BELT.plateR;
  useFrame((_, dt) => {
    const g = lift.current; if (!g) return;
    const k = 1 - Math.exp(-dt * 10);
    g.position.y += ((active ? 0.12 : 0) - g.position.y) * k;
    const sc = g.scale.x + ((active ? 1.08 : 1) - g.scale.x) * k; g.scale.setScalar(sc);
    if (ring.current) ring.current.opacity += ((active ? 1 : 0.6) - ring.current.opacity) * k;
  });
  return (
    <group ref={ref}>
      {/* invisible hit area (cylinder covering plate + food) */}
      <mesh position={[0, 0.12, 0]}
        onPointerOver={(e) => { e.stopPropagation(); onOver(); }}
        onPointerOut={(e) => { e.stopPropagation(); onOut(); }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <cylinderGeometry args={[r * 0.9, r * 0.9, 0.24, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      <group ref={lift}>
        {/* tier ring fitted to the GLB plate rim */}
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRay}>
          <ringGeometry args={[r * 0.98, r * 1.07, 72]} />
          <meshBasicMaterial ref={ring} color={TIERS[item.tier].color} transparent opacity={0.6} toneMapped={false} />
        </mesh>
        <group raycast={noRay}>
          <FoodModel src={item.model} size={r * 2} color={item.accentColor} noRaycast />
        </group>
      </group>
    </group>
  );
});
export default Plate;
