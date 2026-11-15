// npm run generate-posters — renders every public/models/*.glb to a transparent 768x768 PNG in public/posters/.
// Posters are used as fallbacks/thumbnails (menu cards, WebGL failure, <noscript>). Needs Playwright + Chromium
// (headless WebGL via SwiftShader). Override the browser with CHROMIUM_PATH if needed.
import http from 'node:http';
import { readFileSync, readdirSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve('.');
const OUT = path.resolve('public', 'posters');
const SIZE = Number(process.env.POSTER_SIZE || 768);
mkdirSync(OUT, { recursive: true });
const models = readdirSync(path.resolve('public', 'models')).filter((f) => f.endsWith('.glb'));

const PAGE = `<!doctype html><html><body style="margin:0;background:transparent">
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const S = ${SIZE};
const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
r.setSize(S, S); r.setClearColor(0, 0); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(r.domElement);
const pmrem = new THREE.PMREMGenerator(r);
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
window.render = async (url) => {
  const scene = new THREE.Scene();
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 4); scene.add(key);
  const gltf = await loader.loadAsync(url);
  const obj = gltf.scene; scene.add(obj);
  const box = new THREE.Box3().setFromObject(obj); const size = box.getSize(new THREE.Vector3()); const c = box.getCenter(new THREE.Vector3());
  obj.position.sub(c);
  const rad = size.length() / 2;
  const cam = new THREE.PerspectiveCamera(30, 1, rad / 100, rad * 100);
  const d = rad / Math.sin(THREE.MathUtils.degToRad(15)) * 0.92;
  cam.position.set(0, d * Math.sin(0.62), d * Math.cos(0.62)); cam.lookAt(0, 0, 0);
  r.render(scene, cam);
  return r.domElement.toDataURL('image/png');
};
window.ready = true;
</script></body></html>`;

const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary', '.html': 'text/html' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.setHeader('content-type', 'text/html'); return res.end(PAGE); }
  const f = path.join(ROOT, u.startsWith('/models/') ? path.join('public', u) : u);
  if (!f.startsWith(ROOT) || !existsSync(f)) { res.statusCode = 404; return res.end(); }
  res.setHeader('content-type', TYPES[path.extname(f)] || 'application/octet-stream');
  res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, ok));
const port = server.address().port;
const exe = process.env.CHROMIUM_PATH || (existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(`http://localhost:${port}/`);
await page.waitForFunction('window.ready === true', null, { timeout: 30000 });
let failed = 0;
for (const f of models) {
  try {
    const data = await page.evaluate((u) => window.render(u), `/models/${f}`);
    const out = path.join(OUT, f.replace(/\.glb$/, '.png'));
    writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
    console.log('poster ->', path.relative(ROOT, out));
  } catch (e) { failed++; console.error('FAILED', f, e.message); }
}
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
