// (history) S73 (14.1/14.3): table was ONE smooth ELLIPSE like the user's blue marking (Update Review.pdf p1). No straight sides,
// no arcs+flats, no corners. Outer edge = ellipse OUT, middle island = thin ellipse IN (small gap, user request);
// the band is the radial interpolation between them (same ellipse parameter t), so every slat seam runs cleanly from
// island to rim. Plates ride the centre-line (u = 0). Ground ratio 1.7:1 looks ≈2.15:1 on screen at 53° camera tilt.
// Front lane = +Z, moving RIGHT → LEFT as s grows.
// S82 (14.1): OUTER EDGE = the user's hand-drawn BLUE outline (screenshot 1280x652), measured from pixels, smoothed
// (Fourier, 9 terms) and projected from screen onto the table plane with the hero camera (elev 53deg, fov 32).
// So on screen the table rim follows the blue mark (fuller right end, small dip top-middle, wide front).
// S83: S82 coefficients were MIRRORED (screen-up = -z): bump ended up bottom-left. Re-solved by iterative unprojection
// through the real fitCamera (canvas 825x493 @1280x652, fill 82%x78%), 12 harmonics, max err 0.08 (solver: node_modules/.solve.ts, see DECISIONS).
// rOut(phi) = polar radius of the outline around the table centre (x right, z = front). Inner island = thin ellipse.
const RA = [3.9632, 0.1879, 1.1071, -0.1356, -0.1920, -0.0961, -0.1235, 0.0233, 0.0296, 0.0255, 0.0099, -0.0008];
const RB = [0.0000, 0.2974, -0.1884, -0.5152, 0.0143, -0.0671, 0.0739, 0.0689, 0.0135, -0.0001, -0.0251, -0.0088];
const rOut = (phi: number) => { let r = RA[0]; for (let k = 1; k < RA.length; k++) r += RA[k] * Math.cos(k * phi) + RB[k] * Math.sin(k * phi); return r; };
/** Half extents of the blue outline in world units (x, z). */
export const OUT = { a: 4.94, b: 3.5 } as const;
/** S86: middle island = the SAME outline as the table rim, scaled down (KI.x wide, KI.z deep) — not a pill/ellipse. */
// S90 (user 2026-11-18): middle island must follow the TABLE SHAPE → near-uniform scale (was x 0.5 / z 0.12 = thin pill)
// S91 (user 2026-11-18): island still looked like a circle → EXACT uniform scale of the rim (same shape as table)
// S92: front plate overlapped island at the dent → uniform 0.34 (still exact table shape)
// S93 (user 2026-11-18): plates blended into the round island → island shorter front-back, wider left-right.
// Clearance from plate centre-line (min): island 0.55→0.79, rim 0.53→0.74 (scripts check /tmp/clr.ts, plateR 0.78)
export const KI = { x: 0.48, z: 0.22 } as const;
/** S94 (user 2026-11-18): island moved up on screen (−z = back). Plate path follows (band midpoint); clearance isl .79→.96, rim .74→.90. */
export const IZ = -0.35;
export const IN = { a: OUT.a * KI.x, b: OUT.b * KI.z } as const;
/** Plates ride slightly outside the band middle (u = RIDE) so the tight ends never make plates overlap. */
export const RIDE = 0;
const lerp = (i: number, o: number, u: number) => i + (o - i) * ((u + 1) / 2);
export const BELT = { A: lerp(IN.a, OUT.a, RIDE), B: lerp(IN.b, OUT.b, RIDE), plateR: 0.78, H: (OUT.b - IN.b) / 2, count: 8 } as const;

type P = [number, number];
/** Outer rim point for curve parameter t (same t as the inner ellipse, so slat seams run island -> rim cleanly). */
function outerAt(t: number): P {
  const phi = Math.atan2(OUT.b * Math.sin(t), OUT.a * Math.cos(t)), r = rOut(-phi); // S86: mirrored front<->back (user screenshot 2026-11-17)
  return [r * Math.cos(phi), r * Math.sin(phi)];
}
/** Point across the band at parameter t: u = -1 island edge ... 0 centre-line ... +1 outer rim (|u|>1 extrapolates). */
export function bandPoint(t: number, u: number): P {
  const f = (u + 1) / 2, [ox, oz] = outerAt(t), ix = ox * KI.x, iz = oz * KI.z + IZ;
  return [ix + (ox - ix) * f, iz + (oz - iz) * f];
}
/** Closed outline offset by `off` (world units, measured like BELT.H across the front lane; − = inward). */
export function outline(off: number, steps = 240): P[] {
  return Array.from({ length: steps }, (_, i) => bandPoint((i / steps) * Math.PI * 2, off / BELT.H));
}
const ovalAt = (t: number): P => bandPoint(t, RIDE);

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
