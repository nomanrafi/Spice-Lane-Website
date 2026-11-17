import * as THREE from 'three';
import { readFileSync } from 'fs';
import { fitCamera } from '../../src/lib/fitCamera';
const blue: number[][] = JSON.parse(readFileSync('/tmp/blue.json','utf8')).pts;
const Wc = 825.6, Hc = 493.2, FW = 0.82, FH = 0.78;
const xs = blue.map(p=>p[0]), ys = blue.map(p=>p[1]);
const bx0=Math.min(...xs), bx1=Math.max(...xs), by0=Math.min(...ys), by1=Math.max(...ys);
const s = Math.min(FW*Wc/(bx1-bx0), FH*Hc/(by1-by0));
const bcx=(bx0+bx1)/2, bcy=(by0+by1)/2;
// target NDC
const T = blue.map(([x,y]) => [((x-bcx)*s)/(Wc/2), -((y-bcy)*s)/(Hc/2)]);
const cam = new THREE.PerspectiveCamera(32, Wc/Hc, 0.1, 500);
let O: [number,number][] = Array.from({length: T.length}, (_,i)=>{const t=i/T.length*2*Math.PI; return [4.5*Math.cos(t), 3*Math.sin(t)];});
const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0), ray = new THREE.Raycaster(), hit = new THREE.Vector3();
for (let it=0; it<40; it++) {
  fitCamera(cam, O.map(([x,z])=>new THREE.Vector3(x,0,z)), 53, FW, FH);
  O = T.map(([nx,ny]) => { ray.setFromCamera(new THREE.Vector2(nx,ny), cam); ray.ray.intersectPlane(plane, hit); return [hit.x, hit.z] as [number,number]; });
  const zs=O.map(p=>p[1]); const zc=(Math.min(...zs)+Math.max(...zs))/2; O = O.map(([x,z])=>[x, z-zc]);
}
const X=O.map(p=>p[0]), Z=O.map(p=>p[1]);
console.log('extent x', Math.min(...X).toFixed(3), Math.max(...X).toFixed(3), 'z', Math.min(...Z).toFixed(3), Math.max(...Z).toFixed(3));
// polar Fourier fit around origin (least squares, K harmonics)
const K = 12; const phis = O.map(([x,z])=>Math.atan2(z,x)), rs = O.map(([x,z])=>Math.hypot(x,z));
const n = 1+2*(K-1); const A: number[][] = Array.from({length:n},()=>Array(n).fill(0)); const bv = Array(n).fill(0);
const basis = (p:number)=>{const v=[1]; for(let k=1;k<K;k++) v.push(Math.cos(k*p)); for(let k=1;k<K;k++) v.push(Math.sin(k*p)); return v;};
phis.forEach((p,i)=>{const v=basis(p); for(let a=0;a<n;a++){bv[a]+=v[a]*rs[i]; for(let b=0;b<n;b++) A[a][b]+=v[a]*v[b];}});
// gaussian elimination
for(let c=0;c<n;c++){let piv=c; for(let r=c+1;r<n;r++) if(Math.abs(A[r][c])>Math.abs(A[piv][c])) piv=r; [A[c],A[piv]]=[A[piv],A[c]]; [bv[c],bv[piv]]=[bv[piv],bv[c]];
  for(let r=0;r<n;r++){ if(r===c) continue; const f=A[r][c]/A[c][c]; for(let k=c;k<n;k++) A[r][k]-=f*A[c][k]; bv[r]-=f*bv[c]; }}
const coef = bv.map((v,i)=>v/A[i][i]);
const RA=[coef[0], ...coef.slice(1,K)], RB=[0, ...coef.slice(K)];
let err=0; phis.forEach((p,i)=>{const v=basis(p); let r=0; v.forEach((b,j)=>r+=b*coef[j]); err=Math.max(err,Math.abs(r-rs[i]));});
console.log('maxerr', err.toFixed(4));
console.log('const RA = ['+RA.map(v=>v.toFixed(4)).join(', ')+'];');
console.log('const RB = ['+RB.map(v=>v.toFixed(4)).join(', ')+'];');
console.log('OUT', ((Math.max(...X)-Math.min(...X))/2).toFixed(2), ((Math.max(...Z)-Math.min(...Z))/2).toFixed(2), 'xc', ((Math.max(...X)+Math.min(...X))/2).toFixed(3));
