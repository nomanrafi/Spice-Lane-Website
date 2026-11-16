'use client';
import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { MENU, getItem } from '@/data/menu';
import { useStore } from '@/store/useStore';
import { BELT, PERIMETER, beltMotion, frontIndex, plateS, stadiumPoint } from '@/lib/belt';
import Plate from './Plate';

/** Flat stadium shape (XY), rotated onto XZ by the mesh. */
function stadiumShape(hl: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-hl, -r); s.lineTo(hl, -r);
  s.absarc(hl, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(-hl, r);
  s.absarc(-hl, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
  return s;
}

/** Zebra slats across the belt lane (review 13.1). They ride on the same offset as the plates, so they move with the food. */
const STRIPES = 112;
function ZebraStripes({ w }: { w: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const step = PERIMETER / STRIPES;
  useFrame(() => {
    const im = ref.current; if (!im) return;
    for (let i = 0; i < STRIPES; i++) {
      const s = i * step + beltMotion.offset;
      const [x, z] = stadiumPoint(s);
      const [x2, z2] = stadiumPoint(s + 0.01);
      tmp.position.set(x, 0.046, z);
      tmp.rotation.set(-Math.PI / 2, 0, -Math.atan2(z2 - z, x2 - x));
      tmp.updateMatrix();
      im.setMatrixAt(i, tmp.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, STRIPES]} receiveShadow raycast={() => null}>
      <planeGeometry args={[step * 0.5, w * 2 - 0.06]} />
      <meshStandardMaterial color="#5a5a5a" roughness={0.55} metalness={0.25} />
    </instancedMesh>
  );
}

function TableBody() {
  const hl = BELT.L / 2, w = BELT.plateR + 0.2;
  const { top, island } = useMemo(() => {
    const outer = stadiumShape(hl, BELT.R + w);
    outer.holes.push(new THREE.Path(stadiumShape(hl, BELT.R - w).getPoints(64).reverse()));
    const ext = { depth: 0.18, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3, curveSegments: 48 };
    return {
      top: new THREE.ExtrudeGeometry(outer, ext),
      island: new THREE.ExtrudeGeometry(stadiumShape(hl, BELT.R - w - 0.08), { ...ext, depth: 0.3 }),
    };
  }, [hl, w]);
  return (
    <group>
      <mesh geometry={top} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#262626" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh geometry={island} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#151515" roughness={0.6} metalness={0.2} />
      </mesh>
      <ZebraStripes w={w} />
    </group>
  );
}

/** Label chip floating just above the hovered plate (review 13.4: label always belongs to the plate under the mouse). */
function HoverChip({ id, groups }: { id: string | null; groups: MutableRefObject<(THREE.Group | null)[]> }) {
  const item = id ? getItem(id) : undefined;
  const anchor = useRef<THREE.Group>(null);
  useFrame(() => {
    const i = MENU.findIndex((m) => m.id === id);
    const g = groups.current[i];
    if (anchor.current && g) anchor.current.position.set(g.position.x, g.position.y + 1.15, g.position.z);
  });
  return (
    <group ref={anchor}>
      <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div aria-live="polite"
          className={`whitespace-nowrap rounded-full border border-white/10 bg-black/75 px-4 py-2 text-sm text-white backdrop-blur transition-opacity duration-200 ${item ? 'opacity-100' : 'opacity-0'}`}>
          {item && (<><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: item.accentColor }} />{item.name}<span className="ml-2 font-mono text-white/60">${item.price.toFixed(2)}</span></>)}
        </div>
      </Html>
    </group>
  );
}

export default function KaitenTable() {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const hoverId = useStore((s) => s.hoverId);
  const paused = useStore((s) => s.paused);
  const setHover = useStore((s) => s.setHover);
  const setFront = useStore((s) => s.setFront);
  const open = useStore((s) => s.open);
  const frontId = useStore((s) => s.frontId);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const m = beltMotion;
    if (m.target !== null) {
      // eased seek to an exact slot
      const d = m.target - m.offset;
      m.velocity = d * 6;
      if (Math.abs(d) < 0.002) { m.offset = m.target; m.target = null; m.velocity = 0; }
    } else if (!m.dragging) {
      const want = hoverId || paused ? 0 : m.autoSpeed;
      m.velocity += (want - m.velocity) * (1 - Math.exp(-dt * (Math.abs(m.velocity) > m.autoSpeed * 1.5 ? 1.2 : 3)));
    }
    if (!m.dragging) m.offset += m.velocity * dt;
    groups.current.forEach((g, i) => {
      if (!g) return;
      const [x, z] = stadiumPoint(plateS(i));
      g.position.set(x, 0.05, z);
    });
    const fid = MENU[frontIndex()]?.id; if (fid) setFront(fid);
  });

  return (
    <group>
      <TableBody />
      <HoverChip id={hoverId} groups={groups} />
      {MENU.slice(0, BELT.count).map((item, i) => (
        <Plate key={item.id} ref={(g) => { groups.current[i] = g; }} item={item}
          active={hoverId === item.id || (!hoverId && frontId === item.id && paused)}
          onOver={() => { setHover(item.id); document.body.style.cursor = 'pointer'; }}
          onOut={() => { if (useStore.getState().hoverId === item.id) { setHover(null); document.body.style.cursor = ''; } }}
          onClick={() => open(item.id)} />
      ))}
    </group>
  );
}
