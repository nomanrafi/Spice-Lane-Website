'use client';
import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { MENU, getItem } from '@/data/menu';
import { useStore } from '@/store/useStore';
import { BELT, PERIMETER, beltFrame, beltMotion, beltPoint, frontIndex, plateS } from '@/lib/belt';
import Plate from './Plate';

/**
 * S36 (14.1/14.2/14.3): table follows the user's blue marking — one smooth organic oval (superellipse centre-line,
 * NO straight sides). The band is the exact offset curve ±H of the plate path, so plates always sit centred on it,
 * and the island in the middle is small (bigger plates, smaller gap).
 */
const SAMPLES = 240;
function offsetLoop(d: number): THREE.Vector2[] {
  return Array.from({ length: SAMPLES }, (_, i) => {
    const s = (i / SAMPLES) * PERIMETER;
    const [x, z] = beltPoint(s); const f = beltFrame(s);
    return new THREE.Vector2(x + f.nx * d, z + f.nz * d);
  });
}

/**
 * Zebra = crescent slat seams like the reference (prompt-code slatPath): a seam every ≈0.34·plate Ø, each one a
 * curved groove from inner to outer edge bulging in the travel direction, plus a faint white glint just behind it.
 * Rebuilt every frame from beltMotion.offset, so they travel with the plates and bend round the curves.
 */
// S39: user — fewer, curvier lines. Zebra = 10 light/dark slat PAIRS (pitch ≈ plate Ø), crescent-curved edges.
const SEAMS = 10;
const SEG = 10;
function Seams({ shift, width, color, opacity, y, bulgeK = 0.22 }: { shift: number; width: number; color: string; opacity: number; y: number; bulgeK?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SEAMS * (SEG + 1) * 2 * 3), 3));
    const idx: number[] = [];
    for (let j = 0; j < SEAMS; j++) for (let k = 0; k < SEG; k++) {
      const a = (j * (SEG + 1) + k) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    g.setIndex(idx); return g;
  }, []);
  useFrame(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const pitch = PERIMETER / SEAMS, half = BELT.H * 0.97, bulge = pitch * bulgeK;
    for (let j = 0; j < SEAMS; j++) {
      const s0 = beltMotion.offset + shift + j * pitch + pitch / 2;
      for (let k = 0; k <= SEG; k++) {
        const t = k / SEG, u = (t * 2 - 1);            // −1 inner … +1 outer
        const along = bulge * (1 - u * u);             // crescent: centre of the seam leads, ends trail
        const s = s0 + along; const [x, z] = beltPoint(s); const f = beltFrame(s);
        const px = x + f.nx * u * half, pz = z + f.nz * u * half;
        const o = (j * (SEG + 1) + k) * 2;
        pos.setXYZ(o, px - f.tx * width, y, pz - f.tz * width);
        pos.setXYZ(o + 1, px + f.tx * width, y, pz + f.tz * width);
      }
    }
    pos.needsUpdate = true;
  });
  return (
    <mesh geometry={geo} raycast={() => null} frustumCulled={false}>
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function TableBody() {
  const { top, island, rim } = useMemo(() => {
    const outer = new THREE.Shape(offsetLoop(BELT.H));
    outer.holes.push(new THREE.Path(offsetLoop(-BELT.H)));
    const ext = { depth: 0.22, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 8 };
    const rimShape = new THREE.Shape(offsetLoop(BELT.H + 0.06));
    rimShape.holes.push(new THREE.Path(offsetLoop(BELT.H - 0.02)));
    return {
      top: new THREE.ExtrudeGeometry(outer, ext),
      island: new THREE.ExtrudeGeometry(new THREE.Shape(offsetLoop(-BELT.H - 0.1)), { ...ext, depth: 0.3 }),
      rim: new THREE.ShapeGeometry(rimShape),
    };
  }, []);
  return (
    <group>
      <mesh geometry={top} rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#2a2a2a" roughness={0.45} metalness={0.3} />
      </mesh>
      {/* thin light rail along the outer edge (reference: white rim highlight) */}
      <mesh geometry={rim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.052, 0]} raycast={() => null}>
        <meshBasicMaterial color="#9a9a9a" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={island} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.14, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#141414" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* light slat (half of each pitch) → zebra; then dark grooves on both slat edges + faint glint */}
      <Seams shift={0} width={PERIMETER / SEAMS / 4} color="#ffffff" opacity={0.07} y={0.053} />
      <Seams shift={-PERIMETER / SEAMS / 4} width={0.022} color="#000000" opacity={0.55} y={0.054} />
      <Seams shift={PERIMETER / SEAMS / 4} width={0.022} color="#000000" opacity={0.55} y={0.054} />
      <Seams shift={PERIMETER / SEAMS / 4 + 0.05} width={0.01} color="#ffffff" opacity={0.1} y={0.055} />
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
