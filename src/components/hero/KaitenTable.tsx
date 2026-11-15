'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MENU } from '@/data/menu';
import { useStore } from '@/store/useStore';
import { BELT, beltMotion, frontIndex, plateS, stadiumPoint } from '@/lib/belt';
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
  // radial slat seams along the track
  const seams = useMemo(() => {
    const n = 64, pts: [number, number, number][] = [];
    const P = 2 * BELT.L + 2 * Math.PI * BELT.R;
    for (let i = 0; i < n; i++) { const [x, z] = stadiumPoint((i / n) * P); pts.push([x, 0.005, z]); }
    return pts;
  }, []);
  return (
    <group>
      <mesh geometry={top} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#2b2b2b" roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh geometry={island} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#151515" roughness={0.6} metalness={0.2} />
      </mesh>
      {seams.map((p, i) => (
        <mesh key={i} position={p} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[BELT.plateR + 0.12, BELT.plateR + 0.135, 24, 1, 0, Math.PI]} />
          <meshBasicMaterial color="#3a3a3a" transparent opacity={0.35} />
        </mesh>
      ))}
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
      g.position.set(x, 0.2, z);
    });
    const fid = MENU[frontIndex()]?.id; if (fid) setFront(fid);
  });

  return (
    <group>
      <TableBody />
      {MENU.slice(0, BELT.count).map((item, i) => (
        <Plate key={item.id} ref={(g) => { groups.current[i] = g; }} item={item}
          active={hoverId === item.id || (!hoverId && frontId === item.id && paused)}
          onOver={() => { setHover(item.id); document.body.style.cursor = 'pointer'; }}
          onOut={() => { setHover(null); document.body.style.cursor = ''; }}
          onClick={() => open(item.id)} />
      ))}
    </group>
  );
}
