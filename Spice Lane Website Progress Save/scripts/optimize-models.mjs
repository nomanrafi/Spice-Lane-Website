// npm run optimize-models — reads ../assets/*.glb (repo root assets) and writes web-sized copies to public/models/.
// Source GLBs are ~1M verts + 4K textures (16–20 MB). We weld+simplify the mesh, resize textures to 1024 webp,
// and meshopt-compress. Output file names are kebab-case lowercase (e.g. A5-Wagyu-Ribeye.glb → a5-wagyu-ribeye.glb).
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
const SRC = path.resolve('..', 'assets');
const OUT = path.resolve('public', 'models');
const RATIO = process.env.SIMPLIFY_RATIO || '0.04';
const TEX = process.env.TEXTURE_SIZE || '1024';
mkdirSync(OUT, { recursive: true });
const cli = path.resolve('node_modules', '.bin', 'gltf-transform');
for (const f of readdirSync(SRC).filter((x) => x.toLowerCase().endsWith('.glb'))) {
  const out = path.join(OUT, f.toLowerCase());
  if (existsSync(out) && !process.env.FORCE) { console.log('skip (exists)', out); continue; }
  console.log('optimizing', f);
  execFileSync(cli, ['optimize', path.join(SRC, f), out,
    '--compress', 'meshopt', '--simplify-ratio', RATIO, '--simplify-error', '0.002',
    '--texture-compress', 'webp', '--texture-size', TEX], { stdio: 'inherit' });
  console.log('  ->', out, (statSync(out).size / 1e6).toFixed(2), 'MB');
}
