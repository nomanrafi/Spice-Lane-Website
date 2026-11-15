'use client';
import { Component, ReactNode, Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/** Neutral placeholder shown while loading or if a GLB is missing. Never crashes the belt. */
export function PlaceholderFood({ color = '#555' }: { color?: string }) {
  return (
    <mesh position={[0, 0.12, 0]} castShadow>
      <sphereGeometry args={[0.22, 24, 16]} />
      <meshStandardMaterial color={color} roughness={0.6} transparent opacity={0.5} />
    </mesh>
  );
}

class ModelBoundary extends Component<{ children: ReactNode; fallback: ReactNode; src: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) {
    if (process.env.NODE_ENV !== 'production') console.warn(`[FoodModel] failed to load ${this.props.src}`, e);
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Model({ src, size }: { src: string; size: number }) {
  const { scene } = useGLTF(src, true, true, (loader) => loader.setMeshoptDecoder(MeshoptDecoder));
  // Clone + normalise: fit the model's largest horizontal extent to `size`, centre it, sit it on y=0.
  const obj = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const s = box.getSize(new THREE.Vector3());
    const k = size / Math.max(s.x, s.z, s.y * 0.8, 1e-4);
    c.scale.setScalar(k);
    const b2 = new THREE.Box3().setFromObject(c);
    const ctr = b2.getCenter(new THREE.Vector3());
    c.position.set(-ctr.x, -b2.min.y, -ctr.z);
    c.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const g = new THREE.Group(); g.add(c); return g;
  }, [scene, size]);
  return <primitive object={obj} />;
}

export default function FoodModel({ src, size = 0.8, color }: { src: string; size?: number; color?: string }) {
  const fb = <PlaceholderFood color={color} />;
  return (
    <ModelBoundary fallback={fb} src={src}>
      <Suspense fallback={fb}><Model src={src} size={size} /></Suspense>
    </ModelBoundary>
  );
}
