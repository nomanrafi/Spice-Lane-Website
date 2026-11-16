'use client';
import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MENU } from '@/data/menu';
import { useStore } from '@/store/useStore';
import { BELT, PERIMETER, bandPoint, beltMotion, beltPoint, beltTheta, frontIndex, outline, plateS } from '@/lib/belt';
import Plate from './Plate';

/**
 * S42 (14.1/14.2/14.3): table = ONE big smooth oval like the user's blue marking (radial superellipse band from
 * src/lib/belt.ts: outer = curve(A+H, B+H), island hole = curve(A−H, B−H)). Plates fill most of the band width,
 * so the middle island is small, like the reference kaiten table.
 */
const SEAMS = 28; // S71: reference slat pitch ≈ PERIMETER/28 // S68: 2 seams per plate slot (reference: thin crescent seam + glint, NO stripe/tone bands)
const ACROSS = 24; // points across the band → smooth curve, not a straight line

/** Thin ribbon strips (one per seam) refilled every frame. */
function useStrips(n: number, cols: number) {
  return useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * (cols + 1) * 2 * 3), 3));
    const idx: number[] = [];
    for (let p = 0; p < n; p++) for (let c = 0; c < cols; c++) {
      const a = p * (cols + 1) * 2 + c, b = a + cols + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    g.setIndex(idx); return g;
  }, [n, cols]);
}

/**
 * S68 zebra = reference slatPath: each seam is ONE thin dark curved line across the belt (quadratic crescent:
 * middle of the band leads, edges trail) plus a faint white glint just behind it. They travel with the plates
 * and bend round the curves. No alternating light/dark blocks (that looked linear/striped).
 */
function Zebra() {
  const pitch = PERIMETER / SEAMS;
  const bulge = pitch * 0.22;
  const seams = useStrips(SEAMS, ACROSS);
  const glints = useStrips(SEAMS, ACROSS);
  useFrame(() => {
    const off = beltMotion.offset + pitch / 2;
    const at = (s: number, u: number) => bandPoint(beltTheta(s + bulge * (1 - u * u)), u * 0.92);
    const fill = (geo: THREE.BufferGeometry, shift: number, w: number, y: number) => {
      const lp = geo.attributes.position as THREE.BufferAttribute; let k = 0;
      for (let j = 0; j < SEAMS; j++) {
        const s0 = off + j * pitch + shift;
        for (let r = 0; r <= 1; r++) for (let c = 0; c <= ACROSS; c++) {
          const u = (c / ACROSS) * 2 - 1;
          const [x, z] = at(s0 + (r ? w : -w), u);
          lp.setXYZ(k++, x, y, z);
        }
      }
      lp.needsUpdate = true;
    };
    fill(seams, 0, 0.022, 0.056);
    fill(glints, -0.07, 0.012, 0.057);
  });
  return (
    <group raycast={() => null}>
      <mesh geometry={seams} frustumCulled={false} raycast={() => null}>
        <meshBasicMaterial color="#000000" transparent opacity={0.6} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={glints} frustumCulled={false} raycast={() => null}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

const loop = (a: number, b: number) => outline(a, b, 240).map(([x, z]) => new THREE.Vector2(x, z));

function TableBody() {
  const { top, island, rim, innerRim } = useMemo(() => {
    const { A, B, H } = BELT;
    const outer = new THREE.Shape(loop(A + H, B + H));
    outer.holes.push(new THREE.Path(loop(A - H, B - H)));
    const ext = { depth: 0.22, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 8 };
    const rimShape = new THREE.Shape(loop(A + H + 0.05, B + H + 0.05));
    rimShape.holes.push(new THREE.Path(loop(A + H - 0.03, B + H - 0.03)));
    const inRim = new THREE.Shape(loop(A - H + 0.03, B - H + 0.03));
    inRim.holes.push(new THREE.Path(loop(A - H - 0.04, B - H - 0.04)));
    return {
      top: new THREE.ExtrudeGeometry(outer, ext),
      island: new THREE.ExtrudeGeometry(new THREE.Shape(loop(A - H - 0.06, B - H - 0.06)), { ...ext, depth: 0.3, bevelSize: 0.08, bevelThickness: 0.08 }),
      rim: new THREE.ShapeGeometry(rimShape),
      innerRim: new THREE.ShapeGeometry(inRim),
    };
  }, []);
  return (
    <group>
      <mesh geometry={top} rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.15} />
      </mesh>
      {/* thin light rail along the outer edge (reference: white rim highlight) */}
      <mesh geometry={rim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.052, 0]} raycast={() => null}>
        <meshBasicMaterial color="#b0b0b0" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={innerRim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.053, 0]} raycast={() => null}>
        <meshBasicMaterial color="#9a9a9a" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={island} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.17, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#151515" roughness={0.55} metalness={0.2} />
      </mesh>
      <Zebra />
    </group>
  );
}

/**
 * S49 (14.4 final): hover name = ONE plain DOM element (#hover-chip, rendered once in Hero.tsx).
 * drei <Html> was dropped because it can mount twice (StrictMode / remounts) → user saw TWO names.
 * Here we only project the hovered plate to screen space and move that single element.
 */
function HoverChip({ id, groups }: { id: string | null; groups: MutableRefObject<(THREE.Group | null)[]> }) {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const el = document.getElementById('hover-chip'); if (!el) return;
    const i = MENU.findIndex((m) => m.id === id);
    const g = groups.current[i];
    if (!g) { el.style.opacity = '0'; return; }
    v.set(g.position.x, g.position.y + 0.9, g.position.z).project(camera);
    el.style.transform = `translate3d(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px, 0) translate(-50%, -100%)`;
    el.style.opacity = '1';
  });
  return null;
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
      const [x, z] = beltPoint(plateS(i));
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
