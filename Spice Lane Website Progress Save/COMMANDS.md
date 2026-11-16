# COMMANDS (numbered; working dir = repo root unless noted; app dir = "Spice Lane Website Progress Save/")

### 1. Configure git (session #3)
$ git config --global user.name/email/pull.rebase/credential.helper store ; write ~/.git-credentials
Result: SUCCESS — Configured git credentials (token hidden)

### 2. Clone
$ git clone https://github.com/nomanrafi/Spice-Lane-Website.git project
Result: SUCCESS — 7 commits, assets/ has 8 GLBs (16–20 MB each)

### 3. Create scripts/checkpoint.sh + scripts/autopush.sh (copied from AI_AGENT_INSTRUCTIONS.md §8)
Result: SUCCESS — paths adapted: autopush cd's into the progress folder; checkpoint's "recent files" find prunes */node_modules, */.next, */scripts/logs

### 4. (session #4) npm install  (app dir)
Result: SUCCESS — 585 packages, log scripts/logs/npm-install.log

### 5. npm run build  (app dir)
Result: SUCCESS — placeholder page, log scripts/logs/build-1.log

### 6. npm run optimize-models  (app dir; FORCE=1 to overwrite)
Result: SUCCESS — 8 GLBs 16–20 MB → 0.63–0.89 MB each in public/models/ (log scripts/logs/optimize.log)

### 7. (session #5) Configured git credentials (token hidden); git clone
### 8. git mv app files (src, public, package*.json, configs, .eslintrc, .gitignore, scripts/optimize-models.mjs) → repo root
Result: SUCCESS — optimize script SRC now path.resolve('assets')

### 9. (session #5) npm install + npm run build at repo root
Result: SUCCESS (logs scripts/logs/npm-install-s5.log, build-s5.log)

### 10. (session #5) wrote src/lib/belt.ts (4.1)

### 11. (session #5) wrote src/components/hero/FoodModel.tsx + Plate.tsx (4.2 part 1)

### 12. (session #5) wrote src/components/hero/KaitenTable.tsx + HeroCanvas.tsx (4.2 done)
- S8: npm install (OK, 585 pkgs); npm run build (PASS, / = 162 kB first load)
- S9: Configured git credentials (token hidden); git clone; npm install
- S9: npm install OK; npm run build PASS (/ 172 kB, /checkout, /order/[id])
- S12: npm install OK; npm run build PASS after 8.3+8.4 (logs/build-s12.log)
- S13: npm install OK; npm run build PASS for 8.5 (logs/build-s13.log)
- S13: npm run build PASS for 8.6+8.7 (logs/build-s13b.log)
- S14: Configured git credentials (token hidden); git clone; npm install (bg)
- S14: npm run build PASS for 8.8–8.10, Step 8 complete (logs/build-s14.log)
- S14: npm run build PASS for 9.1+9.2 (logs/build-s14b.log)
- S14: npm run build PASS for 9.3 (logs/build-s14c.log)
- S15: Configured git credentials (token hidden); git clone; npm install (bg); autopush started
- S15: npm run generate-posters → 8 PNGs in public/posters (OK)
- S16: Configured git credentials (token hidden); git clone; npm install (bg); autopush started
- S16: npm install OK; npm run build PASS for 9.4b posters (logs/build-s16.log)
- S16: npx next start -p 3000 (bg); node scripts/shot.mjs → hero-s16.png, menu-s16.png (1 console 404)
- S16: added src/app/icon.svg; npm run build PASS (logs/build-s16b.log)
- S17: Configured git credentials (token hidden); git clone; npm install (bg); autopush started
- S18: Configured git credentials (token hidden); git clone; npm install (bg); autopush started
- S18: npm install OK (585 pkgs); npm run build → logs/build-s18.log
- S18: npm run build PASS (IslandChip); marked Step 10 + DoD done
- S20: Configured git credentials (token hidden); git clone → OK
- S20: npm install → OK; npm run build → PASS (scripts/logs/build-s20.log, /api/order route present)
- S21: Configured git credentials (token hidden); git clone → OK; autopush started
- S21: npm install OK; tsc --noEmit PASS; next lint PASS (0 warnings); npm run build PASS (logs/tsc-s21.log, lint-s21.log, build-s21.log)
- S21: next start + curl smoke: all pages 200, /nope 404, 8 models+8 posters 200, /api/order valid→ok / unknown→400, /api/reserve validates; shot.mjs → hero-s21.png, checkout-s21.png (0 console errors). Found: hero canvas clips table at left/right edges; pause icon glyph renders as boxes
- S21: 12.4 fix: Hero.tsx pause/play glyphs → inline SVG; HeroCanvas.tsx camera [0,5.2,6.2]→[0,6.1,7.3] to stop table clipping at canvas edges (before build)
- S22: Configured git credentials (token hidden); git clone → OK; autopush started
- S22: npm install OK; tsc PASS; next lint PASS; npm run build PASS (logs/*-s22.log)
- S22: 12.4b HeroCanvas.tsx camera [0,6.1,7.3]→[0,6.7,8.0] (table touched both canvas edges on desktop 1440px)
- S23: Configured git credentials (token hidden); git clone; npm ci → OK
- S23: npx next lint → 0 warnings; npx tsc --noEmit → 0; npm run build → PASS (scripts/logs/build-s23.log)
- S23: PORT=3123 npx next start + curl smoke test → all pages 200, POST /api/order 200/400, /api/reserve 400 on invalid
- S24: Configured git credentials (token hidden); git clone; npm ci (bg); autopush started; pdftotext/pdfimages on Update Review.pdf
- S24 13.7/13.8: added src/lib/scrollLock.ts (lenis.stop + overflow hidden, ref-counted); Providers registers lenis; ProductModal + CartDrawer use lockScroll/unlockScroll + data-lenis-prevent; modal max-w 760→1120, viewer h 440→600
- S25: Configured git credentials (token hidden); git clone; npm ci OK; autopush started; pdftoppm review PDF
- S26: Configured git credentials (token hidden); git clone; autopush started; npm ci
- S26: 13.11 Footer.tsx: added 'Made by NOMAN-RAFI' line; build-s25a.log (S25) PASS => 13.7/13.8/13.10 marked done
- S27: Configured git credentials (token hidden); git clone; autopush started; npm ci; pdftoppm review PDF
- S29: Configured git credentials (token hidden); git clone; autopush started; npm ci (bg)
- S29: npm ci OK; verified 13.10 gallery code in Reviews.tsx (posters + captions)
- S29: npm run build → PASS (scripts/logs/build-s29.log)
- S31: Configured git credentials (token hidden); git clone; autopush started; npm ci (bg)
- S31: npm ci OK; npm run build PASS (scripts/logs/build-s31.log)
- S32: Configured git credentials (token hidden); git clone; autopush started; Header.tsx logo bigger (sed)
- S32: npm ci OK; npm run build PASS (scripts/logs/build-s32.log)
- S32: next start :3000 + shots2.mjs → output/preview/hero-s32.jpg, spotlight-s32.jpg (no console errors)
