// S76: screenshot hero at the PDF's 1920x978 viewport (no image viewing needed; analyse with fit-score.py)
import { chromium } from 'playwright';
const [out = '/tmp/fit'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1920, height: 978 } });
const errs=[]; p.on('pageerror', e=>errs.push(String(e)));
await p.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 120000 });
await p.evaluate(() => { const s = document.createElement('style'); s.textContent = '*{transition:none!important}'; document.head.appendChild(s); });
await p.waitForTimeout(12000);
await p.screenshot({ path: `${out}.png` });
console.log('errors', errs.slice(0,3)); await b.close(); process.exit(0);
