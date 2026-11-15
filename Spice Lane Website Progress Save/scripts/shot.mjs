// Usage: node "Spice Lane Website Progress Save/scripts/shot.mjs" <url> <out.png> [clickSelector]
import { chromium } from 'playwright';
const [url, out, click] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(6000);
if (click) { await p.evaluate(click); await p.waitForTimeout(5000); }
await p.screenshot({ path: out });
console.log('errors:', errs.slice(0, 5));
await b.close(); process.exit(0);
