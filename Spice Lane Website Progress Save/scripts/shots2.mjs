// Usage: node "Spice Lane Website Progress Save/scripts/shots2.mjs" <outDir> <tag>  (server on :3000)
// Waits for GLBs, then captures hero, hover, modal, spotlight, reviews, footer.
import { chromium } from 'playwright';
const [dir, tag] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/local/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
await p.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 90000 });
await p.waitForTimeout(15000);
await p.screenshot({ path: `${dir}/hero-${tag}.png` });
const go = async (sel, name, extra = 0) => { await p.evaluate((s) => { const e = document.querySelector(s); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY + 0); }, sel); await p.waitForTimeout(4000 + extra); await p.screenshot({ path: `${dir}/${name}-${tag}.png` }); };
await go('#spotlight', 'spotlight', 4000);
await go('#reviews', 'reviews');
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(3000);
await p.screenshot({ path: `${dir}/footer-${tag}.png` });
console.log('errors:', errs.slice(0, 5));
await b.close(); process.exit(0);
