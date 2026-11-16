// Stadium (pill) path math + shared belt motion state for the hero kaiten table.
// Path lies in the XZ plane, centred at origin. Front lane = +Z (closest to camera), moving RIGHT → LEFT.
export const BELT = { R: 1.5, L: 3.0, plateR: 0.55, count: 8 } as const;
export const PERIMETER = 2 * BELT.L + 2 * Math.PI * BELT.R;
export const SLOT = PERIMETER / BELT.count;

/** Point on the stadium path for arc-length s (any real number, wraps). Returns [x, z]. */
export function stadiumPoint(s: number): [number, number] {
  const { R, L } = BELT;
  const P = PERIMETER;
  let t = ((s % P) + P) % P;
  const hl = L / 2;
  // segment 1: front straight, x from +hl → -hl at z = +R (moves right → left)
  if (t < L) return [hl - t, R];
  t -= L;
  // segment 2: left semicircle, centre (-hl, 0), angle from 90° → 270°
  if (t < Math.PI * R) { const a = Math.PI / 2 + t / R; return [-hl + R * Math.cos(a), R * Math.sin(a)]; }
  t -= Math.PI * R;
  // segment 3: back straight, x from -hl → +hl at z = -R
  if (t < L) return [-hl + t, -R];
  t -= L;
  // segment 4: right semicircle, centre (+hl, 0), angle from 270° → 450°
  const a = (3 * Math.PI) / 2 + t / R;
  return [hl + R * Math.cos(a), R * Math.sin(a)];
}

/** Arc-length position of the front-centre point (x=0, z=+R). */
export const FRONT_S = BELT.L / 2;

/** Mutable, non-reactive motion state (read/written every frame, never triggers renders). */
export const beltMotion = {
  offset: 0,        // current belt arc-length offset
  velocity: 0,      // current speed (units/s)
  autoSpeed: 0.35,  // cruising speed
  target: null as number | null, // seek target offset (prev/next), null = free running
  dragging: false,
};

/** Arc-length of plate i given the current offset. */
export const plateS = (i: number, offset = beltMotion.offset) => i * SLOT + offset;

/** Index of the plate closest to the front-centre. */
export function frontIndex(offset = beltMotion.offset): number {
  let best = 0, bestD = Infinity;
  for (let i = 0; i < BELT.count; i++) {
    const s = ((plateS(i, offset) % PERIMETER) + PERIMETER) % PERIMETER;
    let d = Math.abs(s - FRONT_S); d = Math.min(d, PERIMETER - d);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/** Seek exactly one slot (dir = +1 next, -1 prev), snapping to slot grid. */
export function seekSlot(dir: 1 | -1) {
  const base = beltMotion.target ?? beltMotion.offset;
  const snapped = Math.round((base - FRONT_S) / SLOT) * SLOT + FRONT_S;
  beltMotion.target = snapped + dir * SLOT;
}
