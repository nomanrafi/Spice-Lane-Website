import * as THREE from 'three';

/**
 * S78 (14.1 ROOT CAUSE "table not visible"): the old iterative fit in HeroCanvas.tsx diverged (D → 0, target z → −3700),
 * so the camera ended up inside/behind the table and nothing was drawn. This version is stable:
 * bisection on distance D (fit width FW / height FH of NDC) + damped vertical centring of the target.
 */
export function fitCamera(cam: THREE.PerspectiveCamera, pts: THREE.Vector3[], elevDeg = 53, FW = 0.9, FH = 0.8) {
  if (!(cam.aspect > 0.05 && cam.aspect < 20)) cam.aspect = 1.6;
  const E = (elevDeg * Math.PI) / 180;
  const v = new THREE.Vector3();
  const tgt = new THREE.Vector3(0, 0, 0);
  const place = (D: number) => {
    cam.position.set(0, tgt.y + D * Math.sin(E), tgt.z + D * Math.cos(E));
    cam.lookAt(tgt); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  };
  const box = () => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { v.copy(p).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    return { x0, x1, y0, y1 };
  };
  let D = 20;
  for (let outer = 0; outer < 12; outer++) {
    let lo = 2, hi = 200;
    for (let i = 0; i < 40; i++) {
      D = (lo + hi) / 2; place(D);
      const b = box();
      const fits = b.x1 - b.x0 <= 2 * FW && b.y1 - b.y0 <= 2 * FH && Number.isFinite(b.x0);
      if (fits) hi = D; else lo = D;
    }
    D = hi; place(D);
    const b = box(); const cy = (b.y1 + b.y0) / 2;
    if (Math.abs(cy) < 0.005) break;
    // positive cy = table sits high on screen → move the look-at point UP the screen (toward the back, −z)
    tgt.z -= cy * D * 0.25;
  }
  // S80 guard: if the canvas had no size yet (aspect NaN/0) or anything went non-finite, use a safe default view
  // so the table is ALWAYS on screen (never an empty canvas).
  const ok = Number.isFinite(D) && Number.isFinite(tgt.z) && Math.abs(tgt.z) < 20 && D > 2 && D < 199;
  if (!ok) { D = 13; tgt.set(0, 0, 0); }
  place(D);
  return { D, target: tgt.clone(), ok };
}
