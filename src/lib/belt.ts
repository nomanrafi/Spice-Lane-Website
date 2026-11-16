// S42 (14.1): table = one big smooth oval (superellipse, like the user's blue marking in Update Review.pdf p1).
// Centre-line |x/A|^n + |z/B|^n = 1 in the XZ plane. The band is built RADIALLY: for curve parameter θ the
// inner edge is curve(θ, A−H, B−H) and the outer edge curve(θ, A+H, B+H) — no offset-curve cusps, small island.
// Front lane = +Z (closest to camera), moving RIGHT → LEFT as arc-length s grows. s = 0 is the front-centre point.
// S45: asymmetric organic oval like the blue mark (right end fuller, left end a bit narrower), thin band gap, big plates.
export const BELT = { A: 4.0, B: 2.35, n: 2.4, asym: 0.07, plateR: 1.12, H: 1.3, count: 8 } as const;

const LUT_N = 1440;
type P = [number, number];
const curve = (th: number, a: number = BELT.A, b: number = BELT.B): P => {
  const c = Math.cos(th), s = Math.sin(th), e = 2 / BELT.n;
  const k = 1 + BELT.asym * c; // fuller right end, narrower left end (organic, not a fixed rectangle/ellipse)
  return [a * Math.sign(c) * Math.abs(c) ** e, b * k * Math.sign(s) * Math.abs(s) ** e];
};
/** Closed outline of a superellipse with semi-axes (a, b) — used for table rim / island shapes. */
export function outline(a: number, b: number, steps = 192): P[] {
  return Array.from({ length: steps }, (_, i) => curve((i / steps) * Math.PI * 2, a, b));
}
/** Point across the band at curve parameter θ: u = −1 inner edge … 0 centre-line … +1 outer edge. */
export function bandPoint(th: number, u: number): P {
  return curve(th, BELT.A + u * BELT.H, BELT.B + u * BELT.H);
}

// Uniform-arc-length lookup table, starting at θ = π/2 (front-centre) with θ increasing (moves left).
const DN = 8192;
const dense: P[] = []; const cum: number[] = [0];
for (let i = 0; i <= DN; i++) dense.push(curve(Math.PI / 2 + (i / DN) * Math.PI * 2));
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
