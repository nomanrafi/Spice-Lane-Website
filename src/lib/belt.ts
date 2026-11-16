// S73 (14.1/14.3): table = ONE smooth ELLIPSE like the user's blue marking (Update Review.pdf p1). No straight sides,
// no arcs+flats, no corners. Outer edge = ellipse OUT, middle island = thin ellipse IN (small gap, user request);
// the band is the radial interpolation between them (same ellipse parameter t), so every slat seam runs cleanly from
// island to rim. Plates ride the centre-line (u = 0). Ground ratio 1.7:1 looks ≈2.15:1 on screen at 53° camera tilt.
// Front lane = +Z, moving RIGHT → LEFT as s grows.
export const OUT = { a: 4.75, b: 2.75 } as const;
export const IN = { a: 2.05, b: 0.34 } as const;
export const BELT = { A: (OUT.a + IN.a) / 2, B: (OUT.b + IN.b) / 2, plateR: 1.0, H: (OUT.b - IN.b) / 2, count: 8 } as const;

type P = [number, number];
/** Point across the band at ellipse parameter t: u = −1 island edge … 0 centre-line … +1 outer rim (|u|>1 extrapolates). */
export function bandPoint(t: number, u: number): P {
  const f = (u + 1) / 2, a = IN.a + (OUT.a - IN.a) * f, b = IN.b + (OUT.b - IN.b) * f;
  return [a * Math.cos(t), b * Math.sin(t)];
}
/** Closed outline offset by `off` (world units, measured like BELT.H across the front lane; − = inward). */
export function outline(off: number, steps = 240): P[] {
  return Array.from({ length: steps }, (_, i) => bandPoint((i / steps) * Math.PI * 2, off / BELT.H));
}
const ovalAt = (t: number): P => bandPoint(t, 0);

// Uniform-arc-length lookup, starting at the front-centre (t = π/2) and moving left (t increasing).
const LUT_N = 2048, DN = 8192;
const dense: P[] = []; const cum: number[] = [0];
for (let i = 0; i <= DN; i++) dense.push(ovalAt(Math.PI / 2 + (i / DN) * Math.PI * 2));
for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
export const PERIMETER = cum[cum.length - 1];
export const SLOT = PERIMETER / BELT.count;
const LUT: P[] = []; const LUT_TH: number[] = [];
for (let k = 0, j = 0; k < LUT_N; k++) {
  const target = (k / LUT_N) * PERIMETER;
  while (cum[j + 1] < target) j++;
  const f = (target - cum[j]) / (cum[j + 1] - cum[j] || 1);
  LUT.push([dense[j][0] + (dense[j + 1][0] - dense[j][0]) * f, dense[j][1] + (dense[j + 1][1] - dense[j][1]) * f]);
  LUT_TH.push(Math.PI / 2 + ((j + f) / DN) * Math.PI * 2);
}
const wrapU = (s: number) => ((((s % PERIMETER) + PERIMETER) % PERIMETER) / PERIMETER) * LUT_N;

/** Point on the belt centre-line for arc-length s (any real number, wraps). Returns [x, z]. */
export function beltPoint(s: number): P {
  const u = wrapU(s), i = Math.floor(u) % LUT_N, f = u - Math.floor(u);
  const a = LUT[i], b = LUT[(i + 1) % LUT_N];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}
/** Curve parameter θ for arc-length s (so things that travel with the plates can use bandPoint). */
export function beltTheta(s: number): number {
  const u = wrapU(s), i = Math.floor(u) % LUT_N, f = u - Math.floor(u);
  const a = LUT_TH[i]; let b = LUT_TH[(i + 1) % LUT_N]; if (b < a) b += Math.PI * 2;
  return a + (b - a) * f;
}
/** Unit tangent (direction of travel) and outward normal at arc-length s. */
export function beltFrame(s: number) {
  const [x1, z1] = beltPoint(s - 0.02), [x2, z2] = beltPoint(s + 0.02);
  const l = Math.hypot(x2 - x1, z2 - z1) || 1;
  const tx = (x2 - x1) / l, tz = (z2 - z1) / l;
  return { tx, tz, nx: tz, nz: -tx }; // (tz, −tx) points OUTWARD (front point: t=(−1,0) → n=(0,+1))
}
/** @deprecated old name kept so older imports keep working */
export const stadiumPoint = beltPoint;

/** Arc-length position of the front-centre point (x=0, z=+B). */
export const FRONT_S = 0;

/** Mutable, non-reactive motion state (read/written every frame, never triggers renders). */
export const beltMotion = {
  offset: 0,        // current belt arc-length offset
  velocity: 0,      // current speed (units/s)
  autoSpeed: 0.4,   // cruising speed
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
