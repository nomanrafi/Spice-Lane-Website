'use client';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import type { OrbitControls as OC } from 'three-stdlib';
import { TIERS, type MenuItem } from '@/data/menu';
import FoodModel from '@/components/hero/FoodModel';
import CanvasBoundary from './CanvasBoundary';

/** Small standalone viewer: item GLB on its plate with tier ring. Drag = orbit 360°, wheel/pinch = clamped zoom, dbl-click = reset. */
export default function ModelViewer({ item, autoRotate = true }: { item: MenuItem; autoRotate?: boolean }) {
  const ctl = useRef<OC>(null);
  return (
    <CanvasBoundary>
      <div className="h-full w-full" onDoubleClick={() => ctl.current?.reset()}>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 1.6, 2.6], fov: 35 }} shadows>
          <ambientLight intensity={0.3} />
          <directionalLight position={[2, 4, 3]} intensity={1.6} castShadow />
          <directionalLight position={[-3, 2, -3]} intensity={0.6} color="#bcd" />
          <Environment resolution={128} environmentIntensity={0.4}>
            <Lightformer form="rect" intensity={3} position={[0, 4, -2]} scale={[8, 3, 1]} />
            <Lightformer form="rect" intensity={1.5} position={[-4, 2, 1]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} />
          </Environment>
          <group key={item.id}>
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
          <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={4} blur={2.4} far={1.5} />
          <OrbitControls ref={ctl as never} makeDefault enablePan={false} autoRotate={autoRotate} autoRotateSpeed={1.2}
            minDistance={1.6} maxDistance={4.5} target={[0, 0.25, 0]} />
        </Canvas>
      </div>
    </CanvasBoundary>
  );
}
