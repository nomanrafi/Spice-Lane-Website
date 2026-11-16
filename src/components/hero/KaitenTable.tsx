'use client';
import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { MENU, getItem } from '@/data/menu';
import { useStore } from '@/store/useStore';
import { BELT, PERIMETER, bandPoint, beltMotion, beltPoint, beltTheta, frontIndex, outline, plateS } from '@/lib/belt';
import Plate from './Plate';

/**
 * S42 (14.1/14.2/14.3): table = ONE big smooth oval like the user's blue marking (radial superellipse band from
 * src/lib/belt.ts: outer = curve(A+H, B+H), island hole = curve(A−H, B−H)). Plates fill most of the band width,
 * so the middle island is small, like the reference kaiten table.
 */
const ZEBRA = 16;          // slats around the loop = 2 per plate (reference: a few soft slats, not dozens of lines)
const ACROSS = 12;         // segments across the band (makes the seams curved)
const ALONG = 6;           // segments along one slat
const TAU = Math.PI * 2;
/** Crescent bend of a seam: the middle of the seam leads, both ends trail (reference slat look). */
const bend = (u: number) => 0.075 * (1 - u * u) - 0.02 * u;

/** Reusable dynamic triangle-strip grid (rows × cols quads per patch), refilled every frame. */
function useGrid(patches: number, cols: number, rows: number) {
  return useMemo(() => {
    const g = new THREE.BufferGeometry();
    const vp = (cols + 1) * (rows + 1);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(patches * vp * 3), 3));
    const idx: number[] = [];
    for (let p = 0; p < patches; p++) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const a = p * vp + r * (cols + 1) + c, b = a + cols + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    g.setIndex(idx); return g;
  }, [patches, cols, rows]);
}

/** Zebra slats + curved seams that travel with the plates (driven by beltMotion.offset). */
function Zebra() {
  const pitch = PERIMETER / ZEBRA;
  const slats = useGrid(ZEBRA / 2, ACROSS, ALONG);
  const seams = useGrid(ZEBRA, ACROSS, 1);
  const glints = useGrid(ZEBRA, ACROSS, 1);
  useFrame(() => {
    const off = beltMotion.offset + pitch / 2; // seams sit between plates and halfway under them
    const sp = slats.attributes.position as THREE.BufferAttribute;
    let o = 0;
    for (let j = 0; j < ZEBRA; j += 2) {
      const t0 = beltTheta(off + j * pitch), t1 = beltTheta(off + (j + 1) * pitch);
      const d = ((t1 - t0) % TAU + TAU) % TAU;
      for (let r = 0; r <= ALONG; r++) for (let c = 0; c <= ACROSS; c++) {
        const u = (c / ACROSS) * 2 - 1, th = t0 + d * (r / ALONG) + bend(u);
        const [x, z] = bandPoint(th, u * 0.985); sp.setXYZ(o++, x, 0.053, z);
      }
    }
    sp.needsUpdate = true;
    const line = (geo: THREE.BufferGeometry, shift: number, w: number, y: number) => {
      const lp = geo.attributes.position as THREE.BufferAttribute; let k = 0;
      for (let j = 0; j < ZEBRA; j++) {
        const t = beltTheta(off + j * pitch + shift);
        for (let r = 0; r <= 1; r++) for (let c = 0; c <= ACROSS; c++) {
          const u = (c / ACROSS) * 2 - 1, th = t + bend(u);
          const [ax, az] = bandPoint(th - 0.004, u * 0.985), [bx, bz] = bandPoint(th + 0.004, u * 0.985);
          const l = Math.hypot(bx - ax, bz - az) || 1, side = r ? w : -w;
          lp.setXYZ(k++, (ax + bx) / 2 + ((bx - ax) / l) * side, y, (az + bz) / 2 + ((bz - az) / l) * side);
        }
      }
      lp.needsUpdate = true;
    };
    line(seams, 0, 0.018, 0.055);
    line(glints, 0.06, 0.008, 0.056);
  });
  return (
    <group raycast={() => null}>
      <mesh geometry={slats} frustumCulled={false} raycast={() => null}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.045} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={seams} frustumCulled={false} raycast={() => null}>
        <meshBasicMaterial color="#000000" transparent opacity={0.6} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={glints} frustumCulled={false} raycast={() => null}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.09} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

const loop = (a: number, b: number) => outline(a, b, 240).map(([x, z]) => new THREE.Vector2(x, z));

function TableBody() {
  const { top, island, rim } = useMemo(() => {
    const { A, B, H } = BELT;
    const outer = new THREE.Shape(loop(A + H, B + H));
    outer.holes.push(new THREE.Path(loop(A - H, B - H)));
    const ext = { depth: 0.22, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 8 };
    const rimShape = new THREE.Shape(loop(A + H + 0.05, B + H + 0.05));
    rimShape.holes.push(new THREE.Path(loop(A + H - 0.03, B + H - 0.03)));
    return {
      top: new THREE.ExtrudeGeometry(outer, ext),
      island: new THREE.ExtrudeGeometry(new THREE.Shape(loop(A - H - 0.06, B - H - 0.06)), { ...ext, depth: 0.3, bevelSize: 0.08, bevelThickness: 0.08 }),
      rim: new THREE.ShapeGeometry(rimShape),
    };
  }, []);
  return (
    <group>
      <mesh geometry={top} rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#2b2b2b" roughness={0.5} metalness={0.25} />
      </mesh>
      {/* thin light rail along the outer edge (reference: white rim highlight) */}
      <mesh geometry={rim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.052, 0]} raycast={() => null}>
        <meshBasicMaterial color="#b0b0b0" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={island} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.17, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#151515" roughness={0.55} metalness={0.2} />
      </mesh>
      <Zebra />
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
    if (anchor.current && g) anchor.current.position.set(g.position.x, g.position.y + 1.25, g.position.z);
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
